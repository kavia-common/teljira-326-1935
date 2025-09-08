import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard({ token }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(data);
      } catch {
        setProjects([]);
      }
    };
    load();
  }, [token]);

  return (
    <section aria-labelledby="dash-header">
      <h1 id="dash-header">Dashboard</h1>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            {p.name} ({p.key})
          </li>
        ))}
      </ul>
    </section>
  );
}
