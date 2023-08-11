import { EventPublisher, BaseEvent } from '@baseunit/edd';

export class Publisher extends EventPublisher<BaseEvent> {
  async publish(event: BaseEvent): Promise<void> {
    console.log('publishing', event);
  }
}