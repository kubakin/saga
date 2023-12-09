export const Compensation: MethodDecorator = (target, propertyKey, descriptor) => {
  Reflect.defineMetadata('compensation', true, target, propertyKey);
};
