import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const Host: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <main className="container" style={{ display: 'grid', gap: '1rem' }}>
      <div className="card" style={{ padding: '1rem' }}>
        <h2>Host a Table</h2>
        <p>Spin up a lobby, set rules, share a PIN.</p>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Create Lobby
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="New Lobby">
        <label>
          Lobby Name
          <br />
          <input placeholder="e.g., Friday Night" aria-label="Lobby Name" />
        </label>
        <div style={{ marginTop: '.75rem', display: 'flex', gap: '.5rem' }}>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Start
          </Button>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </main>
  );
};
