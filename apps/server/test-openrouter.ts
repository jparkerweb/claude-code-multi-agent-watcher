import { generateEventSummary } from './src/summarizer';
import { HookEvent } from './src/summarizer';

// Test event data
const testEvent: HookEvent = {
  source_app: 'test',
  session_id: 'test-session',
  hook_event_type: 'TestEvent',
  payload: {
    message: 'This is a test event to verify OpenRouter summarization',
    details: 'Testing the implementation of OpenRouter provider with AI SDK',
    timestamp: Date.now()
  }
};

async function testOpenRouter() {
  console.log('Testing OpenRouter summarization...');
  
  // Set environment variable to use OpenRouter
  process.env.ACTIVE_SUMMARIZATION_PROVIDER = 'openrouter';
  
  try {
    const summary = await generateEventSummary(testEvent);
    console.log('Summary generated:', summary);
  } catch (error) {
    console.error('Error testing OpenRouter summarization:', error);
  }
}

testOpenRouter();
