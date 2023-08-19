import { describe, expect, it } from 'vitest';
import { EventHandler, SagaHandler } from './handler-decorators';
import { exploreHandlers } from './explorer';

class Base {
  // @ts-ignore
  @EventHandler('baseEventTestName')
  baseMethodWithDecorator() {}
}
const classPropName = Symbol('symbolMethodWithDecorator');

class Test extends Base {
  // @ts-ignore
  @EventHandler('eventTestName')
  async classMethodWithDecorator() {}

  set value(v: string) {
    console.log(v)
  }
  get value(): string {
    return 'some value';
  }

  // @ts-ignore
  @SagaHandler('sagaTestEventName')
  [classPropName]() {
    console.log('Symbol name call');
  };
}

describe('exploreHandlers', () => {
  it('should return decorated method from class instance', () => {
    const instance = new Test();

    const handlers = exploreHandlers(instance);
    const classMethodEventHandlerDefinitions = handlers.filter(handlerDefinition => handlerDefinition.eventName === 'eventTestName');
    
    expect(classMethodEventHandlerDefinitions.length).toBe(1);
    expect(classMethodEventHandlerDefinitions[0]).toStrictEqual({
      callback: Test.prototype.classMethodWithDecorator,
      eventName: 'eventTestName',
      instance: instance,
      type: 'event-handler',
    });
  });

  it('should return decorated method from class instance when name is a Symbol', () => {
    const instance = new Test();

    const handlers = exploreHandlers(instance);

    const classMethodSagaHandlerDefinitions = handlers.filter(handlerDefinition => handlerDefinition.eventName === 'sagaTestEventName');

    expect(classMethodSagaHandlerDefinitions.length).toBe(1);
    expect(classMethodSagaHandlerDefinitions[0]).toStrictEqual({
      callback: Test.prototype[classPropName],
      eventName: 'sagaTestEventName',
      instance: instance,
      type: 'saga-handler',
    });
  });

  it('should return decorated method from base class', () => {
    const instance = new Test();

    const handlers = exploreHandlers(instance);

    const classMethodSagaHandlerDefinitions = handlers.filter(handlerDefinition => handlerDefinition.eventName === 'baseEventTestName');
    expect(classMethodSagaHandlerDefinitions.length).toBe(1);
    expect(classMethodSagaHandlerDefinitions[0]).toStrictEqual({
      callback: Test.prototype.baseMethodWithDecorator,
      eventName: 'baseEventTestName',
      instance: instance,
      type: 'event-handler',
    });
  });
});