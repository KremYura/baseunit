import { BaseEvent, IBaseEventMeta } from '@baseunit/edd';

interface IDomainEventMeta extends IBaseEventMeta<string> {
  eventId: string | undefined; // extention of BaseMeta, empty for events that are not stored, ID for already stored
}

export abstract class DomainEvent implements BaseEvent {
  meta: IDomainEventMeta;
  readonly groupId: string;

  constructor(aggregateId: string) {
    this.meta = {
      eventId: undefined,
      aggregateId,
      version: 0,
      aggregateType: undefined,
    };
    this.groupId = aggregateId;
  }
}