import 'reflect-metadata';
import { HANDLER_TYPE, EVENT_NAME_KEY_METADATA, EVENT_HANDLER_TYPE_METADATA } from '../constants';

export const EventHandler: {
  <T = string>(metadata?: T): MethodDecorator;
  <T = string>(metadata?: T, options?: Record<string, any>): MethodDecorator;
} = <T = string>(metadata?: T, options?: Record<string, any>): MethodDecorator => {
  return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      EVENT_NAME_KEY_METADATA,
      // [].concat(metadata),
      metadata,
      descriptor.value,
    );
    Reflect.defineMetadata(EVENT_HANDLER_TYPE_METADATA, HANDLER_TYPE.EVENT_HANDLER, descriptor.value);
    return descriptor;
  };
};

export const SagaHandler: {
  <T = string>(metadata?: T): MethodDecorator;
  <T = string>(metadata?: T, options?: Record<string, any>): MethodDecorator;
} = <T = string>(metadata?: T, options?: Record<string, any>): MethodDecorator => {
  return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      EVENT_NAME_KEY_METADATA,
      // [].concat(metadata),
      metadata,
      descriptor.value,
    );
    Reflect.defineMetadata(EVENT_HANDLER_TYPE_METADATA, HANDLER_TYPE.SAGA_HANDLER, descriptor.value);
    return descriptor;
  };
};
