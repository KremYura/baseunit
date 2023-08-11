import { UserActivatedEvent, UserCreatedEvent } from './events';
import { Publisher } from './publisher';
import { User } from './user-aggregate';


export const complexCreateAndActivateUser = async () => {
  const user = User.create('user-id-1');

  user.activate();
  // user.activate(); // throws an User already activated error
  // user.activate(true); // activates user second time, spends all credits
  // user.activate(true); // throws an Not enough credits error
  const publisher = new Publisher();
  await user.commit(publisher);

  console.log('user', user);
}

export const complexRestoreUser = async () => {
  const user = new User('user-id-1');

  const userCreatedEvent = new UserCreatedEvent('user-id-1', 100);
  userCreatedEvent.meta.version = 1;
  const userActivatedEvent = new UserActivatedEvent('user-id-1', 50);
  userActivatedEvent.meta.version = 2;

  user.loadFromHistory([userCreatedEvent, userActivatedEvent]);

  console.log('restored user', user);
}