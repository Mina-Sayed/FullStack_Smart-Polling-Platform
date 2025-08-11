import { Module } from '@nestjs/common';
import { PollsGateway } from './polls.gateway';
import { PollsModule } from '../polls/polls.module';

@Module({
  imports: [PollsModule],
  providers: [PollsGateway],
  exports: [PollsGateway],
})
export class WebsocketsModule {}
