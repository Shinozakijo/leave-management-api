import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  @IsNotEmpty()
  employeeName!: string;

  @IsEmail()
  employeeEmail!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
