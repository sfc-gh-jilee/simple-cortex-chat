import type { CortexConfig, CortexMessage, CortexRequestBody, CortexStreamResponse } from '../types';

/**
 * Builds the Cortex REST API endpoint URL
 */
function buildEndpointUrl(accountUrl: string): string {
  // Remove trailing slash if present
  const baseUrl = accountUrl.replace(/\/$/, '');
  return `${baseUrl}/api/v2/cortex/inference:complete`;
}

/**
 * Parses a Server-Sent Events line into a CortexStreamResponse object
 */
function parseSSELine(line: string): CortexStreamResponse | null {
  // SSE format: "data: {json}" or "data: [DONE]"
  if (!line.startsWith('data:')) {
    return null;
  }

  const data = line.slice(5).trim();
  
  if (data === '[DONE]') {
    return null;
  }

  try {
    return JSON.parse(data) as CortexStreamResponse;
  } catch {
    console.warn('Failed to parse SSE data:', data);
    return null;
  }
}

/**
 * Streams a chat completion from Snowflake Cortex REST API
 * 
 * @param config - Cortex configuration (account URL, token, model)
 * @param messages - Conversation history
 * @param onToken - Callback for each streamed token
 * @param onError - Callback for errors
 * @param onComplete - Callback when streaming completes
 * @param signal - AbortSignal for cancellation
 */
export async function streamChatCompletion(
  config: CortexConfig,
  messages: CortexMessage[],
  onToken: (token: string) => void,
  onError: (error: string) => void,
  onComplete: () => void,
  signal?: AbortSignal
): Promise<void> {
  const endpoint = buildEndpointUrl(config.accountUrl);
  
  const requestBody: CortexRequestBody = {
    model: config.model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorBody = await response.text();
        const errorJson = JSON.parse(errorBody);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.error) {
          errorMessage = typeof errorJson.error === 'string' 
            ? errorJson.error 
            : errorJson.error.message || errorMessage;
        }
      } catch {
        // Use default error message
      }
      
      onError(errorMessage);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('Failed to get response stream reader');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const parsed = parseSSELine(trimmedLine);
        if (parsed && parsed.choices?.[0]?.delta?.content) {
          onToken(parsed.choices[0].delta.content);
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const parsed = parseSSELine(buffer.trim());
      if (parsed && parsed.choices?.[0]?.delta?.content) {
        onToken(parsed.choices[0].delta.content);
      }
    }

    onComplete();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        onComplete();
        return;
      }
      onError(error.message);
    } else {
      onError('An unexpected error occurred');
    }
  }
}

/**
 * Tests the connection to Snowflake Cortex API
 */
export async function testConnection(config: CortexConfig): Promise<{ success: boolean; error?: string }> {
  const endpoint = buildEndpointUrl(config.accountUrl);
  
  const requestBody: CortexRequestBody = {
    model: config.model,
    messages: [{ role: 'user', content: 'Hi' }],
    max_tokens: 5,
    stream: false,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorBody = await response.text();
        const errorJson = JSON.parse(errorBody);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // Use default error message
      }
      
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Connection failed' };
  }
}

