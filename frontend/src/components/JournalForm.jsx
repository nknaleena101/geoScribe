import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function JournalForm({ onJournalAdded, selectedCoords, token }) { // 👈 token එක prop එකක් විදිහට ගත්තා
  const [formData, setFormData] = useState({
    title: '', content: '', media_url: '', latitude: '', longitude: ''
  });

  useEffect(() => {
    if (selectedCoords) {
      setFormData(prev => ({
        ...prev,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng
      }));
    }
  }, [selectedCoords]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/journals', 
        formData,
        { headers: { Authorization: `Bearer ${token}` } } 
      );
      
      alert('Journal entry dropped successfully!');
      onJournalAdded(); 
      setFormData({ title: '', content: '', media_url: '', latitude: '', longitude: '' });
    } catch (err) {
      console.error("Backend Error Details:", err.response?.data);
      alert('Error saving journal: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* <h3>Log Your Journey</h3> */}
      <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
      <textarea placeholder="Story..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
      <input type="text" placeholder="Media Image URL" value={formData.media_url} onChange={e => setFormData({...formData, media_url: e.target.value})} />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} required style={{ width: '50%' }} />
        <input type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} required style={{ width: '50%' }} />
      </div>
      
      <small style={{ color: '#6c757d' }}>💡 Tip: Click anywhere on the map to auto-fill coordinates!</small>
      <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '4px' }}>Drop Pin</button>
    </form>
  );
}