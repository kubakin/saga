import { Injectable } from '@nestjs/common';
import 'reflect-metadata';
import { AmqpService } from '../../../infastructure/amqp/amqp.service';
import { Invocation } from '../../../../../../lib/saga/decorators/invocation';
import { SagaOrchestrator } from '../../../../../../lib/saga/decorators/saga';

@Injectable()
@SagaOrchestrator('power_off_saga')
export class PowerOffExecutor {
  constructor(private amqpService: AmqpService) {}

  @Invocation('power_off_step')
  async execute(payload: any): Promise<string> {
    return '5';
    const task = await this.amqpService.hostRequest(
      'power_off',
      payload.remoteId,
    );
    return String(task.task);
  }
}
