export const SagaOrchestrator = (name: string): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata('SAGA', name, target);
  };
};
