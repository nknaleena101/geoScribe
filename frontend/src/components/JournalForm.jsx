import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function JournalForm({ onJournalAdded, selectedCoords }) {
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
      await axios.post('http://localhost:5000/api/journals', formData);
      alert('Journal entry dropped successfully!');
      onJournalAdded();
      setFormData({ title: '', content: '', media_url: '', latitude: '', longitude: '' });
    } catch (err) {
      console.error(err);
      alert('Error saving journal');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '28px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '4px' }}>Log Your Journey</h3>
      
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Title</label>
        <input type="text" placeholder="A beautiful sunset at the beach..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
      </div>
      
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Story</label>
        <textarea placeholder="Write your experience..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ height: '120px', resize: 'none' }} />
      </div>
      
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Media URL (optional)</label>
        <input type="text" placeholder="https://example.com/image.jpg" value={formData.media_url} onChange={e => setFormData({...formData, media_url: e.target.value})} />
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Latitude</label>
          <input type="number" step="any" placeholder="Lat" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} required />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '6px' }}>Longitude</label>
          <input type="number" step="any" placeholder="Lng" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} required />
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
      >
        <small style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span>💡</span> Tip: Click anywhere on the map to auto-fill coordinates!
        </small>
      </motion.div>
      
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        className="btn-primary" 
        style={{ marginTop: '8px', padding: '14px', fontSize: '16px' }}
      >
        Drop Pin
      </motion.button>
    </form>
  );
}
