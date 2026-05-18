import { IsNotEmpty, IsString } from 'class-validator';

export class TaskActionDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
