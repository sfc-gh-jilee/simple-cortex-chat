import { useState } from 'react';
import type { CortexConfig, CortexModel } from '../types';
import { AVAILABLE_MODELS } from '../types';
import { testConnection } from '../services/cortexApi';
import './ConfigPanel.css';

interface ConfigPanelProps {
  onConnect: (config: CortexConfig) => void;
}

export function ConfigPanel({ onConnect }: ConfigPanelProps) {
  const [accountUrl, setAccountUrl] = useState('');
  const [token, setToken] = useState('');
  const [selectedModel, setSelectedModel] = useState<CortexModel>(AVAILABLE_MODELS[0]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    const config: CortexConfig = {
      accountUrl: accountUrl.trim(),
      token: token.trim(),
      model: selectedModel.id,
    };

    // Validate inputs
    if (!config.accountUrl) {
      setError('Please enter your Snowflake account URL');
      setIsConnecting(false);
      return;
    }

    if (!config.token) {
      setError('Please enter your access token');
      setIsConnecting(false);
      return;
    }

    // Test connection
    const result = await testConnection(config);
    
    if (result.success) {
      onConnect(config);
    } else {
      setError(result.error || 'Connection failed');
    }
    
    setIsConnecting(false);
  };

  return (
    <div className="config-panel">
      <div className="config-panel__container">
        <div className="config-panel__header">
          <div className="config-panel__logo">
            <svg viewBox="0 0 100 100" fill="none" className="config-panel__logo-icon">
              <path d="M50 5L50 95M50 5L35 20M50 5L65 20M50 95L35 80M50 95L65 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M11 27.5L89 72.5M11 27.5L11 47.5M11 27.5L28 22M89 72.5L89 52.5M89 72.5L72 78" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M11 72.5L89 27.5M11 72.5L11 52.5M11 72.5L28 78M89 27.5L89 47.5M89 27.5L72 22" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="config-panel__title">Cortex Chat</h1>
          <p className="config-panel__subtitle">
            Connect to Snowflake Cortex to start chatting with AI
          </p>
        </div>

        <form className="config-panel__form" onSubmit={handleSubmit}>
          <div className="config-panel__field">
            <label className="config-panel__label" htmlFor="accountUrl">
              Snowflake Account URL
            </label>
            <input
              id="accountUrl"
              type="url"
              className="config-panel__input"
              placeholder="https://myorg-myaccount.snowflakecomputing.com"
              value={accountUrl}
              onChange={(e) => setAccountUrl(e.target.value)}
              disabled={isConnecting}
            />
            <span className="config-panel__hint">
              Your Snowflake account URL (e.g., https://abc12345.us-east-1.snowflakecomputing.com)
            </span>
          </div>

          <div className="config-panel__field">
            <label className="config-panel__label" htmlFor="token">
              Access Token (PAT)
            </label>
            <div className="config-panel__input-group">
              <input
                id="token"
                type={showToken ? 'text' : 'password'}
                className="config-panel__input config-panel__input--with-button"
                placeholder="Your Programmatic Access Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isConnecting}
              />
              <button
                type="button"
                className="config-panel__toggle-btn"
                onClick={() => setShowToken(!showToken)}
                aria-label={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <span className="config-panel__hint">
              Generate a PAT in Snowflake: User Menu → Preferences → Programmatic Access Tokens
            </span>
          </div>

          <div className="config-panel__field">
            <label className="config-panel__label" htmlFor="model">
              Model
            </label>
            <select
              id="model"
              className="config-panel__select"
              value={selectedModel.id}
              onChange={(e) => {
                const model = AVAILABLE_MODELS.find((m) => m.id === e.target.value);
                if (model) setSelectedModel(model);
              }}
              disabled={isConnecting}
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
            <span className="config-panel__hint">
              {selectedModel.description}
            </span>
          </div>

          {error && (
            <div className="config-panel__error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="config-panel__submit"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="config-panel__spinner" />
                Connecting...
              </>
            ) : (
              'Connect to Cortex'
            )}
          </button>
        </form>

        <div className="config-panel__footer">
          <p>
            Your credentials are stored in memory only and never persisted.
          </p>
          <a
            href="https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api"
            target="_blank"
            rel="noopener noreferrer"
            className="config-panel__link"
          >
            Learn more about Cortex REST API →
          </a>
        </div>
      </div>
    </div>
  );
}

