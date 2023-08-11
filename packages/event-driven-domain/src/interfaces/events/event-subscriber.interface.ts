import { IEventBus } from './event-bus.interface';
import { IBaseEvent } from './event.interface';

// TODO: implement unsubscribe, aka - stop method interface
export interface IEventSubscriber<EventBus extends IEventBus<IBaseEvent<any>, any>> {
  readonly eventBus: EventBus;
  subscribe(): Promise<void>;
}