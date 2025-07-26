#!/usr/bin/env bun

// Script to send test events to the WebSocket server

// WebSocket client
const ws = new WebSocket('ws://localhost:4000/stream');

ws.onopen = () => {
  console.log('Connected to WebSocket server');
  
  // Send a test Notification event
  const notificationEvent = {
    type: 'event',
    data: {
      id: 'test-notification-' + Date.now(),
      timestamp: Date.now(),
      source_app: 'Test App',
      session_id: 'test-session-123',
      hook_event_type: 'Notification',
      payload: 'This is a test notification event',
      chat: []
    }
  };
  
  console.log('Sending Notification event...');
  ws.send(JSON.stringify(notificationEvent));
  
  // Wait a bit then send a Stop event
  setTimeout(() => {
    const stopEvent = {
      type: 'event',
      data: {
        id: 'test-stop-' + Date.now(),
        timestamp: Date.now(),
        source_app: 'Test App',
        session_id: 'test-session-123',
        hook_event_type: 'Stop',
        payload: 'This is a test stop event',
        chat: []
      }
    };
    
    console.log('Sending Stop event...');
    ws.send(JSON.stringify(stopEvent));
    
    // Close connection after sending events
    setTimeout(() => {
      console.log('Closing connection...');
      ws.close();
    }, 1000);
  }, 2000);
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Connection closed');
};
