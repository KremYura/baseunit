import { User } from './user-aggregate';
import { UserActivatedEvent, UserCreatedEvent } from './events';
import { Publisher } from './publisher';

export const simpleCreateAndActivateUser = async () => {
  const user = User.create('user-id-1');

  user.activate();
  // user.activate(); // throws an error
  const publisher = new Publisher();
  await user.commit(publisher);

  console.log('user', user);
}

export const simpleRestoreUser = async () => {
  const user = new User('user-id-1');

  const userCreatedEvent = new UserCreatedEvent('user-id-1');
  userCreatedEvent.meta.version = 1;
  const userActivatedEvent = new UserActivatedEvent('user-id-1');
  userActivatedEvent.meta.version = 2;

  user.loadFromHistory([userCreatedEvent, userActivatedEvent]);

  console.log('restored user', user);
}
