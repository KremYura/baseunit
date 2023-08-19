import { describe, expect, it } from 'vitest';
import { EventHandler, SagaHandler } from './handler-decorators';
import { EVENT_HANDLER_TYPE_METADATA, EVENT_NAME_KEY_METADATA } from '../constants';

class TestClass {
  // @ts-ignore
  @EventHandler('testEvent1')
  baseMethodWithDecorator1() {}

  // @ts-ignore
  @SagaHandler('testEvent2')
  baseMethodWithDecorator2() {}
}

describe('decorators', () => {
  it('should set TYPE and NAME metadata', () => {
    const handlerType1 = Reflect.getMetadata(EVENT_HANDLER_TYPE_METADATA, TestClass.prototype.baseMethodWithDecorator1);
    const handlerEventName1 = Reflect.getMetadata(EVENT_NAME_KEY_METADATA, TestClass.prototype.baseMethodWithDecorator1);

    const handlerType2 = Reflect.getMetadata(EVENT_HANDLER_TYPE_METADATA, TestClass.prototype.baseMethodWithDecorator2);
    const handlerEventName2 = Reflect.getMetadata(EVENT_NAME_KEY_METADATA, TestClass.prototype.baseMethodWithDecorator2);

    expect(handlerType1).toBe('event-handler');
    expect(handlerEventName1).toBe('testEvent1');
    expect(handlerType2).toBe('saga-handler');
    expect(handlerEventName2).toBe('testEvent2');
  })
});