import { AggregateRoot } from '@baseunit/edd';
import { UserActivatedEvent, UserCreatedEvent } from './events';

export class User extends AggregateRoot {
  private active = false;

  static create(id: string): User {
    const user = new User(id)
    user.apply(new UserCreatedEvent(user.id));
    return user;
  }
  
  protected onUserCreatedEvent(event: UserCreatedEvent) {
    // do some
  }

  activate() {
    if (this.active) {
      throw Error('User already activated');
    } else {
      this.apply(new UserActivatedEvent(this.id));
    }
  }
  protected onUserActivatedEvent(event: UserActivatedEvent) {
    this.active = true;
  }
}
