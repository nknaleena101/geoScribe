import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '15px' }}>Edit Profile Settings</h3>
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label>Update Your Name:</label>
          <input 
            type="text" 
            placeholder="Enter new profile name" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Update Name</button>
          </div>
        </form>
      </div>
    </div>
  );
}