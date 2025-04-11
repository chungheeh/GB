import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button'; // shadcn/ui 버튼 사용 가정
import { HelpCircle, Users, MessageSquare } from 'lucide-react'; // 예시 아이콘

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path === '/matching') {
        alert('매칭 기능은 현재 준비 중입니다.'); // 준비 중 알림
        // 또는 navigate('/matching'); // 임시 페이지로 이동
    } else {
        navigate(path);
    }
  };

  // 각 기능 박스 스타일 정의 (Tailwind 사용)
  const boxStyle = "flex flex-col items-center justify-center p-6 md:p-8 rounded-xl shadow-lg text-white font-bold text-xl md:text-2xl h-40 md:h-48 cursor-pointer transform transition-transform hover:scale-105";

  return (
    <div className="bg-[#FAF3E0] min-h-screen flex justify-center items-center p-4">
      <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-[25px] shadow-lg border-4 border-[#87A96B] relative">
        
        <h1 className="text-center text-3xl md:text-4xl font-bold text-[#87A96B] mb-10 md:mb-12">무엇을 도와드릴까요?</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* 질문하기 버튼 */}
          <div 
            className={`${boxStyle} bg-gradient-to-br from-green-500 to-green-700`}
            onClick={() => handleNavigation('/main')}
          >
            <HelpCircle size={48} className="mb-3" />
            <span>질문하기</span>
          </div>

          {/* 매칭하기 버튼 */}
          <div 
            className={`${boxStyle} bg-gradient-to-br from-yellow-500 to-yellow-700`}
            onClick={() => handleNavigation('/matching')} 
          >
            <Users size={48} className="mb-3" />
            <span>매칭하기</span>
          </div>

          {/* 챗봇에게 물어보기 버튼 */}
          <div 
            className={`${boxStyle} bg-gradient-to-br from-blue-500 to-blue-700`}
            onClick={() => handleNavigation('/chatbot')}
          >
            <MessageSquare size={48} className="mb-3" />
            <span>챗봇에게<br/>물어보기</span> {/* 줄바꿈 예시 */}
          </div>
          
          {/* 필요시 추가 기능 버튼 */}
          {/* 
          <div 
            className={`${boxStyle} bg-gradient-to-br from-gray-500 to-gray-700`}
            onClick={() => navigate('/settings')} // 설정 페이지 예시
          >
            <Settings size={48} className="mb-3" />
            <span>설정</span>
          </div> 
          */}
        </div>

        {/* 로그아웃 버튼 등 추가 가능 */}
        {/* 
        <div className="mt-10 text-center">
            <Button variant="outline" onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate('/login'); }}>
                로그아웃
            </Button>
        </div> 
        */}
      </div>
    </div>
  );
};

export default DashboardPage; 