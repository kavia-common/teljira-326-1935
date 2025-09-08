import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Sprints() {
  const [projectId] = useState(1);
  const [sprints, setSprints] = useState([]);
  const [name, setName] = useState('Sprint 1');

  async function load() {
    const r = await api.get('/api/sprints', { params: { projectId } });
    setSprints(r.data);
  }

  useEffect(() => { load(); }, []);

  const createSprint = async (e) => {
    e.preventDefault();
    await api.post('/api/sprints', { projectId, name });
    setName('Next Sprint');
    await load();
  };

  const start = async (id) => { await api.post(`/api/sprints/${id}/start`); await load(); };
  const complete = async (id) => { await api.post(`/api/sprints/${id}/complete`); await load(); };

  return (
    <section>
      <h1>Sprints</h1>
      <form onSubmit={createSprint} className="card">
        <label htmlFor="sname">Name</label>
        <input id="sname" value={name} onChange={e=>setName(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      <ul>
        {sprints.map(s => (
          <li key={s.id} className="card">
            <strong>{s.name}</strong> <em>({s.state})</em>
            {s.state === 'planned' && <button onClick={()=>start(s.id)}>Start</button>}
            {s.state === 'active' && <button onClick={()=>complete(s.id)}>Complete</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}
