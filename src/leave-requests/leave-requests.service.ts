import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    Object.assign(leaveRequest, updateLeaveRequestDto);

    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async remove(id: string) {
    const leaveRequest = await this.findOne(id);
    await this.leaveRequestRepository.remove(leaveRequest);

    return {
      message: `Leave request with id ${id} deleted successfully`,
    };
  }
}
