import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase/Config';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

 const handleSignup = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await addDoc(collection(db, 'users'), {
      id: result.user.uid,
      name: name,
      phone: phone,
    });
    navigate('/login'); 
  } catch (error) {
    setError(error.message);
  }
};

  return (
  <div className="signupParentDiv">
    <div className="signupCard">
      <div className="signupHeader">
        <div className="signupLogo">R</div>
        <h1>RepoBox</h1>
        <p>Create Account</p>
      </div>
      <div className="signupForm">
        <div className="formGroup">
          <label>Username</label>
          <input className="input" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your username" />
        </div>
        <div className="formGroup">
          <label>Email</label>
          <input className="input"
           type="email" 
           value={email} 
           onChange={(e) => setEmail(e.target.value)} 
           placeholder="Enter your email" />
        </div>
        <div className="formGroup">
          <label>Password</label>
          <input className="input" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter your password" />
        </div>

        <div className="formGroup">
          <label>Phone</label>
          <input className="input" 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          placeholder="Enter your phone number" />
        </div>

        <button className="signupBtn" 
        onClick={handleSignup}>Sign Up</button>
        <div className="loginLink">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  </div>
);
}

export default Signup;