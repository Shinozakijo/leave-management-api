import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  CamundaProcessInstance,
  CamundaTask,
} from './interfaces/camunda.interfaces';

@Injectable()
export class CamundaService {
  private readonly baseUrl =
    process.env.CAMUNDA_BASE_URL || 'http://camunda:8080/engine-rest';

  constructor(private readonly httpService: HttpService) {}

  async startLeaveApprovalProcess(
    leaveRequestId: string,
  ): Promise<CamundaProcessInstance> {
    const url = `${this.baseUrl}/process-definition/key/leave-approval/start`;

    const payload = {
      variables: {
        leaveRequestId: { value: leaveRequestId, type: 'String' },
      },
    };

    const response = await firstValueFrom(
      this.httpService.post<CamundaProcessInstance>(url, payload),
    );
    return response.data;
  }

  async getTasksByProcessInstanceId(
    processInstanceId: string,
  ): Promise<CamundaTask[]> {
    const url = `${this.baseUrl}/task?processInstanceId=${processInstanceId}`;
    const response = await firstValueFrom(
      this.httpService.get<CamundaTask[]>(url),
    );
    return response.data;
  }

  async getAllTasks(): Promise<CamundaTask[]> {
    const url = `${this.baseUrl}/task`;
    const response = await firstValueFrom(
      this.httpService.get<CamundaTask[]>(url),
    );
    return response.data;
  }

  async getTaskById(taskId: string) {
    const url = `${this.baseUrl}/task/${taskId}`;
    const response = await firstValueFrom(
      this.httpService.get<CamundaTask>(url),
    );
    return response.data;
  }

  async getCurrentTaskByProcessInstanceId(
    processInstanceId: string,
  ): Promise<CamundaTask> {
    const tasks = await this.getTasksByProcessInstanceId(processInstanceId);

    if (!tasks || tasks.length === 0) {
      throw new NotFoundException(
        `No active task found for processInstanceId ${processInstanceId}`,
      );
    }

    return tasks[0];
  }

  async claimTask(taskId: string, userId: string) {
    const url = `${this.baseUrl}/task/${taskId}/claim`;

    await firstValueFrom(
      this.httpService.post(url, {
        userId,
      }),
    );

    return {
      taskId,
      userId,
      message: 'Task claimed successfully',
    };
  }

  async completeTask(taskId: string, approved: boolean) {
    const url = `${this.baseUrl}/task/${taskId}/complete`;

    const payload = {
      variables: {
        approved: { value: approved, type: 'Boolean' },
      },
    };

    await firstValueFrom(this.httpService.post(url, payload));

    return {
      taskId,
      approved,
    };
  }
}
