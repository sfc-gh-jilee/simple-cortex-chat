import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <div className="message-list__welcome">
          <div className="message-list__welcome-icon">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M50 5L50 95M50 5L35 20M50 5L65 20M50 95L35 80M50 95L65 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M11 27.5L89 72.5M11 27.5L11 47.5M11 27.5L28 22M89 72.5L89 52.5M89 72.5L72 78" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M11 72.5L89 27.5M11 72.5L11 52.5M11 72.5L28 78M89 27.5L89 47.5M89 27.5L72 22" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>Start a conversation</h2>
          <p>Send a message to begin chatting with Cortex AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="message-list__container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message message--${message.role}`}
          >
            <div className="message__avatar">
              {message.role === 'user' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ) : (
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                  <path d="M50 10L50 90M50 10L38 25M50 10L62 25M50 90L38 75M50 90L62 75" strokeLinecap="round"/>
                  <path d="M15 30L85 70M15 30L15 45M15 30L28 26M85 70L85 55M85 70L72 74" strokeLinecap="round"/>
                  <path d="M15 70L85 30M15 70L15 55M15 70L28 74M85 30L85 45M85 30L72 26" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div className="message__content">
              <div className="message__header">
                <span className="message__role">
                  {message.role === 'user' ? 'You' : 'Cortex'}
                </span>
                <span className="message__time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div className="message__text">
                {message.content}
                {message.isStreaming && (
                  <span className="message__cursor" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

