import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Issues({ token }) {
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);

  const load = async () => {
    if (!projectId) return;
    const { data } = await axios.get(`/api/issues?project_id=${encodeURIComponent(projectId)}`, { headers: { Authorization: `Bearer ${token}` } });
    setItems(data);
  };

  useEffect(() => { load(); /* eslint-disable react-hooks/exhaustive-deps */ }, [projectId]);

  const create = async (e) => {
    e.preventDefault();
    await axios.post('/api/issues', { project_id: projectId, type_id: null, title }, { headers: { Authorization: `Bearer ${token}` } });
    setTitle('');
    await load();
  };

  return (
    <section aria-labelledby="issue-header">
      <h1 id="issue-header">Issues</h1>
      <form onSubmit={create} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Project ID" value={projectId} onChange={(e)=>setProjectId(e.target.value)} aria-label="Project ID"/>
        <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} aria-label="Issue Title"/>
        <button type="submit" disabled={!projectId || !title}>Create</button>
      </form>
      <ul>
        {items.map((i)=> <li key={i.id}>{i.key}: {i.title} [{i.status}]</li>)}
      </ul>
    </section>
  );
}
