import { ModuleRef } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { Explorer } from './explorer';
import { EventEmitter } from 'events';

export const sagaEmitter = new EventEmitter();

@Module({ providers: [Explorer] })
export class SagaModule {
  constructor(private expolerer: Explorer, private moduleRef: ModuleRef) {
    const { sagaTree } = this.expolerer.explore();

    setTimeout(() => {
      Object.keys(sagaTree).map((it) => {
        const instance = this.moduleRef.get(sagaTree[it].provider, {
          strict: false,
        });
        sagaTree[it].ref = instance;
        const sagaTaskListener = (): Promise<void> => {
          const emitterName = `saga_emitter`;
          return new Promise((resolve, reject) => {
            sagaEmitter.on(emitterName, async (props) => {
              sagaEmitter.emit(
                props.key,
                await sagaTree[props.saga].ref.execute('test'),
              );
            });
          });
        };
        sagaTaskListener();
      });

      // const instance = this.moduleRef.get(sagaTree['power_off_saga'].provider, {
      //   strict: false,
      // });
      // console.log(instance);
    }, 1000);
  }
}
