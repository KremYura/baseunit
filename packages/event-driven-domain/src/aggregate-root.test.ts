import { describe, expect, it, beforeEach, vi, should } from 'vitest';
import { AggregateRoot } from './aggregate-root';
import { BaseEvent } from './base-event';
import { arrayBuffer } from 'stream/consumers';

class DomainEvent extends BaseEvent {};

describe('AggregateRoot', () => {
  it('should have id once created', () => {
    class TestAggregate extends AggregateRoot {};
    const agg = new TestAggregate('agg-id');
    expect(agg.id).toBe('agg-id');
  });

  it('should have id type same as in generic', () => {
    class TestAggregate extends AggregateRoot<number> {};
    const agg = new TestAggregate(1);
    expect(agg.id).toBeTypeOf('number');
  });

  it('should have version = 0 once created', () => {
    class TestAggregate extends AggregateRoot {};
    const agg = new TestAggregate('agg-id');
    expect(agg.version).toBe(0);
  });

  it('should have 0 events once created', () => {
    class TestAggregate extends AggregateRoot {};
    const agg = new TestAggregate('agg-id');
    
    expect(agg.getUncommittedEvents()).toEqual([]);
  });

  it('should provide event name as a string', () => {
    class TestAggregate extends AggregateRoot {};
    const agg = new TestAggregate('id');
    const getEventName = Reflect.get(agg, 'getEventName');

    const a = getEventName(new DomainEvent('id'));
    expect(a).toBe('DomainEvent');
  });

  it('should restore state with loadFromHistory', async () => {
    class TestAggregate extends AggregateRoot {};
    const agg = new TestAggregate('id');

    const applySpy = vi.spyOn(agg as any, 'apply');
    
    const event1 = new DomainEvent('id');
    event1.meta.version = 1;
    const event2 = new DomainEvent('id');
    event2.meta.version = 2;
    
    agg.loadFromHistory([event1, event2]);

    expect(agg.version).toBe(2);
    expect(applySpy).toHaveBeenNthCalledWith(1, event1, true);
    expect(applySpy).toHaveBeenNthCalledWith(2, event2, true);
  });

  describe('getEventHandler', () => {
    it('should return undefined if event handler function not defined', () => {
      class TestAggregate extends AggregateRoot {};
      const agg = new TestAggregate('id');
      const getEventHandler = Reflect.get(AggregateRoot.prototype, 'getEventHandler');
      const eventHandlerFunction = getEventHandler.call(agg, new DomainEvent('id'));

      expect(eventHandlerFunction).not.toBeDefined();
    });

    it('should return function when defined', () => {
      class TestAggregate extends AggregateRoot {
        onDomainEvent() {} // defined function
      }
      const agg = new TestAggregate('id');
      const getEventHandler = Reflect.get(AggregateRoot.prototype, 'getEventHandler');
      const eventHandlerFunction = getEventHandler.call(agg, new DomainEvent('id'));
  
      expect(eventHandlerFunction).toBeInstanceOf(Function);
    });
  });
  
  describe('apply', () => {
    class TestAggregate extends AggregateRoot {};
    let agg: TestAggregate;
    let event: DomainEvent;
    const applyFunction = Reflect.get(AggregateRoot.prototype, 'apply');
    
    beforeEach(() => {
      agg = new TestAggregate('id');
      event = new DomainEvent('id');
    });

    it('should set event.meta.aggregateType', () => {
      expect(event.meta.aggregateType).not.toBeDefined();
      applyFunction.call(agg, event);
      expect(event.meta.aggregateType).toBe(TestAggregate.name);
    });

    it('should set event.meta.version as incremented aggregate version', () => {
      const currenAggregateVersion = agg.version;
      applyFunction.call(agg, event);
      expect(event.meta.version).toBe(currenAggregateVersion + 1);
    });

    it('should NOT update event.meta.version if applied as history event', () => {
      const originalEventVersion = event.meta.version; // 0
      applyFunction.call(agg, event, true);
      expect(event.meta.version).toBe(originalEventVersion);
    });

    it('should set aggregate.version with corresponding event version', () => {
      const currenAggregateVersion = agg.version; // expected - 0
      applyFunction.call(agg, event); // increments version
      expect(agg.version).toBe(currenAggregateVersion + 1);
    });

    it('should add event to uncommitted events', () => {
      applyFunction.call(agg, event);
      const uncommittedEvents = agg.getUncommittedEvents();

      expect(uncommittedEvents).toEqual([event]);
    });

    it('should NOT add event to uncommitted events if applied as history event', () => {
      applyFunction.call(agg, event, true);
      const uncommittedEvents = agg.getUncommittedEvents();

      expect(uncommittedEvents).toEqual([]);
    });

    it('should call event handler function if defined', () => {
      const mockEventHandler = vi.fn();
      vi.spyOn(agg as any, 'getEventHandler').mockReturnValue(mockEventHandler);
      applyFunction.call(agg, event);

      expect(mockEventHandler).toBeCalledWith(event);
    });
  });

  describe('commit', () => {
    it('should call publishAll with uncommitted events', async () => {
      class TestAggregate extends AggregateRoot {};
      const agg = new TestAggregate('id');
      const event = new DomainEvent('id');
      vi.spyOn(agg, 'getUncommittedEvents').mockReturnValueOnce([event]);
      const publishAllMock = vi.fn();

      await agg.commit({ publishAll: publishAllMock, publish: vi.fn() });

      expect(publishAllMock).toHaveBeenCalledWith([event]);
    });

    it('should reset uncommitted events after commit', async () => {
      class TestAggregate extends AggregateRoot {};
      const agg = new TestAggregate('id');
      const event = new DomainEvent('id');
      vi.spyOn(agg, 'getUncommittedEvents').mockReturnValueOnce([event]);

      await agg.commit({ publishAll: vi.fn(), publish: vi.fn() });
      const uncommittedEventsAfterCommit = agg.getUncommittedEvents();

      expect(uncommittedEventsAfterCommit).toEqual([]);
    });
  });
});