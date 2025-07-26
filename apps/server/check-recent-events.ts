import { initDatabase, getRecentEvents } from './src/db';

// Initialize database
initDatabase();

// Get recent events
const events = getRecentEvents(10);

console.log('Recent Events:');
events.forEach((event, index) => {
  console.log(`\n${index + 1}. Event ID: ${event.id}`);
  console.log(`   Type: ${event.hook_event_type}`);
  console.log(`   Source: ${event.source_app}`);
  console.log(`   Session: ${event.session_id}`);
  console.log(`   Summary: ${event.summary || 'No summary'}`);
  console.log(`   Timestamp: ${new Date(event.timestamp || 0).toISOString()}`);
});
