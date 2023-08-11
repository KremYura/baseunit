export const EVENT_NAME_KEY_METADATA = Symbol('event:name');
export const EVENT_HANDLER_TYPE_METADATA = Symbol('event:handlerType');

export enum HANDLER_TYPE {
  EVENT_HANDLER = 'event-handler',
  SAGA_HANDLER = 'saga-handler',
}
