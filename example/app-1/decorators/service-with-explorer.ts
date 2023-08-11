import { EventHandler, SagaHandler, exploreHandlers } from '@baseunit/edd';

class Base {
  test = '';
  @EventHandler('testBaseM')
  baseM() {}
}
const classPropName = Symbol('classPropName');
class Test extends Base {
  public a = '';
  @EventHandler('eventTestName')
  async doSome1() {}

  set value(v: string) {
    console.log(v)
  }
  get value(): string {
    return 'some value';
  }

  @SagaHandler('sagaTestEventName')
  [classPropName]() {
    console.log('Symbol name call');
  };
}
Object.defineProperty(Test.prototype, 'asDescriptor',{ value: 42, enumerable: true, configurable: true, writable: true })
const t = new Test();

const result = exploreHandlers(t);
console.log(result);
