import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    // Check localStorage first, then sessionStorage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token'); // Also check token
    
    if (storedUser && storedToken) { // Ensure both user and token exist
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name || '');
      // Fetch full user details using the token found
      fetchUserDetails(parsedUser.id, storedToken);
    } else {
      // If no user/token in either storage, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserDetails = async (userId, token) => {
    if (!token) {
        console.error('No token provided to fetchUserDetails');
        return;
    }
    try {
      const response = await fetch(`http://localhost:8888/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setPhone(userData.phone || '');
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    // Get token from either storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 
    if (!token) return navigate('/login'); // Redirect if no token
    
    try {
      const response = await fetch(`http://localhost:8888/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('프로필 정보가 업데이트되었습니다.');
        // Update user info in the correct storage
        const updatedUser = { ...user, name };
        if (localStorage.getItem('user')) { // Check which storage was used
           localStorage.setItem('user', JSON.stringify(updatedUser));
           console.log("User info updated in localStorage");
        } else if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            console.log("User info updated in sessionStorage");
        }
        setUser(updatedUser);
      } else {
        setMessage(data.message || '프로필 업데이트 실패');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('서버 오류가 발생했습니다.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // Get token from either storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return navigate('/login'); // Redirect if no token

    try {
      const response = await fetch(`http://localhost:8888/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordMessage('비밀번호가 변경되었습니다.');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(data.message || '비밀번호 변경 실패');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordMessage('서버 오류가 발생했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="bg-[#FAF3E0] min-h-screen flex justify-center items-center p-4">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF3E0] min-h-screen flex justify-center items-center p-4">
      <div className="max-w-[650px] w-full bg-white p-10 rounded-[25px] shadow-lg border-4 border-[#87A96B] relative">
        <Button
          variant="ghost"
          className="absolute top-4 left-5 text-[#87A96B] p-3 hover:bg-transparent hover:text-[#6a8a53] text-xl font-bold flex items-center"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> 뒤로가기
        </Button>

        <h1 className="text-center text-4xl font-bold text-[#87A96B] my-12">회원 정보 수정</h1>

        <form onSubmit={handleUpdateProfile} className="space-y-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">프로필 정보</h3>
          <div className="space-y-2">
            <label htmlFor="username" className="text-lg font-medium text-gray-600">아이디:</label>
            <input
              id="username"
              type="text"
              value={user.username}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg text-lg bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-lg font-medium text-gray-600">이름:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:border-[#87A96B] focus:ring-1 focus:ring-[#87A96B]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-lg font-medium text-gray-600">전화번호:</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:border-[#87A96B] focus:ring-1 focus:ring-[#87A96B]"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-full py-4 text-xl font-bold bg-[#F7C242] hover:bg-[#ffe083] text-black rounded-lg shadow-md"
          >
            프로필 업데이트
          </Button>
          {message && <p className={`text-center mt-2 ${message.includes('성공') || message.includes('업데이트') ? 'text-green-600' : 'text-red-600'} text-lg`}>{message}</p>}
        </form>

        <hr className="my-8 border-gray-300"/>

        <form onSubmit={handleChangePassword} className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">비밀번호 변경</h3>
          <div className="space-y-2">
            <label htmlFor="currentPassword"  className="text-lg font-medium text-gray-600">현재 비밀번호:</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:border-[#87A96B] focus:ring-1 focus:ring-[#87A96B]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="newPassword"  className="text-lg font-medium text-gray-600">새 비밀번호:</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:border-[#87A96B] focus:ring-1 focus:ring-[#87A96B]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword"  className="text-lg font-medium text-gray-600">새 비밀번호 확인:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:border-[#87A96B] focus:ring-1 focus:ring-[#87A96B]"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-full py-4 text-xl font-bold bg-[#F7C242] hover:bg-[#ffe083] text-black rounded-lg shadow-md"
          >
            비밀번호 변경
          </Button>
          {passwordMessage && <p className={`text-center mt-2 ${passwordMessage.includes('성공') || passwordMessage.includes('변경') ? 'text-green-600' : 'text-red-600'} text-lg`}>{passwordMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default EditProfile; 