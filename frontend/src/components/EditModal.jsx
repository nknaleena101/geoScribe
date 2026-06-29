import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function EditModal({ journal, onClose, onUpdateSuccess, token }) {
  const [title, setTitle] = useState(journal.title);
  const [content, setContent] = useState(journal.content || ''); // This is description

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/journals/${journal.id}`,
        { ...journal, title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to update journal");
    }
  };

  return (
    <div className="edit-modal-overlay">
  <div className="edit-modal-panel">
    
    <button 
      type="button"
      onClick={onClose} 
      style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#333', zIndex: 10 }}
    >
      <X />
    </button>

    <h3 className="auth-title">Edit Your Journey</h3>
    
    <form onSubmit={handleUpdate}>
      
      <label className="edit-input-label">Title:</label>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
        className="auth-input" 
      />
      
      <label className="edit-input-label">Description:</label>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        rows="4" 
        className="auth-input"
        style={{ resize: 'none' }}
      />
      
      <button type="submit" className="auth-submit-btn" style={{ margin: '15px 0 0 0' }}>
        Save Changes
      </button>

    </form>
  </div>
</div>
  );
}