import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Backlog() {
  const [projectId] = useState(1);
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState('New Task');
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/api/issues/backlog', { params: { projectId } });
    setIssues(res.data);
  }

  useEffect(() => { load(); }, []);

  async function createIssue(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/issues', { projectId, title, type: 'task' });
      setTitle('New Task');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create');
    }
  }

  return (
    <section>
      <h1>Backlog</h1>
      {error && <div role="alert">{error}</div>}
      <form onSubmit={createIssue} className="card" aria-label="Create issue">
        <label htmlFor="ititle">Title</label>
        <input id="ititle" value={title} onChange={e=>setTitle(e.target.value)} required />
        <button type="submit">Add</button>
      </form>
      <ul aria-label="Backlog list">
        {issues.map(i=>(
          <li key={i.id} className="card">
            <strong>{i.key}</strong> {i.title} <em>({i.status})</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
