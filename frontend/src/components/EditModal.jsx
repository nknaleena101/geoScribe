import React, { useState } from 'react';
import axios from 'axios';

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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '15px' }}>Edit Your Journey</h3>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <label>Description:</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="4" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}