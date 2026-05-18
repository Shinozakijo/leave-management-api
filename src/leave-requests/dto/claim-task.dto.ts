import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimTaskDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
