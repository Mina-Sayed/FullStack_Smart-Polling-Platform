import { IsString, IsOptional, IsBoolean, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { QuestionType, ConditionalLogic } from '../../questions/question.entity';

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsString()
  type: QuestionType;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  conditionalLogic?: ConditionalLogic;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class CreatePollDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}

export class UpdatePollDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;
}
