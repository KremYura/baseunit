import { EventPublisher, IEventPublisher } from '@baseunit/edd';
import { DomainEvent } from './domain-event';

// Example with abstract class usage
// export class Publisher extends EventPublisher<DomainEvent> {
//   async publish(event: DomainEvent): Promise<void> {
//     console.log('custom publisher, publishing into group', event.groupId, event);
//   }
// }

// Example with IEventPublisher usage
export class Publisher implements IEventPublisher<DomainEvent> {
  async publish(event: DomainEvent): Promise<void> {
    console.log('custom publisher, publishing into group', event.groupId, event);
  };
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  };
}
