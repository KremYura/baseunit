export interface IBaseEventMeta<AggregateIdType> {
  aggregateId: AggregateIdType;
  aggregateType?: string;
  version: number;
}
export interface IBaseEvent<AggregateIdType> {
  meta: IBaseEventMeta<AggregateIdType>
}