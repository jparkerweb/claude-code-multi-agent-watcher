import Anthropic from '@anthropic-ai/sdk';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

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
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not found in environment variables, falling back to Anthropic');
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not found in environment variables');
  }
  
  try {
    const client = new Anthropic({ apiKey });
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
    
    // 30% of the time, include the engineer name in the prompt if available
    const engineerName = process.env.ENGINEER_NAME;
    const useEngineerName = engineerName && Math.random() < 0.3;
    
    let prompt = `Generate a one-sentence summary of this Claude Code hook event payload for an engineer monitoring the system.

Event Type: ${event_type}
Payload:
${payload_str}

Requirements:
- ONE sentence only (no period at the end)
- Focus on the key action or information in the payload
- Be specific and technical
- Keep under 15 words
- Use present tense
- No quotes or formatting
- Return ONLY the summary text`;
    
    if (useEngineerName) {
      prompt += `\n- Personalize the summary for engineer ${engineerName}`;
    }
    
    prompt += `\n\nExamples:\n- Reads configuration file from project root\n- Executes npm install to update dependencies\n- Searches web for React documentation\n- Edits database schema to add user table\n- Agent responds with implementation plan`;
    
    if (useEngineerName) {
      prompt += `\n- ${engineerName} reviews the code changes\n- ${engineerName} debugs the authentication issue\n- ${engineerName} implements the new feature`;
    }
    
    prompt += `\n\nGenerate the summary based on the payload:`;
    
    if (providerResult.provider === 'anthropic') {
      const message = await providerResult.client.messages.create({
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
        model: 'claude-3-haiku-20240307',
      });
      
      if (message.content && message.content.length > 0) {
        const firstContentBlock = message.content[0];
        if (firstContentBlock && 'type' in firstContentBlock && firstContentBlock.type === 'text' && 'text' in firstContentBlock) {
          let summary = (firstContentBlock as any).text.trim();
          // Clean up the response
          summary = summary.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
          // Take only the first line if multiple
          summary = summary.split("\n")[0].trim();
          // Ensure it's not too long
          if (summary.length > 100) {
            summary = summary.substring(0, 97) + "...";
          }
          return summary;
        }
      }
    } else if (providerResult.provider === 'openrouter') {
      // For OpenRouter, we'll return null for now as we need to implement proper integration
      // This would require the AI SDK and generateText function
      console.warn('OpenRouter provider implementation needs AI SDK integration');
      return null;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating event summary:', error);
    return null;
  }
}
