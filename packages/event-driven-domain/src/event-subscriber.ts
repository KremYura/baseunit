import { IEventBus, IEventSubscriber } from './interfaces';

export abstract class EventSubscriber<EventBus extends IEventBus<any, any>> implements IEventSubscriber<EventBus> {
  constructor(readonly eventBus: EventBus) {};
  /**
   * Goal is to have `await this.eventBus.emit(event);` call in subscribe implementation
   * @param args any
   */
  abstract subscribe(...args: any): Promise<void>;
}