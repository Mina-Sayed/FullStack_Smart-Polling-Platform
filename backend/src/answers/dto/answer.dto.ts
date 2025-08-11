import { IsString, IsOptional, IsUUID, IsArray, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId: string;

  @IsNotEmpty()
  value: string | string[];

  @IsOptional()
  @IsUUID()
  sessionId?: string; // For anonymous responses
}

export class SubmitPollResponseDto {
  @IsArray()
  answers: SubmitAnswerDto[];

  @IsOptional()
  @IsUUID()
  sessionId?: string; // For anonymous responses
}
