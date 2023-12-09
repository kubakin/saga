import { sagaEmitter } from '../saga.module';
import { generateString } from '@nestjs/typeorm';

export const callSaga = (saga: string, step: string, mode) => {
  const eventName = `saga_emitter`;
  const key = `${generateString()}_response`;
  sagaEmitter.emit(eventName, { saga, step, mode, key });
  return new Promise((resolve, reject) => {
    sagaEmitter.on(key, (response) => {
      return resolve(response);
    });
  });
};
