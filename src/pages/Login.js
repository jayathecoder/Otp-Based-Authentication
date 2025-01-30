import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const [otp, setOtp] = useState(''); 
  const [isOtpSent, setIsOtpSent] = useState(false); 

  const navigate = useNavigate(); 

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

 
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    if (!email || !password) {
      return handleError('Email and password are required');
    }

    try {
      const url = `http://localhost:8080/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      console.log("Login response:", result); 

      const { message, error} = result;

      if (message) {
        //localStorage.setItem('tempToken', token); 
        handleSuccess(message);
        setIsOtpSent(true); 
      } else {
        handleError(error || message);
      }
    } catch (err) {
      handleError(err.message);
    }
  };

  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;

    if (!otp) {
      return handleError('Please enter the OTP');
    }

    try {
      const url = `http://localhost:8080/verify-otp`;
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp })
      });

      const result = await response.json();
      console.log("OTP verification response:", result); 

      const { message, error, jwtToken } = result;

      if (message) {
        localStorage.setItem('token', jwtToken); 
        localStorage.removeItem('tempToken'); 
        handleSuccess('Login successful!');

        setTimeout(() => {
          navigate('/home'); 
        }, 1000);
      } else {
        handleError(error);
      }
    } catch (err) {
      handleError(err.message);
    }
  };

  return (
    <div className='container'>
      {!isOtpSent ? (
        <form onSubmit={handleLogin}>
          <h1>Login</h1>

          <div>
            <label htmlFor='email'>Email: </label>
            <input type='email' name='email' placeholder='Enter email' onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor='password'>Password: </label>
            <input type='password' name='password' placeholder='Enter password' onChange={handleChange} required />
          </div>

          <button type='submit'>Login</button>

          <p>New User? <Link to="/signup">Signup</Link></p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <h1>Enter OTP</h1>

          <div>
            <label htmlFor='otp'>OTP: </label>
            <input type='text' name='otp' placeholder='Enter OTP' onChange={handleOtpChange} required />
          </div>

          <button type='submit'>Verify OTP</button>
        </form>
      )}

      <ToastContainer />
    </div>
  );
}

export default Login;
