import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveRequestsService } from './leave-requests.service';

@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveRequestsService.create(createLeaveRequestDto);
  }

  @Get()
  findAll() {
    return this.leaveRequestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveRequestsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ) {
    return this.leaveRequestsService.update(id, updateLeaveRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveRequestsService.remove(id);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.leaveRequestsService.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.leaveRequestsService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.leaveRequestsService.reject(id);
  }
}
