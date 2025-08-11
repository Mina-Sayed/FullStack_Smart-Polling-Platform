import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Poll } from '../polls/poll.entity';
import { Question } from '../questions/question.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  value: string | string[];

  @Column({ type: 'uuid', nullable: true })
  sessionId: string; // For anonymous responses

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'poll_id' })
  pollId: string;

  @Column({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => User, user => user.answers, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Poll, poll => poll.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @ManyToOne(() => Question, question => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
