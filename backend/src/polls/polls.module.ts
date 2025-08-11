import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { Poll } from './poll.entity';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Question, Answer])],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
