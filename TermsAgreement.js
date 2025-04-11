import React from 'react';

// TODO: Replace with actual Shadcn Checkbox if available and desired
const Checkbox = ({ id, checked, onChange, label, required }) => (
  <div className="flex items-center space-x-2 py-2 border-b border-gray-200 last:border-b-0">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded" // Basic styling
    />
    <label htmlFor={id} className="flex-grow text-lg text-gray-700">
      {required && <span className="text-red-500 font-semibold mr-1">(필수)</span>}
      {!required && <span className="text-gray-500 font-semibold mr-1">(선택)</span>}
      {label}
    </label>
    <button className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-2 py-1 rounded">
      내용보기 ▼
    </button>
  </div>
);

const TermsAgreement = ({ agreements, onAgreementChange }) => {
  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    onAgreementChange('all', isChecked);
  };

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">약관 동의</h2>
      {/* 전체 동의 */}
      <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
         <input
          type="checkbox"
          id="agree-all"
          checked={agreements.terms && agreements.privacy && agreements.thirdParty} // Adjust based on actual required fields
          onChange={handleSelectAll}
          className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="agree-all" className="text-lg font-semibold text-gray-800">
           GenBridge의 모든 약관을 확인하고 전체 동의합니다.
        </label>
      </div>

      {/* 개별 약관 */}
      <div className="space-y-1">
        <Checkbox
          id="terms"
          checked={agreements.terms}
          onChange={(e) => onAgreementChange('terms', e.target.checked)}
          label="이용약관"
          required={true}
        />
        <Checkbox
          id="privacy"
          checked={agreements.privacy}
          onChange={(e) => onAgreementChange('privacy', e.target.checked)}
          label="개인정보 수집 및 이용"
          required={true}
        />
        <Checkbox
          id="thirdParty"
          checked={agreements.thirdParty}
          onChange={(e) => onAgreementChange('thirdParty', e.target.checked)}
          label="개인정보 제 3자 제공"
          required={false}
        />
        {/* 필요시 다른 약관 추가 */}
      </div>
    </div>
  );
};

export default TermsAgreement; 