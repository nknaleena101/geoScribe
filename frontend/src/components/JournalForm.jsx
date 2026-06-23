import React, { useState } from 'react';
import axios from 'axios';

export default function JournalForm({ onJournalAdded }) {
  const [formData, setFormData] = useState({
    title: '', content: '', media_url: '', latitude: '', longitude: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/journals', formData);
      alert('Journal entry dropped successfully!');
      onJournalAdded(); // refresh map
      setFormData({ title: '', content: '', media_url: '', latitude: '', longitude: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3>Log Your Journey</h3>
      <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
      <textarea placeholder="Story..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
      <input type="text" placeholder="Media Image URL" value={formData.media_url} onChange={e => setFormData({...formData, media_url: e.target.value})} />
      <input type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} required />
      <input type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} required />
      <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>Drop Pin</button>
    </form>
  );
}