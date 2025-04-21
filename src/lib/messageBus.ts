
import { Subject, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// Define the message structure
export interface Message<T = unknown> {
  topic: string;
  payload: T;
}

// Create a singleton message bus
class MessageBus {
  private subject = new Subject<Message>();
  private readonly bus$: Observable<Message> = this.subject.asObservable();
  private lastValues: Map<string, any> = new Map();

  /**
   * Publish a message to a specific topic
   * @param topic The topic to publish to
   * @param payload The data to send
   */
  publish<T>(topic: string, payload: T): void {
    this.subject.next({ topic, payload });
    this.lastValues.set(topic, payload);
    console.log(`[MessageBus] Published to ${topic}:`, payload);
  }

  /**
   * Subscribe to messages on a specific topic
   * @param topic The topic to subscribe to
   * @param callback The function to call when a message is received
   * @returns A subscription that can be unsubscribed from
   */
  subscribe<T>(topic: string, callback: (payload: T) => void): Subscription {
    return this.bus$
      .pipe(
        filter(message => message.topic === topic),
        map(message => message.payload as T)
      )
      .subscribe({
        next: payload => {
          console.log(`[MessageBus] Received on ${topic}:`, payload);
          callback(payload);
        },
        error: err => console.error(`[MessageBus] Error on ${topic}:`, err)
      });
  }

  /**
   * Get the last value published to a topic
   * @param topic The topic to get the last value for
   * @returns The last value published to the topic, or undefined if none
   */
  getLastValue<T>(topic: string): T | undefined {
    return this.lastValues.get(topic) as T | undefined;
  }
}

// Export a singleton instance
export const messageBus = new MessageBus();
