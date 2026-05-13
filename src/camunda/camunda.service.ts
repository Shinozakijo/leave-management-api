import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface CamundaProcessInstance {
  id: string;
  definitionId: string;
  businessKey: string | null;
  caseInstanceId: string | null;
  tenantId: string | null;
  ended: boolean;
  suspended: boolean;
  links: unknown[];
}

@Injectable()
export class CamundaService {
  private readonly baseUrl =
    process.env.CAMUNDA_BASE_URL || 'http://camunda:8080/engine-rest';

  constructor(private readonly httpService: HttpService) {}

  async startLeaveApprovalProcess(leaveRequestId: string): Promise<CamundaProcessInstance> {
    const url = `${this.baseUrl}/process-definition/key/leave-approval/start`;

    const payload = {
      variables: {
        leaveRequestId: { value: leaveRequestId, type: 'String' },
      },
    };

    const response = await firstValueFrom(this.httpService.post<CamundaProcessInstance>(url, payload));
    return response.data;
  }
}
