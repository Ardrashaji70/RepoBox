import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase/Config';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigate('/'); 
  } catch (error) {
    setError(error.message);
    setLoading(false);
  }
};

  return (
    <div className='loginParentDiv'>       
      <div className='loginCard'>
        <div className='loginHeader'>
          <div className='loginLogo'>R</div>
          <h1>RepoBox</h1>
          <p>Login to your account</p>
        </div>

        <div className='loginForm'>
          {error && <p className='errorMsg'>{error}</p>}

          <div className='formGroup'>
            <label htmlFor='email'>Email</label>
            <input
              className='input'
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
            />
          </div>

          <div className='formGroup'>
            <label htmlFor='password'>Password</label>
            <input
              className='input'
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
            />
          </div>

          <button
            className='loginBtn'
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className='signupLink'>
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>Sign Up</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;