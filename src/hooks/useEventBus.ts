import { useEffect, useCallback } from 'react';

// Simple event bus implementation for cross-component communication
class EventBus {
  private events: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// Global event bus instance
const eventBus = new EventBus();

export const useEventBus = (eventName: string, callback: Function) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    // Subscribe to the event
    eventBus.on(eventName, memoizedCallback);

    // Cleanup: unsubscribe when component unmounts or dependencies change
    return () => {
      eventBus.off(eventName, memoizedCallback);
    };
  }, [eventName, memoizedCallback]);

  // Optional: return a function to emit events
  const emit = useCallback((data?: any) => {
    eventBus.emit(eventName, data);
  }, [eventName]);

  return { emit };
};

// Export the event bus instance for direct access if needed
export { eventBus };
