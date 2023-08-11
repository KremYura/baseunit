import { IEventPublisher, IBaseEvent } from './interfaces';

export abstract class EventPublisher<BaseEvent extends IBaseEvent<any> = IBaseEvent<string>> implements IEventPublisher<BaseEvent> {
  abstract publish(event: BaseEvent): Promise<void>;
  
  async publishAll(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  };
}
