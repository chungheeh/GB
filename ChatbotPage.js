import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Mic, Send, Volume2, StopCircle, ArrowLeft } from 'lucide-react';
import './ChatbotPage.css';

// === Web Speech API Setup ===
// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

// Speech Synthesis
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();
// ============================

const ChatbotPage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(''); 
  const [messages, setMessages] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [isListening, setIsListening] = useState(false); 
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [tokenExpired, setTokenExpired] = useState(false);
  const recognitionRef = useRef(recognition);
  const messagesEndRef = useRef(null); 

  // Function to scroll chat to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); 

  // 텍스트 포맷팅 함수 개선
  const formatBotMessage = (text) => {
    if (!text) return '';
    
    // 1. ** 강조 구문을 HTML <strong> 태그로 변환
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // 2. 문단 구분: 마침표, 물음표, 느낌표 뒤에 줄바꿈 추가
    text = text.replace(/([.?!])\s+/g, '$1\n');
    
    // 3. 특수 문자 구분자(:, 등) 뒤에 줄바꿈 추가
    text = text.replace(/(:)\s+/g, '$1\n');
    
    // 4. 번호 목록 앞에 줄바꿈 추가
    text = text.replace(/\n?(\d+\.\s+)/g, '\n$1');
    
    // 5. 과도한 줄바꿈 정리
    text = text.replace(/\n{3,}/g, '\n\n');
    
    return text;
  };

  // 메모이제이션된 sendMessage 함수 생성
  const sendMessage = useCallback(async (textToSend) => {
    const userMessage = textToSend.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue(''); 
    setIsLoading(true);

    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) throw new Error("로그인이 필요합니다.");

        const response = await fetch('http://localhost:8888/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            const errData = await response.json().catch(()=>({}));
            
            // JWT 토큰 만료 확인
            if (errData.message?.includes('expired') || 
                response.status === 403 || response.status === 401) {
                setTokenExpired(true);
                throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
            }
            
            throw new Error(errData.message || `서버 오류 (${response.status})`);
        }

        const data = await response.json();
        const formattedAnswer = formatBotMessage(data.answer);
        setMessages(prev => [...prev, { sender: 'bot', text: formattedAnswer }]);
        speakText(data.answer); 

    } catch (error) {
        console.error("Chatbot API error:", error);
        setMessages(prev => [...prev, { sender: 'bot', text: `오류: ${error.message}` }]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // --- Speech Recognition Handlers ---
  useEffect(() => {
    const currentRecognition = recognitionRef.current;
    if (!currentRecognition) return;

    currentRecognition.onstart = () => setIsListening(true);
    currentRecognition.onend = () => setIsListening(false);
    currentRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert(`음성 인식 오류: ${event.error === 'no-speech' ? '음성 없음' : event.error}`);
        setIsListening(false);
    };
    currentRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInputValue(transcript);
        // 음성 인식 결과를 얻은 후 바로 메시지 전송
        sendMessage(transcript);
    };

     return () => { // Cleanup
         if (currentRecognition && isListening) {
             currentRecognition.stop();
         }
     };
  }, [isListening, sendMessage]);

  // --- Speech Synthesis Handlers ---
   useEffect(() => {
     utterance.onstart = () => setIsSpeaking(true);
     utterance.onend = () => setIsSpeaking(false);
     utterance.onerror = (event) => {
       console.error("Speech synthesis error:", event.error);
       alert('답변 읽어주기 중 오류가 발생했습니다.');
       setIsSpeaking(false);
     };
     return () => { // Cleanup
       if (synth && synth.speaking) {
         synth.cancel();
       }
     };
   }, []);

  // --- Core Functions ---
  const handleVoiceInput = () => {
    if (!recognition) return alert("음성 인식이 지원되지 않는 브라우저입니다.");
    if (isListening) {
      recognition.stop();
    } else {
       navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
           setInputValue(''); 
           recognition.start();
       }).catch(err => alert('마이크 권한이 필요합니다.'));
    }
  };

  const speakText = (textToSpeak) => {
      if (!synth || !textToSpeak) return;
      if (synth.speaking) synth.cancel(); 
      utterance.text = textToSpeak;
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      synth.speak(utterance);
  };

  const stopSpeaking = () => {
      if (synth.speaking) synth.cancel();
      setIsSpeaking(false);
  };

  const handleTextInputSend = () => {
      sendMessage(inputValue);
  };
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      sendMessage(inputValue);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="back-button"
          aria-label="뒤로 가기"
        >
          <ArrowLeft size={24} />
        </Button>
        
        <h1 className="header-title">챗봇과 대화하기</h1>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={isSpeaking ? stopSpeaking : () => speakText(messages[messages.length-1]?.text)}
          disabled={!synth || messages.length === 0 || messages[messages.length-1]?.sender !== 'bot'}
          className={isSpeaking ? 'speaking-button' : 'speak-button'}
          aria-label={isSpeaking ? "읽기 중지" : "마지막 답변 읽기"}
        >
          {isSpeaking ? <StopCircle size={28} /> : <Volume2 size={28} />}
        </Button>
      </div>

      {/* 토큰 만료 알림 */}
      {tokenExpired && (
        <div className="token-expired-alert">
          <p>로그인 세션이 만료되었습니다.</p>
          <Button onClick={handleLogin} className="login-button">
            다시 로그인하기
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.sender === 'user' ? 'user-message-container' : 'bot-message-container'} message-spacing`}>
            <div className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
              {msg.sender === 'bot' ? (
                <p dangerouslySetInnerHTML={{ __html: msg.text }} />
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="bot-message-container message-spacing">
            <div className="message-bubble loading-message">
              <p>답변 생성 중...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice or Empty Area - show for all states */}
      <div className="voice-input-area">
        <div 
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
        >
          <Mic size={80} color={'#333'} />
        </div>
        
        <p className="voice-prompt">
          마이크를 눌러 말씀하세요
        </p>
        
        {isListening && (
          <div className="voice-wave">
            {Array(15).fill().map((_, i) => (
              <div 
                key={i} 
                className="wave-bar"
                style={{
                  height: `${Math.sin(i/3) * 20 + 25}px`,
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area - Just text input and send button */}
      <div className="input-area">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress} 
          placeholder="메시지를 입력하세요..."
          className="message-input"
        />
        
        <Button 
          variant="secondary" 
          onClick={handleTextInputSend}
          disabled={!inputValue.trim() || isLoading}
          className="send-button"
          aria-label="메시지 전송"
        >
          <Send size={24} />
        </Button>
      </div>
    </div>
  );
};

export default ChatbotPage; 