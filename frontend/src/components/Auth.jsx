import React, { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/api/auth/${isSignUp ? 'signup' : 'signin'}`;
    try {
      const res = await axios.post(url, { email, password });
      if (!isSignUp) {
        localStorage.setItem('token', res.data.token); // save the Token
        onLoginSuccess();
      } else {
        alert('Signed up successfully! Now Sign In.');
        setIsSignUp(false);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ background: '#007bff', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#007bff', marginTop: '10px', cursor: 'pointer' }}>
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}