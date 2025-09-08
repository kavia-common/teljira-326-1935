import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import Issues from './pages/Issues.jsx';

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const login = (t) => {
    localStorage.setItem('token', t);
    setToken(t);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };
  return { token, login, logout };
}

function App() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.token) return;
    const socket = io('http://localhost:3000', { transports: ['websocket'] });
    socket.on('connect', () => {
      // global join already done server-side
    });
    socket.on('project:created', (p) => {
      // Simple notification
      // eslint-disable-next-line no-alert
      alert(`New project created: ${p.name}`);
    });
    return () => socket.close();
  }, [auth.token]);

  return (
    <div>
      <header
        role="banner"
        style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', gap: 12 }}
      >
        <Link to="/" aria-label="Home">
          SprintFlow
        </Link>
        <nav aria-label="Main">
          <Link to="/projects">Projects</Link>
          <Link to="/issues">Issues</Link>
          <a href="/docs" target="_blank" rel="noreferrer">
            API Docs
          </a>
        </nav>
        <div style={{ marginLeft: 'auto' }}>
          {auth.token ? (
            <button
              onClick={() => {
                auth.logout();
                navigate('/login');
              }}
              aria-label="Logout"
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main role="main" style={{ padding: 16 }}>
        <Routes>
          <Route
            path="/"
            element={auth.token ? <Dashboard token={auth.token} /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login onLogin={auth.login} />} />
          <Route
            path="/projects"
            element={auth.token ? <Projects token={auth.token} /> : <Navigate to="/login" />}
          />
          <Route
            path="/issues"
            element={auth.token ? <Issues token={auth.token} /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
      <footer role="contentinfo" style={{ padding: 12, borderTop: '1px solid #ddd' }}>
        <small>Accessible • WCAG 2.2 AA targets</small>
      </footer>
    </div>
  );
}

export default App;
