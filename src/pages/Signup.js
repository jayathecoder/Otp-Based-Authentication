import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    age: '',
    image: null // Store file object
  });

  const navigate = useNavigate();

  // Handle text input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    setSignupInfo((prev) => ({ ...prev, image: file }));
  };

  // Handle form submit
  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, image } = signupInfo;

    // Validation
    if (!name || !email || !password || !image) {
      return handleError('Name, email, password, and image are required');
    }

    try {
      const url = `http://localhost:8080/register`;

      // Creating FormData() to send image properly
      const formData = new FormData();
      formData.append('name', signupInfo.name);
      formData.append('email', signupInfo.email);
      formData.append('password', signupInfo.password);
      formData.append('dob', signupInfo.dob);
      formData.append('age', signupInfo.age);
      formData.append('image', signupInfo.image); 

      const response = await fetch(url, {
        method: 'POST',
        body: formData, 
      });

      const result = await response.json();
      const { message, error } = result;

      if (message) {
        handleSuccess(message);
        setTimeout(() => navigate('/home'), 1000);
      } else if (error) {
        handleError(error || 'Signup failed');
      }

      console.log(result);
    } catch (err) {
      handleError(err.message);
    }
  };

  return (
    <div className='container'>
      <form onSubmit={handleSignup}>
        <h1>Signup</h1>
        <div>
          <label htmlFor='name'>Name: </label>
          <input type='text' name='name' placeholder='Enter name' onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor='email'>Email: </label>
          <input type='email' name='email' placeholder='Enter email' onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor='password'>Password: </label>
          <input type='password' name='password' placeholder='Enter password' onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor='age'>Age: </label>
          <input type='number' name='age' placeholder='Enter Age' onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor='dob'>DOB: </label>
          <input type='date' name='dob' onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor='image'>Profile Picture: </label>
          <input type='file' accept='image/*' onChange={handleImageChange} required />
        </div>

        <button type='submit'>Signup</button>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>

      <ToastContainer />
    </div>
  );
}

export default Signup;
