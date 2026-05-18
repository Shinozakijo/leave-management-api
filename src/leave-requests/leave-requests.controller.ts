import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/claim')
  claimTask(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leaveRequestsService.claimTask(id, user.username, user.group);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leaveRequestsService.approve(id, user.username);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leaveRequestsService.reject(id, user.username);
  }
}
