const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Load .env file
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import Google AI SDK

const app = express();
const JWT_SECRET = 'your-secret-key'; // Use a strong, environment-specific secret in production
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Get API key from environment variable

// MySQL 연결 설정
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'genbridge',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 데이터베이스 테이블 생성
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('users 테이블이 준비되었습니다.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,                 -- 질문한 사용자 ID
        question_text TEXT NOT NULL,          -- 질문 내용
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 질문 시간
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- users 테이블과 연결 (사용자 삭제 시 질문도 삭제)
      )
    `);
    console.log('questions 테이블이 준비되었습니다.');

    connection.release();
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
  }
}

initializeDatabase();

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  preflightContinue: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OPTIONS 요청 처리
app.options('*', cors());

// === 인증 미들웨어 추가 ===
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // 토큰이 없으면 거부

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.sendStatus(403); // 유효하지 않은 토큰이면 거부
    }
    req.user = user; // { userId: user.id } 가 저장됨
    next(); // 유효하면 다음 미들웨어 또는 라우트 핸들러 실행
  });
};
// =========================

// --- Initialize Google Generative AI --- 
let genAI;
let model;
if (GEMINI_API_KEY) {
  try {
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}); // Or another suitable model
      console.log("Google Generative AI initialized successfully.");
  } catch (error) {
      console.error("Failed to initialize Google Generative AI:", error.message);
      genAI = null; // Mark as not initialized on error
      model = null;
  }
} else {
    console.warn("GEMINI_API_KEY not found in environment variables. Chatbot API will not work.");
}
// -------------------------------------

// 로그인 라우트
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 사용자 찾기
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: '회원 정보가 없습니다.' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: '로그인 성공!',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 회원가입 라우트
app.post('/api/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const { username, password, name, phone } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '아이디와 비밀번호는 필수입니다.' });
    }

    // 이미 존재하는 사용자인지 확인
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const [result] = await pool.query(
      'INSERT INTO users (username, password, name, phone) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, phone]
    );

    console.log('User registered successfully:', { id: result.insertId, username });
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 목록 조회 라우트 (개발용)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, name, phone, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// === 질문 저장 API 엔드포인트 (인증 필요) ===
app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body; // 프론트에서 보낸 질문 텍스트
    const userId = req.user.userId; // 인증 미들웨어에서 설정한 사용자 ID

    if (!text || !userId) {
      return res.status(400).json({ message: '잘못된 요청입니다: 질문 내용 또는 사용자 정보가 없습니다.' });
    }

    console.log(`Saving question for user ${userId}: ${text}`);

    // 데이터베이스에 질문 저장
    const [result] = await pool.query(
      'INSERT INTO questions (user_id, question_text) VALUES (?, ?)',
      [userId, text]
    );

    // 삽입된 질문의 ID를 포함하여 성공 응답 반환 (선택 사항)
    res.status(201).json({ 
        message: '질문이 성공적으로 저장되었습니다.', 
        questionId: result.insertId 
    });

  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ message: '질문 저장 중 서버 오류 발생' });
  }
});
// =======================================

// === 챗봇 API 엔드포인트 (Gemini Only) ===
app.post('/api/chatbot', authenticateToken, async (req, res) => {
  if (!model) { // Check only if Gemini is initialized
    return res.status(503).json({ message: '챗봇 서비스를 현재 사용할 수 없습니다. (설정 오류)' });
  }

  try {
    const { message } = req.body;
    const userId = req.user.userId;
    if (!message) return res.status(400).json({ message: '메시지를 입력해주세요.' });

    console.log(`User ${userId} asked chatbot: ${message}`);

    // 1. Get text response from Gemini
    const result = await model.generateContent(message);
    const response = await result.response;
    const chatbotAnswer = response.text();
    console.log(`Chatbot text response: ${chatbotAnswer}`);

    // 2. Remove speech synthesis part

    // 3. Send only text response back to the client
    res.json({
        answer: chatbotAnswer
        // Remove audioContent field
        // audioContent: ttsResponse.audioContent.toString('base64')
    });

  } catch (error) {
    console.error('Chatbot API error:', error); // Simplified error log
    let errorMessage = '챗봇 처리 중 오류가 발생했습니다.';
    if (error.message && error.message.includes('SAFETY')) {
        errorMessage = '답변 생성 중 안전 관련 문제가 발생했습니다.';
    } else if (error.message && error.message.includes('quota')) {
         errorMessage = 'API 사용량 제한에 도달했습니다.';
    }
    // Remove TTS-specific error message check
    // else if (error.message && error.message.includes('Could not load the default credentials')) {
    //      errorMessage = 'Google Cloud 인증 설정을 확인해주세요. (환경 변수)';
    // }
    // Send only text error message
    res.status(500).json({ answer: errorMessage });
  }
});
// =======================================

// Change the port to 8888 for testing
const PORT = process.env.PORT || 8888; 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 