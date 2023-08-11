import { complexCreateAndActivateUser, complexRestoreUser } from './complex';
import { simpleCreateAndActivateUser, simpleRestoreUser } from './simple';

(async () => {
  console.log('simple');
  await simpleCreateAndActivateUser();
  await simpleRestoreUser();
  console.log('complex');
  await complexCreateAndActivateUser();
  await complexRestoreUser();
})();