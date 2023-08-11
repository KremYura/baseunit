import { Subject, concatMap, defer, mergeMap } from 'rxjs';
import { EventBus, EventHandlerFunciton, EventPublisher, EventSubscriber } from '@baseunit/edd';
import { DomainEvent, ToDo, ToDoCompletedEvent, ToDoCreatedEvent } from './domain';

type HandlerDefinition<T> = {
  callback: EventHandlerFunciton<T>,
  context: object,
};

class Bus extends EventBus<DomainEvent, HandlerDefinition<DomainEvent>> {
  async handleEvent(event: DomainEvent, handlerDefinitions: HandlerDefinition<DomainEvent>[]): Promise<void> {
    for (const handlerDefinition of handlerDefinitions) {
      await handlerDefinition.callback.call(handlerDefinition.context, event);
    }
  }
}

const bus = new Bus();

bus.registerEventHandler(ToDoCreatedEvent.name, {
  callback: (e: ToDoCreatedEvent) => {
    console.log('ToDoCreatedEvent handler', e);
  },
  context: {},
});
bus.registerEventHandler(ToDoCompletedEvent.name, {
  callback: (e: ToDoCompletedEvent) => {
    console.log('ToDoCompletedEvent handler', e);
  },
  context: {},
});

const subject$ = new Subject<DomainEvent>();

class Subscriber implements EventSubscriber<Bus> {
  constructor(readonly eventBus: Bus, private readonly subject$: Subject<DomainEvent>) {}

  async subscribe(): Promise<void> {
    // Subject example
    this.subject$.pipe(
      concatMap((event) => { // or mergeMap for paralell processing
        return defer(async () => {
          // 1sec delay for test
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          })
          await this.eventBus.emit(event);
        })
      })
    ).subscribe();
  }
}

class Publisher extends EventPublisher<DomainEvent> {
  constructor(private readonly subject$: Subject<DomainEvent>) {
    super();
  }

  async publish(event: DomainEvent): Promise<void> {
    console.log('publishing', event);
    this.subject$.next(event);
  }
}

(async () => {
  const publisher = new Publisher(subject$);
  const subscriber = new Subscriber(bus, subject$);
  await subscriber.subscribe(); // app start example

  const todo = ToDo.create('test');
  await todo.commit(publisher);
})();
