import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Placeholder functions for button clicks
  const handleAccountInfo = () => navigate('/edit-profile');
  const handleNotifications = () => alert('알림 설정 페이지로 이동합니다.');
  const handleQA = () => alert('Q&A 페이지로 이동합니다.');
  const handleNotice = () => alert('공지사항 페이지로 이동합니다.');
  const handleSupport = () => alert('고객센터 페이지로 이동합니다.');

  return (
    <div className="bg-[#FAF3E0] min-h-screen flex justify-center items-center p-4">
      <div className="max-w-[650px] w-full bg-white p-10 rounded-[25px] shadow-lg border-4 border-[#87A96B] relative">
        {/* 뒤로가기 버튼 */}
        <Button 
          variant="ghost" 
          className="absolute top-4 left-5 text-[#87A96B] p-3 hover:bg-transparent hover:text-[#6a8a53] text-xl font-bold flex items-center" 
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> 뒤로가기
        </Button>

        {/* 페이지 제목 */}
        <h1 className="text-center text-4xl font-bold text-[#87A96B] my-12">Settings</h1>

        {/* 설정 버튼 목록 */}
        <div className="space-y-4">
          <Button 
            variant="secondary" 
            className="w-full py-5 text-xl font-bold bg-[#F7C242] hover:bg-[#ffe083] text-black rounded-lg shadow-md" 
            onClick={handleAccountInfo}
          >
            계정 정보
          </Button>
          <Button 
            variant="secondary" 
            className="w-full py-5 text-xl font-bold bg-[#F7C242] hover:bg-[#ffe083] text-black rounded-lg shadow-md" 
            onClick={handleNotifications}
          >
            알림
          </Button>
          <Button 
            variant="secondary" 
            className="w-full py-5 text-xl font-bold bg-[#F7C242] hover:bg-[#ffe083] text-black rounded-lg shadow-md" 
            onClick={handleQA}
          >
            Q&A 질문하기
          </Button>
          <Button 
            variant="secondary" 
            className="w-full py-5 text-xl font-bold bg-[#F7C242] hover:bg-[#ffe083] text-black rounded-lg shadow-md" 
            onClick={handleNotice}
          >
            공지사항
          </Button>
          <Button 
            variant="secondary" 
            className="w-full py-5 text-xl font-bold bg-[#F7C242] hover:bg-[#ffe083] text-black rounded-lg shadow-md" 
            onClick={handleSupport}
          >
            고객센터
          </Button>
        </div>

        {/* 버전 정보 */}
        <p className="text-center text-gray-500 mt-10 text-lg">버전 정보: 0.0.00</p>
      </div>
    </div>
  );
};

export default SettingsPage; 