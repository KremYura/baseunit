import { IBaseEvent, IBaseEventMeta } from './interfaces';

export abstract class BaseEvent<AggregateIdType = string> implements IBaseEvent<AggregateIdType> {
  meta: IBaseEventMeta<AggregateIdType>;

  constructor(aggregateId: AggregateIdType) {
    this.meta = {
      aggregateId,
      version: 0,
    };
  }
}