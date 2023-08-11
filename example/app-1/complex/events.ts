import { DomainEvent } from './domain-event';

export class UserCreatedEvent extends DomainEvent {
  constructor(aggregateId: string, public readonly credits: number) {
    super(aggregateId);
  }
}

export class UserActivatedEvent extends DomainEvent {
  constructor(aggregateId: string, public readonly activationCost: number) {
    super(aggregateId);
  }
}