import { EVENT_HANDLER_TYPE_METADATA, EVENT_NAME_KEY_METADATA, HANDLER_TYPE } from '../constants';

const getAllMethodNames = (instance: object): (string | symbol)[] => {
  const result: (string | symbol)[] = [];
  let instancePrototype = Reflect.getPrototypeOf(instance);

  if (!instancePrototype) {
    return result;
  }

  do {
    // console.log('iteration for', instancePrototype);
    for (const property of Reflect.ownKeys(instancePrototype)) {
      // console.log('review', property);
      const value = typeof Reflect.get(instancePrototype, property);
      if (value === 'function' && property !== 'constructor') {
        // console.log(property, 'is a function');
        result.push(property);
      }
    }
  } while ((instancePrototype = Reflect.getPrototypeOf(instancePrototype)) && instancePrototype !== Object.prototype)

  return result;
}

type HandlerDefinition = {
  instance: object,
  eventName: string,
  callback: Function,
  type: HANDLER_TYPE,
}

const exploreMethodMetadata = (instance: any, methodName: string | symbol): HandlerDefinition | null => {
  const targetCallback = Reflect.get(instance, methodName);

  const handlerType: HANDLER_TYPE = Reflect.getMetadata(EVENT_HANDLER_TYPE_METADATA, targetCallback);
  const patternType: string = Reflect.getMetadata(EVENT_NAME_KEY_METADATA, targetCallback);

  // console.log(instance, methodName, handlerType, patternType);

  let handlerDefinition: HandlerDefinition | null = null;
  if (handlerType && patternType) {
    handlerDefinition = {
      instance,
      eventName: patternType,
      callback: targetCallback,
      type: handlerType,
    }
  }

  return handlerDefinition;
}

export const exploreHandlers = (instance: object): HandlerDefinition[] => {
  const methodNames = getAllMethodNames(instance);
  const handlerDefinitions: HandlerDefinition[] = [];
  methodNames.forEach((methodName) => {
    const handlerDefinition = exploreMethodMetadata(instance, methodName);
    if (handlerDefinition) {
      handlerDefinitions.push(handlerDefinition);
    }
  });

  return handlerDefinitions;
}
