import { Saga } from '../../../../../submodules/sagas/saga';
import { SagaBuilder } from '../../../../../submodules/sagas/saga-builder';
import { Invocation } from '../../../../../../lib/saga/decorators/invocation';

class AssignIpParams {
  assignmentId: string;
  address: string;
  userId: string;
  id: string;
}

export class PowerOffSaga {
  readonly steps = {
    assign: {
      invocation: Reflect.getMetadata(`invocation_power_off`, Invocation),
    },
  };

  public async execute(params: AssignIpParams): Promise<AssignIpParams> {
    const saga = this.builder();
    try {
      return await saga.execute(params);
    } catch (e) {
      if (e instanceof Error) {
        // Throws, when invocation flow was failed, but compensation has been completed
      }
      if (e instanceof Error) {
        // Throws, when compensation flow was failed
      }
    }
  }

  private builder(): Saga<AssignIpParams> {
    const sagaBuilder = new SagaBuilder<AssignIpParams>();
    return sagaBuilder
      .step()
      .invoke((params: AssignIpParams, saga) => {
        this.steps['assign'].invocation(params);
      })
      .step()
      .invoke((params: AssignIpParams, saga) => {
        console.log('invoke 2');
      })
      .step()
      .invoke((params: AssignIpParams) => {
        console.log('invoke 3');
      })
      .build();
  }
}
