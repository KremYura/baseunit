import { AggregateRoot, BaseEvent } from '@baseunit/edd';

export class DomainEvent extends BaseEvent {}
export class ToDoCreatedEvent extends DomainEvent {}
export class ToDoCompletedEvent extends DomainEvent {}

export class ToDo extends AggregateRoot {
  static create(id: string): ToDo {
    const todo = new ToDo(id);
    todo.apply(new ToDoCreatedEvent(todo.id));
    todo.apply(new ToDoCompletedEvent(todo.id));

    return todo;
  }
}