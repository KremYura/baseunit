# Description

Event-Driven Domain implementation helper.

The Event-Driven Domain implementation helper is a flexible and framework-agnostic solution that empowers developers to create applications using a Domain-Driven Design (DDD) approach within Event-Driven architectures.

Inspired by the principles of Effective Aggregate Design by Vaughn Vernon and NestJS/CQRS implementation, this library provides a set of helper functions, classes, decorators, and interfaces.

## Key Features

- Simplify the implementation of applications using a DDD approach and Event-Driven architecture.
- Leverage a variety of helper functions and classes to streamline your development process.
- Utilize decorators to define event handlers, (commands, and queries - future) effortlessly.
- Stay framework-agnostic, allowing seamless integration with different technologies.

Whether you're adhering strictly to Effective Aggregate Design principles or simply seeking to implement DDD with an Event-Driven twist, this library provides the tools you need to build robust and maintainable applications.

## Usage

### Aggregate

An AggregateRoot is where business domain logic is implemented. It enforces invariants, created using factory functions, and has a constructor with just an ID parameter. State changes are made through method calls that emit events. Actual state changes are handled by implementing `onEventName` methods. State restoration is achieved through `loadFromHistory` method calls.

```typescript
export class User extends AggregateRoot {
  // state properties are private to prevent update from outside
  private name: string | undefined;
  private active = false;

  // onEventName methods example with actual state mutation
  protected onUserCreatedEvent(event: UserCreatedEvent) {
    this.name = event.name;
  }

  activate() {
    // business requirement implementation, assume we want prevent activation if the User is already active
    if (this.active) {
      throw Error('User already activated');
    } else {
      this.apply(new UserActivatedEvent(this.id)); // change introduced via Event
    }
  }
  // UserActivatedEvent event handler with actual state change
  protected onUserActivatedEvent(event: UserActivatedEvent) {
    this.active = true;
  }
}
```

```typescript
// User factory, can be implemented as static method in User aggregate
const createFactory = (id: string, name: string): User => {
  const user = new User(id); // aggregate created with ID, no any other state related prop are passed

  user.apply(new UserCreatedEvent(user.id, name)); // change introduced via Event without any specific requirements
  return user;
}
```

```typescript
// State restoration
export class UserRepository {
  // ...

  // example for the case if we store Events in persistent storage
  async getById(id: string): User {
    const events = await this.eventRepository.getByAggregateId(id); // returns array of Events

    const user = new User(id);
    user.loadFromHistory(events);

    return user;
  }

  // example for the case if we store Aggregate as Entity
  async getById(id: string): User {
    const userEntity = await this.userEntityRepository.getById(id); // returns UserEntity record

    const restoredEvent = new UserRestoredEvent(userEntity.id, userEntity.name, userEntity.active);
    user.loadFromHistory([restoredEvent]);

    // NOTE: UserRestoredEvent and its corresponding onUserRestoredEvent must be implemented for User aggregate
    return user;
  }
}
```

### Value Objects

Value objects are objects that do not have a unique identity; they are identified by their attributes. They are immutable and are used to represent concepts with no conceptual identity, such as dates, currencies, or measurements.

```typescript
import { ValueObject } from '@baseunit/edd';

type CurrencyProps = {
  code: string;
  name: string;
}

export class Currency extends ValueObject<CurrencyProps> {
  constructor(props: CurrencyProps) {
    super(props);
  }

  getCode(): string {
    return this.value.code;
  }

  getName(): string {
    return this.value.name;
  }
}

// Usage
const usd1 = new Currency({ code: 'USD', name: 'US Dollar' });
const usd2 = new Currency({ code: 'USD', name: 'US Dollar' });

console.log(usd1.equals(usd2)); // Output: true
console.log(usd1 === usd2);     // Output: false (reference comparison)
console.log(usd1.getCode());    // Output: 'USD'
console.log(usd1.getName());    // Output: 'US Dollar'
console.log(usd1.value);        // Output: { code: 'USD', name: 'US Dollar' }
```

```typescript
// UUID implementation example
import { ValueObject, AggregateRoot, BaseEvent } from '@baseunit/edd';

export class UUID extends ValueObject<string> {
  constructor(value: string) {
    // Make sure the provided value is a valid UUID
    if (!UUID.isValidUUID(value)) {
      throw new Error('Invalid UUID format.');
    }
    super(value);
  }
  // Helper method to validate UUID format
  private static isValidUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
  // Generate a new random UUID
  static generate(): UUID {
    return new UUID(uuidv4());
  }
}
```

```typescript
// UUID ValueObject example can be used with Aggregate, if we would like to have Aggregate with non string id type
abstract class DomainEvent extends BaseEvent<UUID> {}

export class UserCreatedEvent extends DomainEvent { /***/ }

export class User extends AggregateRoot<UUID, DomainEvent> { /***/ }
```

### EventPublisher

Serves functionality with actual Event processing. Can we implemented to store Events in persistent storage, publish them into Queue, etc.

```typescript
import { BaseEvent, EventPublisher } from '@baseunit/edd';

export class Publisher extends EventPublisher<BaseEvent> {
  // ...
  async publish(event: BaseEvent): Promise<void> {
    // example 1 (persistent storage)
    // await this.eventRepository.save(event);

    // example 2 (AWS SNS)
    await snsClient.send(
      new PublishCommand({
        Message: JSON.parse(JSON.stringify(event)),
        TopicArn: topicArn,
      })
    );
  }
}
```

### EventBus and EventSubscriber

The EventBus and EventSubscriber are designed for reacting to events.

The EventBus offers the ability to aggregate event handlers and manage their execution. It serves as a central hub for managing event handling. Handlers registered with the EventBus can respond to events across the application, enabling organized and controlled event processing.

The EventSubscriber functionality is tailored for the consumption of messages. It handles the process of deserializing Messages into Events and then forwards these events to the EventBus.

```typescript
import { EventBus, EventSubscriber } from '@baseunit/edd';
```