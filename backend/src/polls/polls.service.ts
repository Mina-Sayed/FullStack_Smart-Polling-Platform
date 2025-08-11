import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';
import { CreatePollDto, UpdatePollDto } from './dto/poll.dto';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async create(createPollDto: CreatePollDto, creatorId: string): Promise<Poll> {
    const { questions, ...pollData } = createPollDto;

    // Create poll
    const poll = this.pollRepository.create({
      ...pollData,
      creatorId,
      expiresAt: createPollDto.expiresAt ? new Date(createPollDto.expiresAt) : undefined,
    });

    const savedPoll = await this.pollRepository.save(poll);

    // Create questions
    const questionEntities = questions.map((question, index) => 
      this.questionRepository.create({
        ...question,
        pollId: savedPoll.id,
        order: question.order ?? index,
      })
    );

    await this.questionRepository.save(questionEntities);

    return this.findOne(savedPoll.id);
  }

  async findAll(): Promise<Poll[]> {
    return this.pollRepository.find({
      relations: ['creator', 'questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['creator', 'questions'],
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    return poll;
  }

  async update(id: string, updatePollDto: UpdatePollDto, userId: string): Promise<Poll> {
    const poll = await this.findOne(id);

    if (poll.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own polls');
    }

    Object.assign(poll, updatePollDto);
    if (updatePollDto.expiresAt) {
      poll.expiresAt = new Date(updatePollDto.expiresAt);
    }

    await this.pollRepository.save(poll);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const poll = await this.findOne(id);

    if (poll.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own polls');
    }

    await this.pollRepository.remove(poll);
  }

  async getResults(id: string): Promise<any> {
    const poll = await this.findOne(id);
    
    // Get all answers for this poll
    const answers = await this.answerRepository.find({
      where: { 
        question: { pollId: id }
      },
      relations: ['question', 'user'],
    });

    return {
      poll,
      answers: answers.map(answer => ({
        id: answer.id,
        questionId: answer.questionId,
        value: answer.value,
        userId: answer.userId,
        sessionId: answer.sessionId,
        createdAt: answer.createdAt,
      })),
      totalResponses: await this.getTotalResponses(id),
    };
  }

  private async getTotalResponses(pollId: string): Promise<number> {
    // Count unique respondents by either userId or sessionId
    const result = await this.answerRepository
      .createQueryBuilder('answer')
      .select('COUNT(DISTINCT COALESCE(answer.userId, answer.sessionId))', 'count')
      .where('answer.pollId = :pollId', { pollId })
      .getRawOne();

    return parseInt(result.count, 10) || 0;
  }
}
