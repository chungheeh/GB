import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Settings, ArrowLeft, Square } from 'lucide-react';
import './MainHome.css';

// Check for browser support (run once)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = 'ko-KR'; // Set language to Korean
  recognition.interimResults = false; // Get final results only
  recognition.maxAlternatives = 1;
}

const MainHome = () => {
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(recognition); // Use ref to access recognition instance inside handlers

  useEffect(() => {
    console.log("MainHome 페이지 로드 완료");

    // Setup recognition event handlers only if recognition is supported
    const currentRecognition = recognitionRef.current;
    if (!currentRecognition) {
      console.warn("음성 인식이 지원되지 않는 브라우저입니다.");
      return;
    }

    currentRecognition.onstart = () => {
      console.log('음성 인식이 시작되었습니다.');
      setIsListening(true);
    };

    currentRecognition.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      console.log('인식된 텍스트:', text);
      setQuestion(text); // Update the textarea as well
      setIsListening(false); // Automatically stop listening after getting a result
    };

    currentRecognition.onerror = (event) => {
      console.error('음성 인식 오류:', event.error);
       let errorMessage = '음성 인식 중 오류가 발생했습니다.';
        if (event.error === 'no-speech') {
            errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
        } else if (event.error === 'audio-capture') {
            errorMessage = '마이크 접근에 문제가 발생했습니다. 권한을 확인해주세요.';
        } else if (event.error === 'not-allowed') {
            errorMessage = '마이크 사용 권한이 거부되었습니다.';
        }
      alert(errorMessage);
      setIsListening(false);
    };

    currentRecognition.onend = () => {
      console.log('음성 인식이 종료되었습니다.');
      setIsListening(false);
    };

    // Cleanup function to stop recognition if component unmounts while listening
    return () => {
       if (currentRecognition && isListening) {
         currentRecognition.stop();
       }
    };
  }, [isListening]);

  const goBack = () => {
    window.history.back();
  };

  const handleVoiceRecognition = () => {
    const currentRecognition = recognitionRef.current;
    if (!currentRecognition) {
      alert("음성 인식이 지원되지 않는 브라우저입니다.");
      return;
    }

    if (isListening) {
      currentRecognition.stop();
    } else {
      // Check for microphone permission (optional but good practice)
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          currentRecognition.start();
        })
        .catch((err) => {
          console.error('마이크 접근 권한 오류:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              alert('마이크 사용 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
          } else {
              alert('마이크를 사용할 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
          }
        });
    }
  };

  const askQuestion = async () => {
    const questionText = question.trim();
    if (!questionText) {
      alert("질문을 입력하세요!");
      return;
    }

    // Retrieve user info and token from either storage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!storedUser || !token) {
        alert("로그인이 필요합니다.");
        navigate('/login'); // Redirect to login if not logged in
        return;
    }

    const user = JSON.parse(storedUser);

    // --- API Call to save question to database --- 
    try {
      console.log(`Sending question to backend: ${questionText}, User ID: ${user.id}`);
      const response = await fetch('http://localhost:8888/api/questions', { // Adjust endpoint if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the auth token
        },
        body: JSON.stringify({ 
          text: questionText,
          userId: user.id // Send userId along with the question
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        throw new Error(errorData.message || `서버 오류 (${response.status})`);
      }

      setQuestion(""); // Clear the textarea
      // Navigate to the answer page with the question text
      navigate('/answer', { state: { question: questionText } });

    } catch (error) {
      console.error("Error saving question:", error);
      alert(`질문 저장 중 오류 발생: ${error.message}`);
    }
  };

  return (
    <div className="main-container">
      <div className="question-card">
        <div className="header-area">
          <button className="back-button" onClick={goBack}>
            <ArrowLeft size={24} /> <span>뒤로가기</span>
          </button>
          <div className="header-center"></div>
          <button className="settings-button" onClick={() => navigate('/settings')}>
            <Settings size={24} />
          </button>
        </div>
        
        <div className="content">
          <h1 className="title">GenBridge</h1>
          <h2 className="subtitle">궁금하시면 언제든지 물어보세요!</h2>
          
          <textarea 
            className="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="질문을 입력하세요..."
          />
          
          <div className="voice-container">
            <button 
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceRecognition}
            >
              {isListening ? (
                <Square size={40} className="mic-icon" />
              ) : (
                <Mic size={40} className="mic-icon" />
              )}
            </button>
            <p className="voice-prompt">
              {isListening ? '듣고 있습니다...' : '눌러서 질문 말하기'}
            </p>
          </div>
          
          <button className="submit-button" onClick={askQuestion}>
            질문하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainHome; 