import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';
import Auth from './components/Auth';
import EditModal from './components/EditModal';
import ProfileModal from './components/ProfileModal';
import logoImg from './assets/GeoScribe.png';
import { Trash } from 'lucide-react';
import { TypeOutline } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { X } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId'));
  const [journals, setJournals] = useState([]);
  const [searchParams, setSearchParams] = useState({ lat: '', lng: '', distance: 10 });
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [notification, setNotification] = useState('');
  const [editingJournal, setEditingJournal] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFormPanel, setShowFormPanel] = useState(false);

  // 💡 State to track which journal card's three-dots menu is currently open
  const [activeMenuId, setActiveMenuId] = useState(null);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchJournals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/journals');
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000);
  };

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
    localStorage.removeItem('userName');
    setToken(null);
    setCurrentUserId(null);
    fetchJournals();
  };

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
    setCurrentUserId(localStorage.getItem('userId'));
    setShowAuthModal(false);
  };

  // Close menus automatically if clicking anywhere else on the screen
  useEffect(() => {
    const closeAllMenus = () => setActiveMenuId(null);
    window.addEventListener('click', closeAllMenus);
    return () => window.removeEventListener('click', closeAllMenus);
  }, []);

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

      {/* Edit Journey Popup Modal */}
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

      {/* Profile Settings Popup Modal */}
      {showProfileModal && (
        <ProfileModal
          token={token}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdate={() => {
            triggerNotification("👤 Profile name updated successfully!");
            fetchJournals();
          }}
        />
      )}

      {/* Navbar Structure */}
      <div className="custom-navbar">
        <div className="nav-container">
          <div className="nav-group">
            <button className="nav-item">Dashboard</button>
            <button className="nav-item">Gallery</button>
          </div>
          <img src={logoImg} alt="GeoScribe Logo" className="nav-logo" />
          <div className="nav-group">
            {token ? (
              <>
                <button className="nav-item" onClick={() => setShowProfileModal(true)}>Profile</button>
                <button className="nav-item" onClick={handleLogout} style={{ color: 'black' }}>Logout</button>
              </>
            ) : (
              <button className="nav-item" onClick={() => setShowAuthModal(true)} style={{ color: 'black' }}>Sign In</button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌</button>
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* Hidden Proximity Search Tracker */}
      <form onSubmit={(e) => { e.preventDefault(); }} style={{ display: 'none' }}></form>

      {/* 2-Column Dashboard Layout */}
      <div className="main-dashboard">

        {/* Left Side: Map with Floating Form Wrapper */}
        <div className="map-column-wrapper">
          {!showFormPanel ? (
            <button
              className="floating-drop-btn"
              onClick={() => {
                if (!token) return setShowAuthModal(true);
                setShowFormPanel(true);
              }}
            >
              <MapPin size={40} /> Drop <br /> Pin
            </button>
          ) : (
            <div className="floating-form-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingRight: '20px', paddingLeft: '20px', paddingTop: '10px' }}>
                <span className='ffp-title'>Log Your Journey</span>
                <button onClick={() => setShowFormPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#6c757d' }}><X /></button>
              </div>
              <JournalForm
                onJournalAdded={() => {
                  fetchJournals();
                  setShowFormPanel(false);
                  triggerNotification("🚀 New pin dropped successfully!");
                }}
                selectedCoords={selectedCoords}
                token={token}
              />
            </div>
          )}

          <MapView
            journals={journals}
            onMapClick={(lat, lng) => {
              if (token) {
                setSelectedCoords({ lat, lng });
                setShowFormPanel(true);
              }
            }}
            activeCoords={activeCoords}
          />
        </div>

        {/* Right Side: Travel Timeline List */}
        <div className="timeline-column-card">
          <h3 style={{ marginBottom: '20px', fontFamily: 'Instrument Serif', fontSize: '24px', fontWeight: 'normal' }}>Travel Timeline</h3>
          <div className="timeline-list">
            {journals.map((journal) => (
              <div key={journal.id} className="journal-card" onClick={() => setActiveCoords({ lat: parseFloat(journal.latitude), lng: parseFloat(journal.longitude) })} style={{ cursor: 'pointer' }}>

                {/* Left Side: Fixed Image or Placeholder Container */}
                {journal.media_url ? (
                  <img src={journal.media_url} alt={journal.title} className="card-image" />
                ) : (
                  <div className="no-image-placeholder">No Image</div>
                )}

                {/* Right Side: Text Context Block arranged horizontally */}
                <div className="card-content">

                  {/* 1. Title matching serif underlined style */}
                  <h4 className="journal-title">{journal.title}</h4>

                  {/* 2. Description restricted to 2 lines max */}
                  <p className="journal-desc">{journal.content || "No description provided."}</p>

                  {/* 3. Bottom Row: Author details & Three Dots Menu */}
                  <div className="card-action-wrapper" onClick={(e) => e.stopPropagation()}>
                    <span className="creator-tag">
                      By: <strong>{journal.creator_name || "Unknown"}</strong>
                    </span>

                    {/* Three Dots Action Button for Owner Validation */}
                    {token && parseInt(currentUserId) === journal.user_id && (
                      <div style={{ position: 'relative' }}>
                        <button
                          className="three-dots-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === journal.id ? null : journal.id);
                          }}
                        >
                          •••
                        </button>

                        {/* Context Overlay Menu */}
                        {activeMenuId === journal.id && (
                          <div className="action-dropdown-menu">
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                setActiveMenuId(null);
                                setEditingJournal(journal);
                              }}
                            >
                              <TypeOutline size={15} />
                               Edit
                            </button>
                            <button
                              className="dropdown-item"
                              style={{ color: '#dc3545' }}
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDelete(journal.id);
                              }}
                            >
                              <Trash size={15} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}