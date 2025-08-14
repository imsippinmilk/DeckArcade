import React from 'react';
import TextChat from '../comms/TextChat';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import './App.css';

const App: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DeckArcade</h1>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
      </header>
      <main>
        <TextChat />
      </main>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h2>Hello</h2>
        <p>This modal fades in smoothly.</p>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Close
        </Button>
      </Modal>
    </div>
  );
};

export default App;
