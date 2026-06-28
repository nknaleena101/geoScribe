import React, { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isSignUp 
      ? 'http://localhost:5000/api/auth/signup' 
      : 'http://localhost:5000/api/auth/signin';
    
    const requestData = isSignUp ? { name, email, password } : { email, password };

    try {
      const res = await axios.post(url, requestData);
      
      if (isSignUp) {
        alert('Account created successfully! Please sign in.');
        setIsSignUp(false); // Switch to sign in view
      } else {
        // Sign In Success - Save user variables to state storage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('userName', res.data.user.name);
        onLoginSuccess();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="auth-card-panel">
      {/* Dynamic Title Headers matching image layouts */}
      <h2 className="auth-title">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
      
      <form onSubmit={handleSubmit}>
        
        {/* Render Name box only if view state is 'Sign Up' */}
        {isSignUp && (
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            className="auth-input"
          />
        )}
        
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          className="auth-input"
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          className="auth-input"
        />
        
        <button type="submit" className="auth-submit-btn">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      {/* Modernized Bottom Toggle Link Row */}
      <div className="auth-toggle-text">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="auth-toggle-link"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}