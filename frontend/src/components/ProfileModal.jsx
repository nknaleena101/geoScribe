import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function ProfileModal({ onClose, onProfileUpdate, token }) {
  // 💡 Get current name from localStorage and set it as initial state
  const [newName, setNewName] = useState(localStorage.getItem('userName') || '');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/profile',
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 💡 Update the userName in localStorage with the new name
      localStorage.setItem('userName', res.data.name);
      
      // alert("Profile updated successfully!");
      onProfileUpdate(); 
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile name");
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      <div className="profile-card-panel">
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#4B4B4B', zIndex: 10 }}
        >
          <X />
        </button>

        <h3 className="auth-title">Edit Profile Settings</h3>
        
        <form onSubmit={handleProfileSubmit}>
          <label className="profile-input-label">Update your name:</label>
          
          <input 
            type="text" 
            placeholder="Enter new profile name" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required 
            className="auth-input"
          />
          
          {/* Centered Pill Shape Save Action Button */}
          <button type="submit" className="auth-submit-btn" style={{ margin: '10px 0 0 0' }}>
            Save
          </button>
        </form>
      </div>

    </div>
  );
}