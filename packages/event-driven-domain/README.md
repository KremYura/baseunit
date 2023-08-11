# Description

Event-Driven Domain implementation helper.

The Event-Driven Domain implementation helper is a flexible and framework-agnostic solution that empowers developers to create applications using a Domain-Driven Design (DDD) approach within Event-Driven architectures.

Inspired by the principles of Effective Aggregate Design by Vaughn Vernon and NestJS/CQRS limplementation, this library provides a set of helper functions, classes, decorators, and interfaces.

## Key Features

- Simplify the implementation of applications using a DDD approach and Event-Driven architecture.
- Leverage a variety of helper functions and classes to streamline your development process.
- Utilize decorators to define event handlers, (commands, and queries - future) effortlessly.
- Stay framework-agnostic, allowing seamless integration with different technologies.

Whether you're adhering strictly to Effective Aggregate Design principles or simply seeking to implement DDD with an Event-Driven twist, this library provides the tools you need to build robust and maintainable applications.

## Usage

```sh
npm install --save @baseunit/edd
```

```typescript
import { BaseEvent, EventPublisher} from '@baseunit/edd';
import { AggregateRoot } from '@baseunit/edd';

export class Publisher extends EventPublisher<BaseEvent> {
  async publish(event: BaseEvent): Promise<void> {
    console.log('publishing', event);
  }
}

export class UserCreatedEvent extends BaseEvent {
  constructor(aggregateId: string, public readonly name: string) {
    super(aggregateId);
  }
}

export class User extends AggregateRoot {
  private name: string | undefined;

  static create(id: string, name: string): User {
    const user = new User(id);

    user.apply(new UserCreatedEvent(user.id, name));
    return user;
  }
  protected onUserCreatedEvent(event: UserCreatedEvent) {
    this.name = event.name;
  }
}

// usage
(async () => {
  const publisher = new Publisher();

  const user = User.create('user-id-1', 'EDD');
  // do other stuff with user instance
  await user.commit(publisher); // logs every event with console.log('publishing', event);
})();
```