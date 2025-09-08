import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Projects({ token }) {
  const [items, setItems] = useState([]);
  const [ws, setWs] = useState('');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data);
      const wsResp = await axios
        .get('/api/workspaces', { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => ({ data: [] }));
      if (wsResp.data[0]) setWs(wsResp.data[0].id);
    };
    load();
  }, [token]);

  const create = async (e) => {
    e.preventDefault();
    await axios.post(
      '/api/projects',
      { workspace_id: ws, name, key },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { data } = await axios.get('/api/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(data);
  };

  return (
    <section aria-labelledby="pj-header">
      <h1 id="pj-header">Projects</h1>
      <form onSubmit={create} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Workspace ID"
          value={ws}
          onChange={(e) => setWs(e.target.value)}
          aria-label="Workspace ID"
        />
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Project name"
        />
        <input
          placeholder="KEY"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          aria-label="Project key"
        />
        <button type="submit">Create</button>
      </form>
      <ul>
        {items.map((p) => (
          <li key={p.id}>
            {p.name} ({p.key})
          </li>
        ))}
      </ul>
    </section>
  );
}
