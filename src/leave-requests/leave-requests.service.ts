import {
  BadRequestException,
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

  async approve(id: string) {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveRequestStatus.SUBMITTED) {
      throw new BadRequestException(
        'Only leave requests in SUBMITTED status can be approved',
      );
    }

    leaveRequest.status = LeaveRequestStatus.APPROVED;

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async reject(id: string) {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveRequestStatus.SUBMITTED) {
      throw new BadRequestException(
        'Only leave requests in SUBMITTED status can be rejected',
      );
    }

    leaveRequest.status = LeaveRequestStatus.REJECTED;

    return await this.leaveRequestRepository.save(leaveRequest);
  }
}
