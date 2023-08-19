import { describe, expect, it, vi } from 'vitest';
import { EventBus } from './event-bus';
import { BaseEvent } from './base-event';

type HandlerDefinition = (e: BaseEvent) => void;
class TestEventBus extends EventBus<BaseEvent, HandlerDefinition> {
  handleEvent(event: BaseEvent<string>, handlerDefinitions: HandlerDefinition[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

describe('EventBus', () => {
  it('should add handler to internal Map', () => {
    const teb = new TestEventBus();
    teb.registerEventHandler('testEvent', () => {});

    const handlers: Map<string, HandlerDefinition> = Reflect.get(teb, 'eventHandlers')

    expect(handlers.size).toBe(1);
  });

  it('should update event handler with multiple handlers', () => {
    const teb = new TestEventBus();
    teb.registerEventHandler('testEvent', () => {}); // handler 1
    teb.registerEventHandler('testEvent', () => {}); // handler 2

    const handlers: Map<string, HandlerDefinition> = Reflect.get(teb, 'eventHandlers')

    expect(handlers.size).toBe(1);
    expect(handlers.get('testEvent')?.length).toBe(2);
  });

  it('should call handleEvent with registred handlers', async () => {
    const teb = new TestEventBus();
    class TestEvent extends BaseEvent {};
    const testHandler1 = () => {};
    const testHandler2 = () => {}
    teb.registerEventHandler('TestEvent', testHandler1);
    teb.registerEventHandler('TestEvent', testHandler2);

    const handleEventSpy = vi.spyOn(teb, 'handleEvent').mockResolvedValue();

    await teb.emit(new TestEvent('aggId'));

    expect(handleEventSpy).toHaveBeenCalledWith(new TestEvent('aggId'), [testHandler1, testHandler2]);
  });
});