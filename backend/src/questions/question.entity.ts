import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Poll } from '../polls/poll.entity';
import { Answer } from '../answers/answer.entity';

export enum QuestionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple', 
  TEXT = 'text'
}

export interface ConditionalLogic {
  dependsOnQuestionId?: string;
  expectedAnswer?: string;
  operator?: 'equals' | 'contains' | 'not_equals';
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.SINGLE
  })
  type: QuestionType;

  @Column({ type: 'jsonb', nullable: true })
  options: string[];

  @Column({ type: 'jsonb', nullable: true })
  conditionalLogic: ConditionalLogic;

  @Column({ default: 0 })
  order: number;

  @Column({ default: false })
  required: boolean;

  @Column({ name: 'poll_id' })
  pollId: string;

  @ManyToOne(() => Poll, poll => poll.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @OneToMany(() => Answer, answer => answer.question)
  answers: Answer[];
}
