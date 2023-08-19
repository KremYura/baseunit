import { describe, expect, it, vi } from 'vitest';
import { EventPublisher } from './event-publisher';
import { BaseEvent } from './base-event';

class TestEvent extends BaseEvent {
  constructor(aggregateId: string, public readonly delay: number) {
    super(aggregateId);
  }
};

class TestEventPublisher extends EventPublisher<TestEvent> {
  publish(event: TestEvent): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

describe('EventPublisher', () => {
  it('should call publish for every event in sequential manner', async () => {
    /**
     * Idea is to call publishAll with two Events.
     * First event with version 1, and execution timeout 2
     * Second - with version 2, and exection timeout 1
     * 
     * So, we test that event publish method executed sequentially we would like
     * to test that second publish executed exactly after first execution finished
     */
    const tep = new TestEventPublisher();
    let executionOrder = '';
    const publishSpy = vi.spyOn(tep, 'publish').mockImplementation(async (event: TestEvent) => {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          executionOrder += event.meta.version; // once we finish event processing we will add its version to executionOrder string
          resolve();
        }, event.delay);
      })
    })
    const event1 = new TestEvent('agg1', 2);
    event1.meta.version = 1;
    const event2 = new TestEvent('agg1', 1);
    event2.meta.version = 2;
    await tep.publishAll([event1, event2]);

    expect(publishSpy).toHaveBeenNthCalledWith(1, event1);
    expect(publishSpy).toHaveBeenNthCalledWith(2, event2);
    // expect that we finished processing of event 1 before event 2, even delay (processing time) for the first event is bigger
    expect(executionOrder).toBe('12');
  })
});