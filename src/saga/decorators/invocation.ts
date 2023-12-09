export const Invocation = (name?: string) => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(`invocation`, descriptor.value, target, propertyKey);
    Reflect.defineMetadata(`invocation_param`, name, descriptor.value);
  };
};

// export const Invocation = params => {
//   return (target: Record<string, unknown>, _propertyKey: string, descriptor: PropertyDescriptor) => {
//     const originalMethod = descriptor.value;
//     // Reflect.defineMetadata('invocation', originalMethod, Invocation);
//     descriptor.value = async function (...args) {
//       const data = await originalMethod.apply(this, args);
//       // data = ['Hello', 'World', '!']
//     };
//
//     return descriptor;
//   };
// };
