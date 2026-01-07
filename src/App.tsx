import { useState } from 'react';
import type { CortexConfig } from './types';
import { ConfigPanel, ChatWindow } from './components';
import './App.css';

function App() {
  const [config, setConfig] = useState<CortexConfig | null>(null);

  const handleConnect = (newConfig: CortexConfig) => {
    setConfig(newConfig);
  };

  const handleDisconnect = () => {
    setConfig(null);
  };

  return (
    <div className="app">
      {config ? (
        <ChatWindow config={config} onDisconnect={handleDisconnect} />
      ) : (
        <ConfigPanel onConnect={handleConnect} />
      )}
    </div>
  );
}

export default App;

