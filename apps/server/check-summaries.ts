import Database from 'bun:sqlite';

const db = new Database('events.db');
const rows = db.query('SELECT hook_event_type, summary, datetime(timestamp/1000, "unixepoch") as time FROM events WHERE summary IS NOT NULL ORDER BY timestamp DESC LIMIT 10').all();

console.log('Recent events with summaries:');
console.log(JSON.stringify(rows, null, 2));

const totalEvents = db.query('SELECT COUNT(*) as count FROM events').get();
const eventsWithSummaries = db.query('SELECT COUNT(*) as count FROM events WHERE summary IS NOT NULL').get();

console.log(`\nTotal events: ${totalEvents.count}`);
console.log(`Events with summaries: ${eventsWithSummaries.count}`);