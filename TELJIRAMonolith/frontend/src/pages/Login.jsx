import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password, mfaToken || undefined);
      nav('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="card" aria-labelledby="login-title">
      <h1 id="login-title">Sign in</h1>
      {error && <div role="alert">{error}</div>}
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <label htmlFor="mfatoken">MFA Token (if required)</label>
        <input id="mfatoken" type="text" inputMode="numeric" value={mfaToken} onChange={e=>setMfaToken(e.target.value)} />
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
}
