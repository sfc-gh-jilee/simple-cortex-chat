# Cortex Chat

A simple, modern chat application that connects to Snowflake Cortex REST API for AI-powered conversations.

## Features

- **Multiple AI Models**: Choose from Claude, Llama, Mistral, GPT-4o, and more
- **Streaming Responses**: Real-time token streaming via Server-Sent Events
- **Conversation History**: Full context maintained across messages
- **Modern UI**: Clean, responsive design with dark theme
- **Secure**: Credentials stored in memory only, never persisted

## Prerequisites

- Node.js 18+ 
- A Snowflake account with Cortex access
- A Programmatic Access Token (PAT) from Snowflake

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Connect to Snowflake

1. Open `http://localhost:5173` in your browser
2. Enter your Snowflake account URL (e.g., `https://myorg-myaccount.snowflakecomputing.com`)
3. Enter your Programmatic Access Token
4. Select an AI model
5. Click "Connect to Cortex"

## Getting a Programmatic Access Token

1. Log in to Snowflake
2. Click your user menu (top right)
3. Select **Preferences**
4. Navigate to **Programmatic Access Tokens**
5. Create a new token and copy it

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **CSS Variables** for theming
- **Snowflake Cortex REST API**

## API Reference

This app uses the [Snowflake Cortex REST API](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api) for AI completions.

## License

MIT

