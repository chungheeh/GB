import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './components/LoginPage.js';
import RegisterPage from './components/RegisterPage.js';
import MainHome from './components/MainHome';
import EditProfile from './components/EditProfile';
import SettingsPage from './components/SettingsPage';
import UserTypeSelectionPage from './components/UserTypeSelectionPage';
import AnswerPage from './components/AnswerPage';
import DashboardPage from './components/DashboardPage';
import ChatbotPage from './components/ChatbotPage';
import YouthPage from './components/ui/youth/YouthPage';
import ChatOnePage from './components/ui/youth/ChatOnePage';
import RequirementsPage from './components/ui/youth/RequirementsPage';
import NoticesPage from './components/ui/youth/NoticesPage';
import FAQPage from './components/ui/youth/FAQPage';
import BasicAnswerPage from './components/ui/youth/BasicAnswerPage';
import AIHelpPage from './components/ui/youth/AIHelpPage';
import './App.css';

// 로그인 상태를 확인하는 ProtectedRoute 컴포넌트
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');

  // 로그인된 경우 history 스택에서 이전 페이지로의 이동을 방지
  React.useEffect(() => {
    if (isAuthenticated) {
      window.history.pushState(null, null, window.location.pathname);
      
      const preventGoBack = (e) => {
        window.history.pushState(null, null, window.location.pathname);
      };
      
      window.addEventListener('popstate', preventGoBack);
      
      return () => {
        window.removeEventListener('popstate', preventGoBack);
      };
    }
  }, [isAuthenticated]);
  
  // 로그인되지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        {/* Tailwind 테스트 제거 */}
        <Routes>
          <Route path="/" element={<UserTypeSelectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/youth" element={<YouthPage />} />
          <Route path="/chat-one" element={<ChatOnePage />} />
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/basic-answer" element={<BasicAnswerPage />} />
          <Route path="/ai-help" element={<AIHelpPage />} />
          
          {/* 보호된 라우트들 */}
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/main" element={
            <ProtectedRoute>
              <MainHome />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/answer" element={
            <ProtectedRoute>
              <AnswerPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          } />
          {/* <Route path="/matching" element={<MatchingPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
