import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function JournalForm({ onJournalAdded, selectedCoords, token }) {
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
      
      onJournalAdded(); // Triggers feed refresh and closes the panel
      setFormData({ title: '', content: '', media_url: '', latitude: '', longitude: '' });
    } catch (err) {
      console.error("Backend Error Details:", err.response?.data);
      alert('Error saving journal: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
      <textarea placeholder="Story..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows="3" />
      <input type="text" placeholder="Image URL" value={formData.media_url} onChange={e => setFormData({...formData, media_url: e.target.value})} />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} required />
        <input type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} required />
      </div>
      
      <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', borderRadius: '68px', fontSize: '20px', marginTop: '5px', fontFamily: 'Instrument Serif' }}>
        Drop Pin
      </button>
    </form>
  );
}