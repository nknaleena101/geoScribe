import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';

export default function App() {
  const [journals, setJournals] = useState([]);

  const fetchJournals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/journals');
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px' }}>GeoScribe 📍</h1>
      <div className="dashboard">
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
          <JournalForm onJournalAdded={fetchJournals} />
        </div>
        <div>
          <MapView journals={journals} />
        </div>
      </div>
    </div>
  );
}