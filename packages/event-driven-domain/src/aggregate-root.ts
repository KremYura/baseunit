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

  /**
   * Creates Aggregate with unique identifier
   * @param {*} id unique identifier
   */
  constructor(public readonly id: AggregateIdType) {}

  /**
   * Aggregate version
   */
  public get version() {
    return this[AGGREGATE_VERSION];
  }
  private set version(version: number) {
    this[AGGREGATE_VERSION] = version;
  }

  /**
   * Returns array of events applied to current Aggregate
   */
  getUncommittedEvents(): BaseEvent[] {
    return this[INTERNAL_EVENTS];
  }

  /**
   * Process events by calling `await publisher.publishAll` method
   * @param {IEventPublisher} publisher
   */
  async commit(publisher: IEventPublisher<BaseEvent>): Promise<void> {
    const events = this.getUncommittedEvents();
    await publisher.publishAll(events);
    this[INTERNAL_EVENTS] = [];
  }

  /**
   * Restore state of aggregate applying every event with `this.apply(event, true)`
   * @param {BaseEvent[]} history
   */
  loadFromHistory(history: BaseEvent[]) {
    history.forEach((event) => this.apply(event, true));
  }

  /**
   * Apply event to Aggregate by calling its corresponding `onMethod` implementation.
   * If isFromHistory set as true, do not register event for future commit
   * @param {BaseEvent} event
   * @param {boolean} [isFromHistory=false]
   */
  protected apply(event: BaseEvent, isFromHistory = false) {
    // TODO: rethink this approach, is it fine?
    event.meta.aggregateType = this.constructor.name;

    if (!isFromHistory) {
      // set event version as next verion of aggregate
      event.meta.version = this.version + 1;
      // add event for future publishing
      this[INTERNAL_EVENTS].push(event);
    }

    // set aggregate version as version of applied event
    this.version = event.meta.version;

    const handler = this.getEventHandler(event);
    
    if (handler) {
      try {
        handler.call(this, event);
      } catch (e) {
        // TODO: review what to do with this.version and event.meta.version if handler throws error
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
