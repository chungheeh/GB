import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button'; // Assuming Shadcn Button is used

const UserTypeSelectionPage = () => {
  const navigate = useNavigate();

  const handleSeniorClick = () => {
    // "노인" 버튼 클릭 시 로그인 페이지로 이동
    navigate('/login');
  };

  const handleYouthClick = () => {
    // "청년" 버튼 클릭 시 동작 (추후 정의)
    alert('청년 모드는 준비 중입니다.');
  };

  const handleExitClick = () => {
    // "EXIT" 버튼 클릭 시 동작 (예: 앱 종료 또는 이전 단계)
    // 웹 앱에서는 보통 창을 닫거나 특정 페이지로 리디렉션
    window.close(); // Note: This might not work in all browsers due to security restrictions
    // Alternatively, navigate to a neutral page or show a message
    // navigate('/'); // Or navigate somewhere specific if needed
  };

  return (
    <div className="bg-[#FAF3E0] min-h-screen flex justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md relative">
        {/* EXIT 버튼 */}
        <Button 
          variant="ghost" 
          className="absolute top-4 left-4 text-gray-700 hover:bg-gray-200 font-semibold"
          onClick={handleExitClick}
        >
          EXIT
        </Button>

        <div className="text-center mt-12"> {/* Add margin top to avoid overlap with EXIT */}
          {/* 로고 */}
          <h1 className="text-3xl font-bold text-black mb-4">GenBridge</h1>
          
          {/* 부제 */}
          <p className="text-gray-600 mb-8">개인에 맞게 버튼을 눌러주세요</p>

          {/* 버튼 그룹 */}
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" // Shadcn outline variant often has a gray look
              className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-6 py-2 rounded"
              onClick={handleSeniorClick}
            >
              노인
            </Button>
            <Button 
              variant="outline" 
              className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-6 py-2 rounded"
              onClick={handleYouthClick}
            >
              청년
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelectionPage; 