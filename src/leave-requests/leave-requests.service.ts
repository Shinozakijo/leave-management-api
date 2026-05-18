import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CamundaService } from '../camunda/camunda.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import {
  LeaveRequest,
  LeaveRequestStatus,
} from './entities/leave-request.entity';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    private readonly camundaService: CamundaService,
  ) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto) {
    const leaveRequest = this.leaveRequestRepository.create({
      ...createLeaveRequestDto,
      status: LeaveRequestStatus.DRAFT,
    });

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async findAll() {
    return await this.leaveRequestRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with id ${id} not found`);
    }

    return leaveRequest;
  }

  async update(id: string, updateLeaveRequestDto: UpdateLeaveRequestDto) {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only leave requests in DRAFT status can be updated',
      );
    }

    Object.assign(leaveRequest, updateLeaveRequestDto);

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async remove(id: string) {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only leave requests in DRAFT status can be deleted',
      );
    }

    await this.leaveRequestRepository.remove(leaveRequest);

    return {
      message: `Leave request with id ${id} deleted successfully`,
    };
  }

  async submit(id: string) {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only leave requests in DRAFT status can be submitted',
      );
    }

    const process = await this.camundaService.startLeaveApprovalProcess(
      leaveRequest.id,
    );

    leaveRequest.status = LeaveRequestStatus.SUBMITTED;
    leaveRequest.processInstanceId = process.id;

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async approve(id: string, userId: string) {
    const leaveRequest = await this.findOne(id);

    if (
      leaveRequest.status !== LeaveRequestStatus.SUBMITTED &&
      leaveRequest.status !== LeaveRequestStatus.MANAGER_APPROVED
    ) {
      throw new BadRequestException(
        'This leave request cannot be approved in its current status',
      );
    }

    if (!leaveRequest.processInstanceId) {
      throw new BadRequestException(
        'No processInstanceId found for this leave request',
      );
    }

    const currentTask =
      await this.camundaService.getCurrentTaskByProcessInstanceId(
        leaveRequest.processInstanceId,
      );

    const fullTask = await this.camundaService.getTaskById(currentTask.id);

    if (!fullTask.assignee) {
      throw new ForbiddenException('Task must be claimed before approval');
    }

    if (fullTask.assignee !== userId) {
      throw new ForbiddenException(
        `Task is assigned to ${fullTask.assignee}, not ${userId}`,
      );
    }

    await this.camundaService.completeTask(currentTask.id, true);

    if (fullTask.name === 'Manager Approval') {
      leaveRequest.status = LeaveRequestStatus.MANAGER_APPROVED;
    } else if (fullTask.name === 'HR Approval') {
      leaveRequest.status = LeaveRequestStatus.APPROVED;
    } else {
      throw new BadRequestException(`Unknown task name: ${fullTask.name}`);
    }

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async reject(id: string, userId: string) {
    const leaveRequest = await this.findOne(id);

    if (
      leaveRequest.status !== LeaveRequestStatus.SUBMITTED &&
      leaveRequest.status !== LeaveRequestStatus.MANAGER_APPROVED
    ) {
      throw new BadRequestException(
        'This leave request cannot be rejected in its current status',
      );
    }

    if (!leaveRequest.processInstanceId) {
      throw new BadRequestException(
        'No processInstanceId found for this leave request',
      );
    }

    const currentTask =
      await this.camundaService.getCurrentTaskByProcessInstanceId(
        leaveRequest.processInstanceId,
      );

    const fullTask = await this.camundaService.getTaskById(currentTask.id);

    if (!fullTask.assignee) {
      throw new ForbiddenException('Task must be claimed before rejection');
    }

    if (fullTask.assignee !== userId) {
      throw new ForbiddenException(
        `Task is assigned to ${fullTask.assignee}, not ${userId}`,
      );
    }

    await this.camundaService.completeTask(currentTask.id, false);

    leaveRequest.status = LeaveRequestStatus.REJECTED;

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async getTasks(id: string) {
    const leaveRequest = await this.findOne(id);

    if (!leaveRequest.processInstanceId) {
      throw new BadRequestException(
        'No processInstanceId found for this leave request',
      );
    }

    return await this.camundaService.getTasksByProcessInstanceId(
      leaveRequest.processInstanceId,
    );
  }

  async claimTask(id: string, userId: string) {
    const leaveRequest = await this.findOne(id);

    if (!leaveRequest.processInstanceId) {
      throw new BadRequestException(
        'No processInstanceId found for this leave request',
      );
    }

    const currentTask =
      await this.camundaService.getCurrentTaskByProcessInstanceId(
        leaveRequest.processInstanceId,
      );

    return await this.camundaService.claimTask(currentTask.id, userId);
  }
}
