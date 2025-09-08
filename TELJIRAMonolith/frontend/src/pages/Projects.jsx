import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Projects() {
  const [workspaceId] = useState(1);
  const [list, setList] = useState([]);
  const [key, setKey] = useState('PRJ');
  const [name, setName] = useState('New Project');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get('/api/projects', { params: { workspaceId } });
    setList(res.data);
  }
  useEffect(() => { load(); }, []);

  async function createProject(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/projects', { workspaceId, key, name, description: desc });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create');
    }
  }

  return (
    <section>
      <h1>Projects</h1>
      {error && <div role="alert">{error}</div>}
      <form onSubmit={createProject} className="card" aria-label="Create project">
        <div>
          <label htmlFor="key">Key</label>
          <input id="key" value={key} onChange={e=>setKey(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="pname">Name</label>
          <input id="pname" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="pdesc">Description</label>
          <textarea id="pdesc" value={desc} onChange={e=>setDesc(e.target.value)} />
        </div>
        <button type="submit">Create</button>
      </form>

      <div>
        {list.map(p => (
          <div className="card" key={p.id}>
            <h2>{p.key} - {p.name}</h2>
            <p>{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
