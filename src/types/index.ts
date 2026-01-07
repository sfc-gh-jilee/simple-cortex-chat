// Snowflake Cortex Configuration
export interface CortexConfig {
  accountUrl: string;
  token: string;
  model: string;
}

// Chat message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Cortex API Request/Response types
export interface CortexMessage {
  role: MessageRole;
  content: string;
}

export interface CortexRequestBody {
  model: string;
  messages: CortexMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// Server-Sent Events response structure
export interface CortexStreamChoice {
  delta?: {
    content?: string;
    role?: string;
  };
  index: number;
  finish_reason?: string | null;
}

export interface CortexStreamResponse {
  id: string;
  choices: CortexStreamChoice[];
  created: number;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Available Cortex models
export interface CortexModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export const AVAILABLE_MODELS: CortexModel[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Most capable Claude model for complex tasks',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Latest Claude with extended thinking capabilities',
  },
  {
    id: 'llama3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    description: 'Powerful open-source model',
  },
  {
    id: 'llama3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    description: 'Fast and efficient Llama model',
  },
  {
    id: 'llama3.2-3b',
    name: 'Llama 3.2 3B',
    provider: 'Meta',
    description: 'Lightweight model for quick responses',
  },
  {
    id: 'mistral-large2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    description: 'High-performance reasoning model',
  },
  {
    id: 'snowflake-arctic',
    name: 'Snowflake Arctic',
    provider: 'Snowflake',
    description: 'Enterprise-grade model by Snowflake',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'OpenAI flagship multimodal model',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast and cost-effective OpenAI model',
  },
];

// App state
export interface AppState {
  config: CortexConfig | null;
  messages: Message[];
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
}

