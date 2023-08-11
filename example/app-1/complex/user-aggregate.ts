import { AggregateRoot } from '@baseunit/edd';
import { UserActivatedEvent, UserCreatedEvent } from './events';
import { DomainEvent } from './domain-event';

const DEFAULT_CREDITS_AMOUNT = 100;
const ACTIVATION_COST = 50;

export class User extends AggregateRoot<string, DomainEvent> {
  private active = false;
  private credits: number = 0;

  static create(id: string): User {
    const user = new User(id);
    user.apply(new UserCreatedEvent(user.id, DEFAULT_CREDITS_AMOUNT));

    return user;
  }
  protected onUserCreatedEvent(event: UserCreatedEvent) {
    this.credits = event.credits;
  }

  activate(allowDoubleActivation: boolean = false) {
    if (this.active && allowDoubleActivation === false) {
      throw Error('User already activated');
    }
    if (this.credits < ACTIVATION_COST) {
      throw Error('Not enough credits');
    }

    this.apply(new UserActivatedEvent(this.id, ACTIVATION_COST));
  }
  protected onUserActivatedEvent(event: UserActivatedEvent) {
    this.active = true;
    this.credits = this.credits - event.activationCost;
  }


}