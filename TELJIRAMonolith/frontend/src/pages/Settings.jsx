import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Settings() {
  const [integrations, setIntegrations] = useState([]);
  useEffect(() => { api.get('/api/settings/integrations').then(r=>setIntegrations(r.data)); }, []);
  return (
    <section>
      <h1>Settings</h1>
      <h2>Integrations</h2>
      {integrations.map(int => (
        <div className="card" key={int.key}>
          <strong>{int.key}</strong>: {int.status}
        </div>
      ))}
    </section>
  );
}
