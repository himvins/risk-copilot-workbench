
import { useEffect, useState, useCallback } from 'react';
import { Subscription } from 'rxjs';
import { messageBus } from '@/lib/messageBus';

/**
 * Hook for subscribing to messages on a specific topic
 * @param topic The topic to subscribe to
 * @returns The latest payload received on this topic
 */
export function useSubscription<T>(topic: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  
  useEffect(() => {
    const subscription = messageBus.subscribe<T>(topic, (payload) => {
      setValue(payload);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [topic]);
  
  return value;
}

/**
 * Hook for publishing messages to a specific topic
 * @param topic The topic to publish to
 * @returns A function to publish messages to this topic
 */
export function usePublisher<T>(topic: string) {
  return useCallback((payload: T) => {
    messageBus.publish(topic, payload);
  }, [topic]);
}

/**
 * Combined hook for both publishing and subscribing to a topic
 * @param topic The topic to publish to and subscribe from
 * @param initialValue Optional initial value
 * @returns [currentValue, publishFunction]
 */
export function useMessageBus<T>(topic: string, initialValue?: T): [T | undefined, (payload: T) => void] {
  const value = useSubscription<T>(topic, initialValue);
  const publish = usePublisher<T>(topic);
  
  return [value, publish];
}
