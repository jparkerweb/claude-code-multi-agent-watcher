import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

interface HookEvent {
  id?: number;
  source_app: string;
  session_id: string;
  hook_event_type: string;
  payload: Record<string, any>;
  chat?: any[];
  summary?: string;
  timestamp?: number;
}

interface AnthropicProvider {
  provider: 'anthropic';
  client: Anthropic;
}

interface OpenRouterProvider {
  provider: 'openrouter';
  client: ReturnType<typeof createOpenRouter>;
}

type LLMProvider = AnthropicProvider | OpenRouterProvider;

async function getLLMProvider(): Promise<LLMProvider> {
  const provider = process.env.ACTIVE_SUMMARIZATION_PROVIDER?.toLowerCase() || 'anthropic';
  
  if (provider === 'openrouter') {
    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey) {
      console.warn('OPENROUTER_KEY not found in environment variables, falling back to Anthropic');
      return getAnthropicProvider();
    }
    
    try {
      const openrouter = createOpenRouter({ apiKey });
      return {
        provider: 'openrouter',
        client: openrouter,
      };
    } catch (error) {
      console.warn('Failed to initialize OpenRouter provider, falling back to Anthropic:', error);
      return getAnthropicProvider();
    }
  } else {
    // Default to Anthropic
    return getAnthropicProvider();
  }
}

async function getAnthropicProvider(): Promise<AnthropicProvider> {
  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_KEY not found in environment variables');
  }
  
  // Trim any whitespace
  const trimmedApiKey = apiKey.trim();
  
  try {
    const client = new Anthropic({ apiKey: trimmedApiKey });
    return {
      provider: 'anthropic',
      client,
    };
  } catch (error) {
    throw new Error(`Failed to initialize Anthropic provider: ${error}`);
  }
}

export async function generateEventSummary(eventData: HookEvent): Promise<string | null> {
  try {
    const providerResult = await getLLMProvider();
    
    const event_type = eventData.hook_event_type || 'Unknown';
    const payload = eventData.payload || {};
    
    // Convert payload to string representation
    let payload_str = JSON.stringify(payload, null, 2);
    if (payload_str.length > 1000) {
      payload_str = payload_str.substring(0, 1000) + '...';
    }
    
    let prompt = `Generate a concise summary of this Claude Code hook event payload for an engineer monitoring the system.

Event Type: ${event_type}
Payload:
${payload_str}

Requirements:
- keep it breif but descriptive
- Focus on the key action or information in the payload
- Dont reference the session_id in the summary
- Be specific and technical
- Use present tense
- No quotes or formatting
- Return ONLY the summary text`;
    
    prompt += `\n\nExamples:\n- Reads configuration file from project root\n- Executes npm install to update dependencies\n- Searches web for React documentation\n- Edits database schema to add user table\n- Agent responds with implementation plan`;
    prompt += `\n\nGenerate the summary based on the payload:`;
    
    if (providerResult.provider === 'anthropic') {
      const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
      const message = await providerResult.client.messages.create({
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
        model: anthropicModel,
      });
      
      if (message.content && message.content.length > 0) {
        const firstContentBlock = message.content[0];
        if (firstContentBlock && 'type' in firstContentBlock && firstContentBlock.type === 'text' && 'text' in firstContentBlock) {
          let summary = (firstContentBlock as any).text.trim();
          // Clean up the response
          summary = summary.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
          // Take only the first line if multiple
          // summary = summary.split("\n")[0].trim();
          // Ensure it's not too long
          if (summary.length > 250) {
            summary = summary.substring(0, 250) + "...";
          }
          return summary;
        }
      }
    } else if (providerResult.provider === 'openrouter' && providerResult.client) {
      try {
        const openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct';
        // Type assertion to ensure client is callable
        const client = providerResult.client as ReturnType<typeof createOpenRouter>;
        const result = await generateText({
          model: client(openRouterModel),
          prompt: prompt,
          maxTokens: 100,
        });
        
        if (result && result.text) {
          let summary = result.text.trim();
          // Clean up the response
          summary = summary.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
          // Take only the first line if multiple
          // summary = summary.split("\n")[0].trim();
          // Ensure it's not too long
          if (summary.length > 250) {
            summary = summary.substring(0, 250) + "...";
          }
          return summary;
        }
      } catch (error) {
        console.error('Error generating summary with OpenRouter:', error);
        // Fall back to no summary
      }
      return null;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating event summary:', error);
    return null;
  }
}
