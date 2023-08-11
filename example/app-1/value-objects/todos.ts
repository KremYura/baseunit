import { AggregateRoot, BaseEvent, EventPublisher, IBaseEvent, ValueObject } from '@baseunit/edd';

// VO
class UUID extends ValueObject<string> {}
class ToDoDescription extends ValueObject<string> {}

// Events
abstract class DomainEvent extends BaseEvent<UUID> {}

class ToDoCreatedEvent extends DomainEvent {
  constructor(aggregateId: UUID, public readonly description: ToDoDescription, public readonly isCompleted: boolean) {
    super(aggregateId);
  }
}
class ToDoDescriptionUpdatedEvent extends DomainEvent {
  constructor(aggregateId: UUID, public readonly description: ToDoDescription) {
    super(aggregateId);
  }
}
class ToDoCompletedEvent extends DomainEvent {
  constructor(aggregateId: UUID) {
    super(aggregateId);
  }
}

// Aggregates
abstract class DomainAggregate extends AggregateRoot<UUID, DomainEvent> {}

class ToDo extends AggregateRoot<UUID, DomainEvent> {
  private description: ToDoDescription = new ToDoDescription('');
  private isCompleted: boolean = false;

  constructor(id: UUID) {
    super(id);
  }

  /**
   * create, TODO: what if instead of init and static create just use Publisher and create ToDoCreatedEvent?
   * what are other alternatives?
   */
  // create(description: ToDoDescription, isCompleted: boolean) {
  //   this.apply(new ToDoCreatedEvent(this.id, description, isCompleted));
  // }
  protected onToDoCreatedEvent(event: ToDoCreatedEvent) {
    this.description = event.description;
    this.isCompleted = event.isCompleted;
  }
  static create(id: UUID, description: ToDoDescription, isCompleted: boolean): ToDo {
    const todo = new ToDo(id);
    todo.apply(new ToDoCreatedEvent(todo.id, description, isCompleted)); // OK
    // todo.create(description, isCompleted);

    return todo;
  }
  // update description
  changeDescription(description: ToDoDescription) {
    this.apply(new ToDoDescriptionUpdatedEvent(this.id, description));
  }
  protected onToDoDescriptionUpdatedEvent(event: ToDoDescriptionUpdatedEvent) {
    this.description = event.description;
  }
  // complete todo
  complete() {
    if (this.isCompleted === false) {
      this.apply(new ToDoCompletedEvent(this.id));
    }
  }
  protected onToDoCompletedEvent(event: ToDoCompletedEvent) {
    this.isCompleted = true;
  }
}

class ToDoList extends DomainAggregate {
  todos: ToDo[] = [];
}

// Publisher
export class Publisher extends EventPublisher<DomainEvent> {
  async publish(event: DomainEvent): Promise<void> {
    console.log('publishing', event);
  }
}
const publisher = new Publisher();

(async () => {
  const todolist = new ToDoList(new UUID('todo-1'));

  const todo = ToDo.create(new UUID('todo-1'), new ToDoDescription('initial desc'), false);
  // const todo = new ToDo(new UUID('todo-1'))
  // console.log('created todo', todo);
  todo.changeDescription(new ToDoDescription('updated description'))
  // console.log('updated todo', todo);
  todo.complete();
  // console.log('completed todo?', todo);
  // console.log('completed todo? stringifyed', JSON.stringify(todo), todo.version);
  await todo.commit(publisher);
})();