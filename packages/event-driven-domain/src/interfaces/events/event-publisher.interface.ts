import { IBaseEvent } from './event.interface';

export interface IEventPublisher<BaseEvent extends IBaseEvent<any>> {
  publish(event: BaseEvent): Promise<void>;
  publishAll(events: BaseEvent[]): Promise<void>;
}