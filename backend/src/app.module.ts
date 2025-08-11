import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PollsModule } from './polls/polls.module';
// import { AnswersModule } from './answers/answers.module';
// import { WebsocketsModule } from './websockets/websockets.module';
import { HealthModule } from './health/health.module';
import { User } from './users/user.entity';
import { Question } from './questions/question.entity';
import { Poll } from './polls/poll.entity';
import { Answer } from './answers/answer.entity';
import { AnswersModule } from './answers/answers.module';
import { WebsocketsModule } from './websockets/websockets.module';
// import { Poll } from './polls/poll.entity';
// import { Question } from './questions/question.entity';
// import { Answer } from './answers/answer.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is not set');
        }
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User,Question,Poll,Answer],
          migrations: ['dist/migrations/*.js'],
          migrationsRun: true,
          synchronize: false, // Disable synchronize, use migrations instead
          logging: configService.get('NODE_ENV') === 'development',
          ssl: {
            rejectUnauthorized: false,
          },
          extra: {
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    HealthModule,
    PollsModule,
    AnswersModule,
    WebsocketsModule,
  ],
  
})
export class AppModule {}
