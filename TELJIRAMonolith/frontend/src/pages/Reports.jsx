import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Reports() {
  const [velocity, setVelocity] = useState(null);
  useEffect(() => {
    api.get('/api/reports/velocity').then(r => setVelocity(r.data));
  }, []);
  return (
    <section>
      <h1>Reports</h1>
      <div className="card">
        <h2>Velocity</h2>
        <p>Completed Issues: {velocity?.completedIssues ?? '...'}</p>
      </div>
    </section>
  );
}
