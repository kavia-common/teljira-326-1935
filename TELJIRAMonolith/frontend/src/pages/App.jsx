import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth, HasRole, useAuth } from '../lib/auth';
import Login from './Login.jsx';
import Projects from './Projects.jsx';
import Backlog from './Backlog.jsx';
import Board from './Board.jsx';
import Sprints from './Sprints.jsx';
import Reports from './Reports.jsx';
import Settings from './Settings.jsx';

function Header() {
  const { user, logout } = useAuth();
  return (
    <header>
      <nav aria-label="Main">
        <Link to="/">Projects</Link>
        <Link to="/backlog">Backlog</Link>
        <Link to="/board">Board</Link>
        <Link to="/sprints">Sprints</Link>
        <Link to="/reports">Reports</Link>
        <HasRole role="org_admin"><Link to="/settings">Settings</Link></HasRole>
        {user ? (
          <button onClick={logout} aria-label="Sign out">Sign out ({user.name})</button>
        ) : (
          <Link to="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}

function Footer() {
  return <footer>© {new Date().getFullYear()} SprintFlow</footer>;
}

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<RequireAuth><Projects/></RequireAuth>} />
          <Route path="/backlog" element={<RequireAuth><Backlog/></RequireAuth>} />
          <Route path="/board" element={<RequireAuth><Board/></RequireAuth>} />
          <Route path="/sprints" element={<RequireAuth><Sprints/></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><Reports/></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings/></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}
