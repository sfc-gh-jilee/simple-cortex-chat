import { useState, useCallback, useRef } from 'react';
import type { CortexConfig, Message, CortexMessage } from '../types';
import { streamChatCompletion } from '../services/cortexApi';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import './ChatWindow.css';

interface ChatWindowProps {
  config: CortexConfig;
  onDisconnect: () => void;
}

export function ChatWindow({ config, onDisconnect }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(async (content: string) => {
    setError(null);
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Create placeholder assistant message
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    // Prepare messages for API (including history)
    const apiMessages: CortexMessage[] = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ];

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    await streamChatCompletion(
      config,
      apiMessages,
      // onToken
      (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + token,
            };
          }
          return updated;
        });
      },
      // onError
      (errorMsg) => {
        setError(errorMsg);
        setMessages((prev) => {
          // Remove the streaming message on error
          return prev.filter((m) => !m.isStreaming);
        });
        setIsLoading(false);
      },
      // onComplete
      () => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              isStreaming: false,
            };
          }
          return updated;
        });
        setIsLoading(false);
      },
      abortControllerRef.current.signal
    );
  }, [config, messages]);

  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="chat-window">
      <header className="chat-window__header">
        <div className="chat-window__header-left">
          <div className="chat-window__logo">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M50 10L50 90M50 10L38 25M50 10L62 25M50 90L38 75M50 90L62 75" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
              <path d="M15 30L85 70M15 30L15 45M15 30L28 26M85 70L85 55M85 70L72 74" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
              <path d="M15 70L85 30M15 70L15 55M15 70L28 74M85 30L85 45M85 30L72 26" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="chat-window__title">
            <h1>Cortex Chat</h1>
            <span className="chat-window__model">{config.model}</span>
          </div>
        </div>
        <div className="chat-window__header-right">
          <button
            className="chat-window__btn chat-window__btn--secondary"
            onClick={handleClearChat}
            disabled={messages.length === 0 && !isLoading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear
          </button>
          <button
            className="chat-window__btn chat-window__btn--ghost"
            onClick={onDisconnect}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Disconnect
          </button>
        </div>
      </header>

      {error && (
        <div className="chat-window__error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}

