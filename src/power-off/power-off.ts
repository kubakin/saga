import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { VirtualMachineOffRequestedEvent } from '../../../../../vm/domain/events/vm-off.requested.event';
import { PowerOffSaga } from './power-off.saga';
import { callSaga } from '../../../../../../lib/saga/decorators/caller';

@EventsHandler(VirtualMachineOffRequestedEvent)
export class OffRequested
  implements IEventHandler<VirtualMachineOffRequestedEvent>
{
  async handle(event: VirtualMachineOffRequestedEvent): Promise<void> {
    const test = await callSaga('power_off_saga', 'power_off_step', null);
  }
}
