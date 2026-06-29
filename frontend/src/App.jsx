import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';
import GalleryView from './components/GalleryView'; // 💡 Imported Gallery component
import Auth from './components/Auth';
import EditModal from './components/EditModal';
import ProfileModal from './components/ProfileModal';
import logoImg from './assets/GeoScribe.png';
import { motion, AnimatePresence} from 'framer-motion';
import { Trash, TypeOutline, MapPin, X } from 'lucide-react';

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
  const [activeMenuId, setActiveMenuId] = useState(null);

  // 💡 State to control routing views: 'dashboard' or 'gallery'
  const [currentView, setCurrentView] = useState('dashboard');

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
    setCurrentView('dashboard'); // Default to dashboard on logout
    fetchJournals();
  };

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
    setCurrentUserId(localStorage.getItem('userId'));
    setShowAuthModal(false);
  };

  useEffect(() => {
    const closeAllMenus = () => setActiveMenuId(null);
    window.addEventListener('click', closeAllMenus);
    return () => window.removeEventListener('click', closeAllMenus);
  }, []);

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div className="app-root-container">
      {/* Notification Banner */}
      {notification && <div className="notification-banner">{notification}</div>}

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

      {/* Navbar Structure linked with state routing */}
      <div className="custom-navbar">
        <div className="nav-container">
          <div className="nav-group">
            {/* Active views have reduced opacity or custom hover states via nav-item class */}
            <button 
              className="nav-item" 
              style={{ fontWeight: currentView === 'dashboard' ? 'normal' : 'normal' }}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className="nav-item" 
              style={{ fontWeight: currentView === 'gallery' ? 'normal' : 'normal' }}
              onClick={() => setCurrentView('gallery')}
            >
              Gallery
            </button>
          </div>
          
          {/* 💡 Logo acts as a home trigger button to return to dashboard */}
          <img 
            src={logoImg} 
            alt="GeoScribe Logo" 
            className="nav-logo" 
            onClick={() => setCurrentView('dashboard')} 
            style={{ cursor: 'pointer' }} 
          />

          <div className="nav-group">
            {token ? (
              <>
                <button className="nav-item" onClick={() => setShowProfileModal(true)}>Profile</button>
                <button className="nav-item logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className="nav-item signin-btn" onClick={() => setShowAuthModal(true)}>Sign In</button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Screen Modal Wrapper */}
      {showAuthModal && (
        <div className="auth-overlay">
          <div className="auth-modal-wrapper">
            <button className="auth-close-btn" onClick={() => setShowAuthModal(false)}>
              <X />
            </button>
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); }} style={{ display: 'none' }}></form>

      {/* 💡 Conditional View Rendering Engine */}
      {currentView === 'dashboard' ? (
        /* 2-Column Dashboard Layout View Component */
        <div className="main-dashboard">
          
          {/* Left Side: Map Container */}
          <div className="map-column-wrapper">
            <AnimatePresence mode="wait">
              {!showFormPanel ? (
                <motion.button
                  key="drop-btn"
                  className="floating-drop-btn"
                  onClick={() => {
                    if (!token) return setShowAuthModal(true);
                    setShowFormPanel(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <MapPin size={35} /> Drop <br /> Pin
                </motion.button>
              ) : (
                <motion.div
                  key="form-panel"
                  className="floating-form-panel"
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 800, damping: 25 }}
                >
                  <div className="form-panel-header">
                    <span className='ffp-title'>Log Your Journey</span>
                    <button className="form-close-btn" onClick={() => setShowFormPanel(false)}>
                      <X size={18} />
                    </button>
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
                </motion.div>
              )}
            </AnimatePresence>

            <MapView
              journals={journals}
              onMapClick={(lat, lng) => {
                if (token) {
                  setSelectedCoords({ lat, lng });
                  setShowFormPanel(true);
                }
              }}
              activeCoords={activeCoords}
              token={token}
              currentUserId={currentUserId}
            />
          </div>

          {/* Right Side: Travel Timeline Card */}
          <div className="timeline-column-card">
            <h3 className="timeline-header">Travel Timeline</h3>
            <div className="timeline-list">
              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className="journal-card"
                  onClick={() => setActiveCoords({ lat: parseFloat(journal.latitude), lng: parseFloat(journal.longitude) })}
                >
                  {journal.media_url ? (
                    <img src={journal.media_url} alt={journal.title} className="card-image" />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}

                  <div className="card-content">
                    <h4 className="journal-title">{journal.title}</h4>
                    <p className="journal-desc">{journal.content || "No description provided."}</p>

                    <div className="card-action-wrapper">
                      <span className="creator-tag">
                        By: <strong>
                          {token && parseInt(currentUserId) === journal.user_id
                            ? "You"
                            : (journal.creator_name || "Unknown")}
                        </strong>
                      </span>

                      {token && parseInt(currentUserId) === journal.user_id && (
                        <div className="three-dots-container">
                          <button
                            className="three-dots-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === journal.id ? null : journal.id);
                            }}
                          >
                            •••
                          </button>

                          {activeMenuId === journal.id && (
                            <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                              <button className="dropdown-item" onClick={() => setEditingJournal(journal)}>
                                <TypeOutline size={15} /> Edit
                              </button>
                              <button className="dropdown-item delete-item" onClick={() => handleDelete(journal.id)}>
                                <Trash size={15} /> Delete
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
      ) : (
        /* 💡 Render the new Global Exploration Gallery View Component */
        <GalleryView 
          journals={journals}
          token={token}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}