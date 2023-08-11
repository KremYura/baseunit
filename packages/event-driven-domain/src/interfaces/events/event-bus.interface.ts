import { IBaseEvent } from './event.interface';

export type EventHandlerFunciton<T> = (e: T) => void;

export interface IEventBus<BaseEvent extends IBaseEvent<any>, HandlerDefinition> {
  registerEventHandler(eventName: string, handlerDefinition: HandlerDefinition): void;
  emit(event: BaseEvent): Promise<void>;
  handleEvent(event: BaseEvent, handlerDefinitions: HandlerDefinition[]): Promise<void>;
  /**
   * TODO: What if we implement saga not as IEventBus functions, but allow collect different types as 
   * different HandlerDefinition?
   */
  // registerSaga(eventName: string, handler: (handlerDefinition: HandlerDefinition) => void): void;
}