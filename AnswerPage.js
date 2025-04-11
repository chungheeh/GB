import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, Volume2, StopCircle } from 'lucide-react';

// === 룰베이스 답변 데이터 ===
// 키워드 배열에 포함된 단어가 질문에 있으면 해당 답변을 보여줍니다.
// 순서가 중요합니다. 더 구체적인 키워드를 위에 배치하세요.
const qaDatabase = [
  {
    keywords: ['키오스크', '무인 주문', 'kiosk', '화면 주문'],
    answer: `키오스크는 화면을 터치하여 주문과 결제를 할 수 있는 무인 주문기입니다. \n\n키오스크 사용법은 다음과 같습니다:\n1. 키오스크 화면을 터치하여 메뉴를 확인합니다.\n2. 주문할 메뉴를 선택합니다.\n3. 원하는 옵션(수량, 크기 등)을 선택합니다.\n4. 장바구니에 담거나 바로 결제를 진행합니다.\n5. '결제하기'를 누릅니다.\n6. 주문 정보를 다시 한번 확인합니다.\n7. 매장에서 드실지('매장'), 가져가실지('포장') 선택합니다.\n8. 결제 방법을 선택합니다(카드, 간편결제 등).\n9. 카드 결제 시: 카드 투입구에 카드를 꽂거나(IC칩 방향 확인), 카드 대는 곳에 카드를 대세요.\n10. 간편결제(삼성페이, 카카오페이 등): 화면 안내에 따라 휴대폰을 특정 위치에 대거나 QR코드를 스캔하세요.\n11. 결제가 완료되면 영수증과 주문 번호를 받습니다.\n\n팁: 잘못 눌렀을 경우 '취소' 또는 '이전' 버튼을 찾아 누르세요. 화면의 글씨가 작다면 직원에게 도움을 요청해도 좋습니다.`
  },
  {
    keywords: ['스마트폰', '휴대폰', '핸드폰', '어플', '앱', '사용법'],
    answer: `스마트폰은 전화, 문자 메시지 외에도 인터넷 검색, 사진 촬영, 길 찾기(지도), 다양한 앱(어플) 사용 등 많은 기능을 제공합니다.\n\n기본적인 사용법:\n- 화면 켜기/끄기: 옆면 또는 뒷면의 전원 버튼을 짧게 누릅니다.\n- 앱 실행: 화면에서 원하는 앱 아이콘을 손가락으로 가볍게 누릅니다(터치).\n- 뒤로 가기: 보통 화면 하단에 있는 '<' 모양 버튼이나, 화면 가장자리를 안쪽으로 밀면 이전 화면으로 돌아갑니다.\n- 홈 화면 가기: 화면 하단의 동그라미(○) 또는 네모(□) 모양 버튼을 누르면 어떤 화면에서든 기본 화면으로 돌아옵니다.\n- 앱 종료: 홈 화면 버튼 옆의 줄 세 개(≡) 또는 네모 두 개 겹친 모양 버튼을 누르면 최근 사용한 앱 목록이 나옵니다. 여기서 앱을 위로 밀거나 '모두 닫기'를 누르면 종료됩니다.\n\n궁금한 기능(예: '카카오톡 사용법', '사진 보내는 법')을 구체적으로 질문해주시면 더 자세히 알려드릴 수 있습니다.`
  },
  {
    keywords: ['병원 예약', '진료 예약', '병원 접수'],
    answer: `병원 예약은 여러 가지 방법으로 할 수 있습니다.\n\n1. 전화 예약: 병원 대표 전화번호로 전화하여 원하는 날짜와 시간을 말씀하시고 예약합니다.\n2. 인터넷 예약: 병원 홈페이지나 건강 관련 포털 사이트(예: 똑닥)에서 온라인으로 예약합니다.\n3. 병원 앱 예약: 해당 병원에서 자체 앱을 운영하는 경우, 앱을 설치하여 예약할 수 있습니다.\n4. 직접 방문 예약: 병원에 직접 방문하여 다음 진료를 예약합니다.\n\n예약 시 필요한 정보:\n- 본인 이름과 주민등록번호 또는 환자 등록번호\n- 원하는 진료과 및 의사 이름 (선택 사항)\n- 원하는 날짜와 시간대\n- 연락 가능한 전화번호\n\n예약 후에는 예약 날짜와 시간을 잘 기억해두시고, 변경이나 취소가 필요하면 미리 병원에 연락하는 것이 좋습니다.`
  },
   {
    keywords: ['버스', '지하철', '대중교통', '교통카드'],
    answer: `버스나 지하철 등 대중교통 이용 시 교통카드를 사용하면 편리합니다.\n\n- 교통카드 종류: 선불카드(미리 돈을 충전해서 사용), 후불카드(신용카드/체크카드에 교통 기능 추가), 모바일 교통카드(스마트폰 앱 이용)\n- 버스 탈 때: 앞문으로 타면서 카드 단말기에 카드를 가볍게 대면 '삑' 소리와 함께 요금이 결제됩니다.\n- 버스 내릴 때: 뒷문으로 내리면서 카드 단말기에 카드를 다시 대면 환승 할인을 받을 수 있습니다. (환승 안 하면 안 찍어도 됩니다)\n- 지하철 탈 때: 개찰구 카드 대는 곳에 카드를 대면 문이 열립니다.\n- 지하철 내릴 때: 나가는 개찰구 카드 대는 곳에 카드를 대면 문이 열립니다. (거리에 따라 추가 요금이 발생할 수 있습니다)\n\n잔액 확인: 버스/지하철 단말기, 편의점, 은행 ATM, 지하철역 충전기 등에서 잔액을 확인할 수 있습니다. (선불카드)\n충전: 편의점, 지하철역 충전기 등에서 현금으로 충전할 수 있습니다. (선불카드)`
  },
  // 추가적인 Q&A 데이터...
  {
    keywords: [], // 어떤 키워드에도 해당하지 않을 때의 기본 답변
    answer: "죄송합니다. 질문을 명확히 이해하지 못했습니다. 조금 더 구체적으로 질문해주시거나 다른 방식으로 질문해주시겠어요?"
  }
];

// 질문 텍스트와 데이터베이스를 비교하여 답변을 찾는 함수
const findAnswer = (question) => {
  const lowerCaseQuestion = question.toLowerCase();
  for (const qa of qaDatabase) {
    // keywords 배열의 모든 키워드를 확인
    if (qa.keywords.length === 0) continue; // 기본 답변은 마지막에 처리
    const foundKeyword = qa.keywords.some(keyword => lowerCaseQuestion.includes(keyword.toLowerCase()));
    if (foundKeyword) {
      return qa.answer;
    }
  }
  // 매칭되는 키워드가 없으면 기본 답변 반환
  return qaDatabase.find(qa => qa.keywords.length === 0)?.answer || "죄송합니다. 답변을 찾을 수 없습니다.";
};

// Check for browser support for Speech Synthesis
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();

const AnswerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const question = location.state?.question || "질문을 불러오지 못했습니다.";
  const answer = findAnswer(question);
  const [isSpeaking, setIsSpeaking] = useState(false); // State for speech synthesis

  // Function to read the answer aloud
  const speakAnswer = () => {
    if (!synth || !answer || answer.includes("불러오지 못했습니다")) return;

    if (synth.speaking && isSpeaking) {
      synth.cancel(); // Stop speaking if already speaking
      setIsSpeaking(false);
    } else {
      utterance.text = answer; // Set the text to speak
      utterance.lang = 'ko-KR'; // Set language to Korean
       utterance.rate = 0.9; // Adjust speech rate slightly slower
       utterance.pitch = 1; // Default pitch

      // Event handlers for utterance
       utterance.onstart = () => {
         console.log("Speech synthesis started.");
         setIsSpeaking(true);
       };
       utterance.onend = () => {
         console.log("Speech synthesis finished.");
         setIsSpeaking(false);
       };
       utterance.onerror = (event) => {
         console.error("Speech synthesis error:", event.error);
         alert('답변 읽어주기 중 오류가 발생했습니다.');
         setIsSpeaking(false);
       };

      synth.speak(utterance); // Start speaking
    }
  };

  // Cleanup speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  const goBack = () => {
    if (synth.speaking) synth.cancel(); // Stop speech before going back
    navigate(-1);
  };

  return (
    <div className="bg-[#FAF3E0] min-h-screen flex justify-center items-center p-4">
      <div className="max-w-[800px] w-full bg-white p-8 md:p-12 rounded-[25px] shadow-lg border-4 border-[#87A96B] relative">
        <Button
          variant="ghost"
          className="absolute top-5 left-6 text-[#87A96B] p-3 hover:bg-transparent hover:text-[#6a8a53] text-xl md:text-2xl font-bold flex items-center"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-6 w-6 md:h-7 md:w-7" /> 뒤로가기
        </Button>

        <h1 className="text-center text-3xl md:text-4xl font-bold text-[#87A96B] my-10">답변</h1>

        <div className="mb-6 p-5 border border-gray-300 rounded-lg bg-gray-50">
          <p className="text-xl md:text-2xl font-semibold text-gray-600 mb-2">질문:</p>
          <p className="text-2xl md:text-3xl text-gray-800">{question}</p>
        </div>

        <div className="mb-8 p-5 border-2 border-[#87A96B] rounded-lg bg-white relative">
           <div className="flex justify-between items-start">
             <p className="text-xl md:text-2xl font-semibold text-[#6a8a53] mb-3">답변:</p>
             <Button
               variant="outline"
               size="icon"
               onClick={speakAnswer}
               disabled={!synth || answer.includes("불러오지 못했습니다") || answer.includes("찾을 수 없습니다") }
               className={`ml-4 p-2 rounded-full ${isSpeaking ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
               aria-label={isSpeaking ? "읽기 중지" : "답변 읽어주기"}
            >
              {isSpeaking ? <StopCircle className="h-7 w-7 md:h-8 md:w-8" /> : <Volume2 className="h-7 w-7 md:h-8 md:w-8" />} 
            </Button>
           </div>
          <p className="text-2xl md:text-3xl text-black leading-relaxed md:leading-loose whitespace-pre-wrap">
            {answer}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AnswerPage; 