import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [showFindId, setShowFindId] = useState(false);
  const [showFindPassword, setShowFindPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8888/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '로그인 중 오류가 발생했습니다.');
      }

      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log("로그인 정보 localStorage에 저장됨");
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log("로그인 정보 sessionStorage에 저장됨");
      }

      setMessage('로그인 성공!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="login-container">
      <button onClick={handleBack} className="back-button">
        뒤로가기
      </button>

      <h1>GenBridge 로그인</h1>
      <form onSubmit={handleLogin}>
        <div className="input-container">
          <input
            type="text"
            className="input-field"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="input-container password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="password-toggle-button"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>
        <div className="flex items-center justify-center my-5">
           <input 
            type="checkbox" 
            id="remember-me" 
            checked={rememberMe} 
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-5 w-5 text-[#87A96B] focus:ring-[#87A96B] border-gray-400 rounded mr-2 cursor-pointer" 
          />
          <label htmlFor="remember-me" className="text-lg text-gray-700 cursor-pointer">
            자동 로그인
          </label>
        </div>
        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인하기'}
        </button>
        {message && <p className={`message ${message.includes('성공') ? 'success' : 'error'}`}>{message}</p>}
        
        <div className="links">
          <span className="small-link" onClick={() => setShowFindId(!showFindId)}>
            아이디 찾기
          </span>
          {' | '}
          <span className="small-link" onClick={() => setShowFindPassword(!showFindPassword)}>
            비밀번호 찾기
          </span>
          {' | '}
          <Link to="/register" className="small-link">
            회원가입
          </Link>
        </div>

        {showFindId && (
          <div className="find-form">
            <div className="input-container">
              <input type="text" className="input-field" placeholder="이름을 입력하세요" required />
            </div>
            <div className="input-container">
              <input type="text" className="input-field" placeholder="등록된 핸드폰 번호를 입력하세요" required />
            </div>
            <button type="button" className="button">
              아이디 찾기
            </button>
          </div>
        )}

        {showFindPassword && (
          <div className="find-form">
            <div className="input-container">
              <input type="text" className="input-field" placeholder="아이디를 입력하세요" required />
            </div>
            <div className="input-container">
              <input type="text" className="input-field" placeholder="등록된 핸드폰 번호를 입력하세요" required />
            </div>
            <button type="button" className="button">
              비밀번호 찾기
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginPage; 