import { EventHandlerFunciton, IBaseEvent, IEventPublisher } from './interfaces';

const INTERNAL_EVENTS = Symbol('events');
const AGGREGATE_VERSION = Symbol('version');

export abstract class AggregateRoot<AggregateIdType = string, BaseEvent extends IBaseEvent<AggregateIdType> = IBaseEvent<AggregateIdType>> {
  private [INTERNAL_EVENTS]: BaseEvent[] = [];
  /**
   * Version can be read from outside, but will be updated only while working with Events.
   * Getter and setter accessors do not agree in visibility for version.
   */
  private [AGGREGATE_VERSION] = 0;

  constructor(public readonly id: AggregateIdType) {}

  public get version() {
    return this[AGGREGATE_VERSION];
  }
  private set version(version: number) {
    this[AGGREGATE_VERSION] = version;
  }

  async commit(publisher: IEventPublisher<BaseEvent>): Promise<void> {
    const events = this[INTERNAL_EVENTS];
    await publisher.publishAll(events);
    this[INTERNAL_EVENTS] = [];
  }

  loadFromHistory(history: BaseEvent[]) {
    history.forEach((event) => this.apply(event, true));
  }

  protected apply(event: BaseEvent, isFromHistory = false) {
    // TODO: rethink this approach, is it fine?
    event.meta.aggregateType = this.constructor.name;

    if (!isFromHistory) {
      event.meta.version = this.version + 1;
      this[INTERNAL_EVENTS].push(event);
    }

    const handler = this.getEventHandler(event);
    
    if (handler) {
      try {
        handler.call(this, event);
        this.version = event.meta.version;
      } catch (e) {
        // if (e instanceof ValueObjectValidationError) {
        //   appLogger.error('Data inconsistency found during applying an event', event);
        // }

        throw e;
      }
    }
  }

  protected getEventHandler<K extends keyof this>(event: BaseEvent): EventHandlerFunciton<BaseEvent> | undefined {
    const handler = `on${this.getEventName(event)}` as K;
    return this[handler] as EventHandlerFunciton<BaseEvent> | undefined;
  }

  protected getEventName(event: BaseEvent): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
