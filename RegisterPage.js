import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import TermsAgreement from './TermsAgreement';

const AccountCreation = ({ 
  formData, 
  handleChange, 
  handleUsernameCheck,
  isUsernameChecked,
  isUsernameAvailable,
  usernameCheckMessage,
  isPasswordValid,
  passwordValidationMessage,
  message, 
  isLoading 
}) => (
  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">계정 생성</h2>
    
    <div className="input-container">
      <label htmlFor="username" className="block mb-1 font-medium text-gray-700">아이디</label>
      <div className="flex items-center space-x-2">
        <input
          type="text" id="username" name="username" placeholder="아이디 입력"
          className={`input-field flex-grow ${usernameCheckMessage && !isUsernameAvailable ? 'border-red-500' : (isUsernameAvailable ? 'border-green-500' : '')}`}
          value={formData.username}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <Button 
          type="button"
          variant="outline"
          onClick={handleUsernameCheck}
          disabled={!formData.username || isLoading}
          className="py-2 px-4 border border-[#A0522D] text-[#A0522D] hover:bg-[#f5f0e8] rounded-lg font-semibold whitespace-nowrap"
        >
          중복 확인
        </Button>
      </div>
      {usernameCheckMessage && (
          <p className={`mt-1 text-sm ${isUsernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {usernameCheckMessage}
          </p>
      )}
    </div>

    <div className="input-container">
      <label htmlFor="password" className="block mb-1 font-medium text-gray-700">비밀번호</label>
      <input
        type="password" id="password" name="password" placeholder="영문, 숫자 포함 8자 이상"
        className={`input-field ${formData.password && !isPasswordValid ? 'border-red-500' : (isPasswordValid ? 'border-green-500' : '')}`}
        value={formData.password}
        onChange={handleChange}
        required
        disabled={isLoading}
      />
      {formData.password && !isPasswordValid && (
        <p className="mt-1 text-sm text-red-600">{passwordValidationMessage}</p>
      )}
       {isPasswordValid && (
         <p className="mt-1 text-sm text-green-600">사용 가능한 비밀번호입니다.</p>
       )}
    </div>

    <div className="input-container">
      <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">비밀번호 확인</label>
      <input
        type="password" id="confirmPassword" name="confirmPassword" placeholder="비밀번호 다시 입력"
        className={`input-field ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : (formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500' : '')}`}
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        disabled={isLoading}
      />
      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">비밀번호가 일치하지 않습니다.</p>
      )}
    </div>

    <div className="input-container">
      <label htmlFor="name" className="block mb-1 font-medium text-gray-700">이름</label>
      <input
        type="text" id="name" name="name" placeholder="이름 입력"
        className="input-field"
        value={formData.name}
        onChange={handleChange}
        required
        disabled={isLoading}
      />
    </div>

    <div className="input-container">
      <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">핸드폰 번호</label>
      <input
        type="tel" id="phone" name="phone" placeholder="'-' 없이 숫자만 입력"
        className="input-field"
        value={formData.phone}
        onChange={handleChange}
        required
        disabled={isLoading}
      />
    </div>
    
    {message && <p className={`message ${message.includes('성공') || message.includes('완료') ? 'success' : 'error'}`}>{message}</p>}
  </form>
);

const RegistrationComplete = () => (
  <div className="text-center py-10">
    <h2 className="text-3xl font-bold text-primary mb-4">회원가입 완료!</h2>
    <p className="text-lg text-gray-600">GenBridge 회원이 되신 것을 환영합니다.</p>
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, thirdParty: false });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [usernameCheckMessage, setUsernameCheckMessage] = useState('');

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.');

  useEffect(() => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isValid = passwordRegex.test(formData.password);
    setIsPasswordValid(isValid);
    if (formData.password && !isValid) {
       setPasswordValidationMessage('비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.');
    } else {
        setPasswordValidationMessage('');
    }
  }, [formData.password]);

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setStep(step - 1);
      setMessage('');
      setUsernameCheckMessage('');
    }
  };

  const handleUsernameCheck = async () => {
    setMessage('');
    setUsernameCheckMessage('확인 중...');
    setIsLoading(true);
    setIsUsernameChecked(false);

    // --- TEMPORARY FRONTEND MOCK --- 
    // This simulates the backend response. Remove this section 
    // and uncomment the actual fetch call below when the backend API is ready.
    console.warn("Using temporary frontend mock for username check!");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    try {
      const usernameToCheck = formData.username.toLowerCase();
      const isAvailable = usernameToCheck !== 'id123'; 

      setIsUsernameAvailable(isAvailable);
      setUsernameCheckMessage(isAvailable ? '사용 가능한 아이디입니다.' : '중복확인됩니다');
      setIsUsernameChecked(true);
      setIsLoading(false);
    } catch (error) {
       // Handle unexpected errors during mock processing if any
       console.error("Mock username check error:", error);
      setUsernameCheckMessage(`임시 확인 중 오류: ${error.message}`);
      setIsUsernameAvailable(false);
      setIsUsernameChecked(false);
      setIsLoading(false);
    }
    // --- END OF TEMPORARY MOCK ---

    /* 
    // --- ACTUAL API CALL (Uncomment when backend is ready) ---
    try {
      const response = await fetch(`http://localhost:8888/api/check-username/${formData.username}`); 
      
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
          const errorText = await response.text();
          console.error('Non-JSON response received:', errorText);
           let errorMessage = `서버 응답 오류 (${response.status})`;
           try {
               const errorJson = JSON.parse(errorText);
               errorMessage = errorJson.message || errorMessage;
           } catch (e) {
               if (errorText.trim().startsWith('<')) {
                   errorMessage = '서버에서 예기치 않은 응답(HTML)을 받았습니다. API 경로 또는 서버 설정을 확인하세요.';
               }
            }
           throw new Error(errorMessage);
       }

       const data = await response.json(); 
       
      setIsUsernameAvailable(data.available);
      setUsernameCheckMessage(data.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.');
      setIsUsernameChecked(true);

    } catch (error) {
      console.error("Username check error:", error);
      setUsernameCheckMessage(`오류: ${error.message}`);
      setIsUsernameAvailable(false);
      setIsUsernameChecked(false);
    } finally {
      setIsLoading(false);
    }
    // --- END OF ACTUAL API CALL ---
    */
  };

  const handleNext = async () => {
    setMessage('');
    if (step === 1) {
      if (!agreements.terms || !agreements.privacy) {
        setMessage('필수 약관에 동의해주세요.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!isUsernameChecked || !isUsernameAvailable) {
        setMessage('아이디 중복 확인을 완료해주세요.');
        return;
      }
      if (!isPasswordValid) {
        setMessage(passwordValidationMessage || '비밀번호 형식이 올바르지 않습니다.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (!formData.name || !formData.phone) {
        setMessage('이름과 핸드폰 번호를 입력해주세요.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8888/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
          }),
        });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || '회원가입 중 오류 발생'); }
        setStep(3);
      } catch (error) {
        setMessage(error.message || '회원가입 중 오류가 발생했습니다.');
        console.error('Registration error:', error);
      } finally { setIsLoading(false); }
    }
  };

  const handleAgreementChange = (id, isChecked) => {
    if (id === 'all') {
      setAgreements({
        terms: isChecked,
        privacy: isChecked,
        thirdParty: isChecked, 
      });
    } else {
      setAgreements(prev => ({ ...prev, [id]: isChecked }));
    }
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage('');

    if (name === 'username') {
      setIsUsernameChecked(false);
      setIsUsernameAvailable(false);
      setUsernameCheckMessage('');
    }
  };

  const isNextDisabled = 
     (step === 1 && (!agreements.terms || !agreements.privacy)) ||
     (step === 2 && (!isUsernameChecked || !isUsernameAvailable || !isPasswordValid || formData.password !== formData.confirmPassword || !formData.name || !formData.phone));

  const StepIndicator = ({ currentStep }) => (
    <div className="flex justify-center items-center mb-8 space-x-0 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300" style={{ zIndex: 0, transform: 'translateY(-50%)' }}></div>

      <div className={`flex items-center px-6 py-2 rounded-l-full z-10 ${currentStep >= 1 ? 'bg-[#A0522D] text-white' : 'bg-gray-200 text-gray-500'}`}>
        <span className="font-semibold">약관동의</span>
      </div>
      <div className="step-arrow" style={{ borderLeftColor: currentStep >= 1 ? '#A0522D' : '#e5e7eb' }}></div>

      <div className={`flex items-center px-6 py-2 z-10 ${currentStep >= 2 ? 'bg-[#A0522D] text-white' : 'bg-gray-200 text-gray-500'}`}>
        <span className="font-semibold">계정생성</span>
      </div>
      <div className="step-arrow" style={{ borderLeftColor: currentStep >= 2 ? '#A0522D' : '#e5e7eb' }}></div>

      <div className={`flex items-center px-6 py-2 rounded-r-full z-10 ${currentStep >= 3 ? 'bg-[#A0522D] text-white' : 'bg-gray-200 text-gray-500'}`}>
        <span className="font-semibold">가입완료</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAF3E0] min-h-screen flex justify-center items-center p-4">
      <div className="max-w-[750px] w-full bg-white p-10 rounded-[25px] shadow-lg border-4 border-[#87A96B] relative">
        {step < 3 && (
          <Button
            variant="ghost"
            className="absolute top-4 left-5 text-[#87A96B] p-3 hover:bg-transparent hover:text-[#6a8a53] text-xl font-bold flex items-center"
            onClick={handleBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> {step === 1 ? '뒤로가기' : '이전'}
          </Button>
        )}

        <h1 className="text-center text-4xl font-bold text-[#87A96B] my-8">회원가입</h1>

        <StepIndicator currentStep={step} />

        <div className="mt-8">
          {step === 1 && <TermsAgreement agreements={agreements} onAgreementChange={handleAgreementChange} />}
          {step === 2 && 
            <AccountCreation 
              formData={formData} 
              handleChange={handleChange} 
              handleUsernameCheck={handleUsernameCheck}
              isUsernameChecked={isUsernameChecked}
              isUsernameAvailable={isUsernameAvailable}
              usernameCheckMessage={usernameCheckMessage}
              isPasswordValid={isPasswordValid}
              passwordValidationMessage={passwordValidationMessage}
              message={message} 
              isLoading={isLoading} 
            />
          }
          {step === 3 && <RegistrationComplete />}
        </div>

        {step < 3 && (
          <div className="mt-10 flex justify-between space-x-4">
            {step > 1 && (
              <Button
                variant="outline"
                className="w-1/2 py-4 text-xl font-bold bg-[#D2B48C] hover:bg-[#c1a37d] text-white rounded-lg shadow-md border-none"
                onClick={handleBack}
                disabled={isLoading}
              >
                이전
              </Button>
            )}
            <Button
              variant="secondary"
              className={`w-${step === 1 ? 'full' : '1/2'} py-4 text-xl font-bold bg-[#A0522D] hover:bg-[#8b4726] text-white rounded-lg shadow-md border-none ${isNextDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleNext}
              disabled={isNextDisabled || isLoading}
            >
              {isLoading ? '처리중...' : (step === 1 ? '다음' : '가입하기')}
            </Button>
          </div>
        )}
        {step === 2 && message && <p className="text-center mt-4 text-red-600 text-lg">{message}</p>}
        {step === 1 && message && <p className="text-center mt-4 text-red-600 text-lg">{message}</p>}

        {step === 3 && (
          <div className="mt-10 text-center">
            <Button
              variant="secondary"
              className="py-4 px-10 text-xl font-bold bg-[#A0522D] hover:bg-[#8b4726] text-white rounded-lg shadow-md border-none"
              onClick={() => navigate('/login')}
            >
              로그인 하러 가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage; 