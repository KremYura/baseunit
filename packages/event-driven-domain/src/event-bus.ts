import { IBaseEvent, IEventBus } from './interfaces';

/**
 * In the context of the provided implementation, the EventBus can indeed be seen as more of an EventController or EventHandlerService.
 * It primarily acts as a central registry for event handlers and sagas, allowing components to subscribe to specific events and react accordingly.
 * TODO: rename to EventController, EventHandlerService, EventRegistry
 */
export abstract class EventBus<BaseEvent extends IBaseEvent<any>, HandlerDefinition> implements IEventBus<BaseEvent, HandlerDefinition> {
  private readonly eventHandlers: Map<string, HandlerDefinition[]> = new Map();
  registerEventHandler(eventName: string, handlerDefinition: HandlerDefinition): void {
    const handlers = this.eventHandlers.get(eventName) || [];
    handlers.push(handlerDefinition);
    this.eventHandlers.set(eventName, handlers);
  }
  async emit(event: BaseEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.eventHandlers.get(eventType) || [];

    await this.handleEvent(event, handlers);
  }

  /**
   * Assume that handleEvent implemented as bellow:
   * 
   * @example
   * // sequential execution of handlers
   * for (const handler of handlerDefinitions) {
   *     await handler.callback.apply(handler.context, [event]);
   * }
   * @param event T
   * @param handlerDefinitions any[]
   */
  abstract handleEvent(event: BaseEvent, handlerDefinitions: HandlerDefinition[]): Promise<void>;
}