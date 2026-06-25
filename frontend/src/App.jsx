import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';
import Auth from './components/Auth';
import EditModal from './components/EditModal'; // Imported our new modal

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId'));
  const [journals, setJournals] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // New States for Notification and Popup Modal
  const [notification, setNotification] = useState('');
  const [editingJournal, setEditingJournal] = useState(null);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchJournals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/journals');
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  // Custom Notification Trigger
  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000); // Auto hide after 4 seconds
  };

  // Delete Action Handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pin?")) {
      try {
        await axios.delete(`http://localhost:5000/api/journals/${id}`, getAuthHeader());
        triggerNotification("📍 Pin deleted successfully!");
        fetchJournals();
      } catch (err) {
        console.error(err);
        alert("Failed to delete pin");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setCurrentUserId(null);
    fetchJournals();
  };

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
    setCurrentUserId(localStorage.getItem('userId'));
    setShowAuthModal(false);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div>
      {/* Notification Banner */}
      {notification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '12px 24px', borderRadius: '30px', zIndex: 10001, boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontWeight: 'bold' }}>
          {notification}
        </div>
      )}

      {/* Edit Popup Modal */}
      {editingJournal && (
        <EditModal 
          journal={editingJournal} 
          token={token}
          onClose={() => setEditingJournal(null)} 
          onUpdateSuccess={() => {
            setEditingJournal(null);
            triggerNotification("📝 Journal updated successfully!");
            fetchJournals();
          }} 
        />
      )}

      {/* Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#343a40', color: 'white', alignItems: 'center' }}>
        <h2>GeoScribe 📍</h2>
        {token ? (
          <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Logout</button>
        ) : (
          <button onClick={() => setShowAuthModal(true)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Sign In to Drop Pins</button>
        )}
      </div>

      {/* Auth Screen Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌</button>
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      <div className="main-dashboard">
        {/* Left Column: Log Your Journey */}
        <div className="column-card">
          <h3 style={{ marginBottom: '15px' }}>Log Your Journey</h3>
          {token ? (
            // Pass triggerNotification to Form to alert on success
            <JournalForm 
              onJournalAdded={() => {
                fetchJournals();
                triggerNotification("🚀 New pin dropped successfully!");
              }} 
              selectedCoords={selectedCoords} 
              token={token} 
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <h4>Want to log your journey?</h4>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', marginTop: '10px', borderRadius: '4px' }}>Sign In Now</button>
            </div>
          )}
        </div>

        {/* Middle Column: Map View */}
        <div className="map-column">
          <MapView journals={journals} onMapClick={(lat, lng) => token && setSelectedCoords({ lat, lng })} activeCoords={activeCoords} />
        </div>

        {/* Right Column: Travel Timeline */}
        <div className="column-card">
          <h3 style={{ marginBottom: '15px' }}>Global Travel Timeline</h3>
          <div className="timeline-list">
            {journals.map((journal) => (
              <div key={journal.id} className="journal-card" onClick={() => setActiveCoords({ lat: parseFloat(journal.latitude), lng: parseFloat(journal.longitude) })} style={{ cursor: 'pointer', position: 'relative' }}>
                {journal.media_url ? <img src={journal.media_url} alt={journal.title} className="card-image" /> : <div style={{ height: '180px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>}
                
                <div className="card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: '#6c757d', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                      By: {journal.creator_name || "Unknown"}
                    </span>
                    
                    {/* Trashbin Button: Only visible to the owner */}
                    {token && parseInt(currentUserId) === journal.user_id && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(journal.id); }} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                        title="Delete Pin"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  
                  <h4 style={{ marginTop: '8px' }}>{journal.title}</h4>
                  <p style={{ color: '#555', fontSize: '14px' }}>{journal.content || "No description provided."}</p>

                  {/* Edit Button: Opens up our newly created EditModal Popup */}
                  {token && parseInt(currentUserId) === journal.user_id && (
                    <button onClick={(e) => {
                      e.stopPropagation(); // Prevents map flight
                      setEditingJournal(journal); // Trigger Modal popup
                    }} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '4px 10px', cursor: 'pointer', marginTop: '10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      ✏️ Edit Trip
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}