import { ref, onMounted, onUnmounted } from 'vue';
import type { HookEvent, WebSocketMessage } from '../types';
import { useSound } from './useSound';

export function useWebSocket(url: string) {
  const events = ref<HookEvent[]>([]);
  const isConnected = ref(false);
  const error = ref<string | null>(null);
  
  // Sound management
  const { playSound } = useSound();
  
  let ws: WebSocket | null = null;
  let reconnectTimeout: number | null = null;
  
  // Get max events from environment variable or use default
  const maxEvents = parseInt(import.meta.env.VITE_MAX_EVENTS_TO_DISPLAY || '100');
  
  const connect = () => {
    try {
      ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        isConnected.value = true;
        error.value = null;
      };
      
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'initial') {
            const initialEvents = Array.isArray(message.data) ? message.data : [];
            // Only keep the most recent events up to maxEvents
            events.value = initialEvents.slice(-maxEvents);
          } else if (message.type === 'event') {
            const newEvent = message.data as HookEvent;
            events.value.push(newEvent);
            
            // Play sound for specific events
            if (newEvent.hook_event_type === 'Notification') {
              playSound('notification');
            } else if (newEvent.hook_event_type === 'Stop') {
              playSound('stop');
            }
            
            // Limit events array to maxEvents, removing the oldest when exceeded
            if (events.value.length > maxEvents) {
              // Remove the oldest events (first 10) when limit is exceeded
              events.value = events.value.slice(events.value.length - maxEvents + 10);
            }
          } else if (message.type === 'clear') {
            events.value = [];
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        error.value = 'WebSocket connection error';
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        isConnected.value = false;
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };
    } catch (err) {
      console.error('Failed to connect:', err);
      error.value = 'Failed to connect to server';
    }
  };
  
  const disconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (ws) {
      ws.close();
      ws = null;
    }
  };
  
  const clearEvents = async () => {
    try {
      const response = await fetch('http://localhost:4000/events', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear events');
      }
      
      // Events will be cleared via WebSocket message
      return true;
    } catch (err) {
      console.error('Failed to clear events:', err);
      error.value = 'Failed to clear events';
      return false;
    }
  };
  
  onMounted(() => {
    connect();
  });
  
  onUnmounted(() => {
    disconnect();
  });
  
  return {
    events,
    isConnected,
    error,
    clearEvents
  };
}