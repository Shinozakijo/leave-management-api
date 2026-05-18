import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClaimTaskDto } from './dto/claim-task.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { TaskActionDto } from './dto/task-action.dto';
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

  @Get('/tasks/group/:group')
  getTasksByGroup(@Param('group') group: string) {
    return this.leaveRequestsService.getTasksByGroup(group);
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

  @Get(':id/tasks')
  getTasks(@Param('id') id: string) {
    return this.leaveRequestsService.getTasks(id);
  }

  @Post(':id/claim')
  claimTask(@Param('id') id: string, @Body() claimTaskDto: ClaimTaskDto) {
    return this.leaveRequestsService.claimTask(
      id,
      claimTaskDto.userId,
      claimTaskDto.group,
    );
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() taskActionDto: TaskActionDto) {
    return this.leaveRequestsService.approve(id, taskActionDto.userId);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() taskActionDto: TaskActionDto) {
    return this.leaveRequestsService.reject(id, taskActionDto.userId);
  }
}
