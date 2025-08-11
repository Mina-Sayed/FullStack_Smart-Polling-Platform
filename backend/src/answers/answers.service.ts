import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { Poll } from '../polls/poll.entity';
import { Question, QuestionType } from '../questions/question.entity';
import { SubmitPollResponseDto } from './dto/answer.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async submitPollResponse(
    pollId: string, 
    submitPollResponseDto: SubmitPollResponseDto, 
    userId?: string
  ): Promise<void> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['questions'],
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (!poll.isActive) {
      throw new BadRequestException('Poll is not active');
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      throw new BadRequestException('Poll has expired');
    }

    if (!poll.allowAnonymous && !userId) {
      throw new BadRequestException('Authentication required for this poll');
    }

    // Generate session ID for this response
    const sessionId = submitPollResponseDto.sessionId || uuidv4();

    // Validate answers against conditional logic
    const validatedAnswers = await this.validateConditionalLogic(
      poll.questions, 
      submitPollResponseDto.answers
    );

    // Save answers
    const answerEntities = validatedAnswers.map(answer => 
      this.answerRepository.create({
        questionId: answer.questionId,
        value: answer.value,
        pollId,
        userId,
        sessionId,
      })
    );

    await this.answerRepository.save(answerEntities);

    // Note: WebSocket notification would be handled in the controller
    // to avoid circular dependencies
  }

  private async validateConditionalLogic(questions: Question[], answers: any[]): Promise<any[]> {
    const answersMap = new Map(answers.map(a => [a.questionId, a.value]));
    const validAnswers: any[] = [];

    // Sort questions by order to process dependencies correctly
    const sortedQuestions = questions.sort((a, b) => a.order - b.order);

    for (const question of sortedQuestions) {
      const answer = answers.find(a => a.questionId === question.id);
      
      if (!answer) {
        // Check if question is required
        if (question.required && this.shouldShowQuestion(question, answersMap)) {
          throw new BadRequestException(`Answer required for question: ${question.text}`);
        }
        continue;
      }

      // Check if question should be shown based on conditional logic
      if (!this.shouldShowQuestion(question, answersMap)) {
        // Skip this answer as the question shouldn't be shown
        continue;
      }

      // Validate answer format based on question type
      this.validateAnswerFormat(question, answer.value);

      validAnswers.push(answer);
      answersMap.set(question.id, answer.value);
    }

    return validAnswers;
  }

  private shouldShowQuestion(question: Question, answersMap: Map<string, any>): boolean {
    if (!question.conditionalLogic?.dependsOnQuestionId) {
      return true; // No conditions, always show
    }

    const { dependsOnQuestionId, expectedAnswer, operator } = question.conditionalLogic;
    const dependentAnswer = answersMap.get(dependsOnQuestionId);

    if (!dependentAnswer) {
      return false; // Dependent question not answered
    }

    switch (operator || 'equals') {
      case 'equals':
        return dependentAnswer === expectedAnswer;
      case 'not_equals':
        return dependentAnswer !== expectedAnswer;
      case 'contains':
        if (Array.isArray(dependentAnswer)) {
          return dependentAnswer.includes(expectedAnswer);
        }
        return String(dependentAnswer).includes(String(expectedAnswer));
      default:
        return true;
    }
  }

  private validateAnswerFormat(question: Question, value: any): void {
    switch (question.type) {
      case QuestionType.SINGLE:
        if (typeof value !== 'string') {
          throw new BadRequestException('Single choice questions require a string value');
        }
        if (question.options && !question.options.includes(value)) {
          throw new BadRequestException('Invalid option selected');
        }
        break;
      case QuestionType.MULTIPLE:
        if (!Array.isArray(value)) {
          throw new BadRequestException('Multiple choice questions require an array of values');
        }
        if (question.options) {
          const invalidOptions = value.filter(v => !question.options.includes(v));
          if (invalidOptions.length > 0) {
            throw new BadRequestException(`Invalid options selected: ${invalidOptions.join(', ')}`);
          }
        }
        break;
      case QuestionType.TEXT:
        if (typeof value !== 'string') {
          throw new BadRequestException('Text questions require a string value');
        }
        break;
    }
  }
}
