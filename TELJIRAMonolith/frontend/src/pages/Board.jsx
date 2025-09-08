import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Board() {
  const [projectId] = useState(1);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get('/api/issues/backlog', { params: { projectId } }).then(r => {
      // For demo also fetch non-backlog by listing all statuses quickly
      setIssues(r.data);
    });
  }, []);

  const cols = ['todo','in_progress','done'];

  return (
    <section>
      <h1>Board</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {cols.map(col => (
          <div key={col} className="card" aria-label={`Column ${col}`}>
            <h2 style={{ textTransform: 'capitalize' }}>{col.replace('_',' ')}</h2>
            {issues.filter(i => i.status === col).map(i => (
              <div key={i.id} className="card" style={{ marginBottom: 8 }}>
                <strong>{i.key}</strong> {i.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
