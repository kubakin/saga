import { Inject, Injectable, Optional, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';

export interface Sagas {
  [key: string]: {
    provider: Type;
    ref?: any;
    steps: {
      [key: string]: {
        method: string;
      };
    };
  };
}

@Injectable()
export class Explorer {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    @Optional() @Inject('EXPLORE_MODULE') private exploreModule: Type,
  ) {}

  explore(): { sagaTree: Sagas } {
    const providers = this.getProviders();
    const sagaTree: Sagas = {};
    providers
      .filter((it) => {
        return Reflect.getMetadata('SAGA', it);
      })
      .map((it) => {
        const name = Reflect.getMetadata('SAGA', it);
        sagaTree[name] = { provider: it, steps: {} };
        return {
          provider: it,
          name: Reflect.getMetadata('SAGA', it),
        };
      });

    const methods = Object.keys(sagaTree)
      .map((sagaName) => {
        const methods = this.getClassMethods(sagaTree[sagaName].provider);
        return methods.map((method) => ({
          sagaName,
          method,
          provider: sagaTree[sagaName].provider,
        }));
      })
      .flat();
    methods
      .filter((it) => this.isInvocation(it.provider, it.method))
      .map((it) => {
        const inv = this.addInvocation(it.provider, it.method);
        Object.assign(sagaTree[it.sagaName].steps, inv);
      });

    // const invocations = methods
    //   .filter((it) => this.isInvocation(it.provider, it.method))
    //   .map((it) => this.addHandlerMessage(it));
    return {
      sagaTree,
    };
  }

  private getProviders(): Type[] {
    if (this.exploreModule) {
      const module = [...this.modulesContainer.values()].find(
        (it) => it.metatype === this.exploreModule,
      );
      return this.getModuleProviders(module);
    } else {
      return this.getAllProviders();
    }
  }

  private getModuleProviders(
    module: Module,
    visitedModules: string[] = [],
  ): Type[] {
    if (this.isGlobalModule(module)) return [];

    if (visitedModules.indexOf(module.id) !== -1) {
      return [];
    }
    visitedModules.push(module.id);
    const modules = [module];
    const childModules = [...module.imports.values()];
    const providerWrappers = modules
      .map((it) => [...it.providers.values()])
      .flat();
    const providers = providerWrappers
      .map((it) => it.instance?.constructor as Type)
      .filter((it) => it);
    return [
      ...providers,
      ...childModules
        .map((it) => {
          return this.getModuleProviders(it, visitedModules);
        })
        .flat(),
    ];
  }

  private isGlobalModule(module: Module): boolean {
    const globalModules = (module as any).container
      .globalModules as Set<Module>;
    return globalModules.has(module);
  }

  private getAllProviders(): Type[] {
    const modules = [...this.modulesContainer.values()];
    const providerWrappers = modules
      .map((it) => [...it.providers.values()])
      .flat();
    return providerWrappers
      .map((it) => it.instance?.constructor as Type)
      .filter((it) => it);
  }

  private getClassMethods(type: Type) {
    if (!type) return [];
    if (!type.prototype) return [];

    const prototype = type.prototype;

    const propertyNames = Object.getOwnPropertyNames(prototype);

    return propertyNames.filter((prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
      if (!descriptor.value) return false;
      return typeof prototype?.[prop] === 'function';
    });
  }

  private getParamTypes(provider: Type, method: string) {
    return Reflect.getMetadata(PARAMTYPES_METADATA, provider.prototype, method);
  }

  /*private isCommandHandler(provider: Type, method: string) {
                                                                      return Reflect.getMetadata(
                                                                        COMMAND_HANDLER_METADATA,
                                                                        provider.prototype,
                                                                        method,
                                                                      );
                                                                    }*/

  private isInvocation(provider: Type, method: string) {
    const func = Reflect.getMetadata('invocation', provider.prototype, method);
    if (!func) return undefined;
    const stepName = Reflect.getMetadata('invocation_param', func);
    return func;
  }

  private addInvocation(provider: Type, method: string) {
    const func = Reflect.getMetadata('invocation', provider.prototype, method);
    if (!func) return undefined;
    const stepName = Reflect.getMetadata('invocation_param', func);
    return { [stepName]: func };
  }

  private addHandlerMessage(it: { provider: Type; method: string }): any {
    const [message] = this.getParamTypes(it.provider, it.method);
    return { ...it, message };
  }
}
