import { EventHandlerFunciton, EventPublisher, EventSubscriber, IEventBus } from '@baseunit/edd';
import { DomainEvent, ToDo, ToDoCompletedEvent, ToDoCreatedEvent } from './domain';
import EventEmitter from 'events';

class Bus<T extends DomainEvent> implements IEventBus<T, EventHandlerFunciton<T>> {
  private readonly eventHandlers: Map<string, EventHandlerFunciton<T>[]> = new Map();
  registerEventHandler(eventName: string, handler: EventHandlerFunciton<T>) {
    const handlers = this.eventHandlers.get(eventName) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventName, handlers);
  }

  async emit(event: T): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.eventHandlers.get(eventType) || [];

    await this.handleEvent(event, handlers);
  }

  async handleEvent(event: T, handlerDefinitions: EventHandlerFunciton<T>[]): Promise<void> {
    for (const handler of handlerDefinitions) {
      // handler.callback.apply(handler.context, [event]);
      await handler.call(this, event);
    }
  }
}

const bus = new Bus();

bus.registerEventHandler(ToDoCreatedEvent.name, (e: ToDoCreatedEvent) => {
  console.log('ToDoCreatedEvent handler', e);
});
bus.registerEventHandler(ToDoCompletedEvent.name, (e: ToDoCompletedEvent) => {
  console.log('ToDoCompletedEvent handler', e);
});

const emitter = new EventEmitter();

class Subscriber implements EventSubscriber<Bus<DomainEvent>> {
  constructor(readonly eventBus: Bus<DomainEvent>, private readonly emitter: EventEmitter) {}

  async subscribe(): Promise<void> {
    // setInterval(() => {
    //   this.eventBus.emit(new ToDoCreatedEvent('some-todo-id'));
    // }, 1000);
    this.emitter.on('*', async (data) => {
      await this.eventBus.emit(data);
    });
  }
}

class Publisher extends EventPublisher<DomainEvent> {
  constructor(private readonly emitter: EventEmitter) {
    super();
  }

  async publish(event: DomainEvent): Promise<void> {
    console.log('publishing', event);
    this.emitter.emit('*', event);
  }
}

(async () => {
  const publisher = new Publisher(emitter);
  const subscriber = new Subscriber(bus, emitter);

  await subscriber.subscribe(); // app start example

  const todo = ToDo.create('test');
  await todo.commit(publisher);
})();
