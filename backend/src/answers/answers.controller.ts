import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { SubmitPollResponseDto } from './dto/answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PollsGateway } from '../websockets/polls.gateway';

@Controller('polls/:pollId/answers')
export class AnswersController {
  constructor(
    private readonly answersService: AnswersService,
    private readonly pollsGateway: PollsGateway,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async submitResponse(
    @Param('pollId') pollId: string,
    @Body() submitPollResponseDto: SubmitPollResponseDto,
    @Request() req
  ) {
    await this.answersService.submitPollResponse(pollId, submitPollResponseDto, req.user?.id);
    
    // Notify WebSocket clients about new response
    await this.pollsGateway.notifyNewResponse(pollId);
    
    return { success: true, message: 'Response submitted successfully' };
  }

  @Post('anonymous')
  async submitAnonymousResponse(
    @Param('pollId') pollId: string,
    @Body() submitPollResponseDto: SubmitPollResponseDto
  ) {
    await this.answersService.submitPollResponse(pollId, submitPollResponseDto);
    
    // Notify WebSocket clients about new response
    await this.pollsGateway.notifyNewResponse(pollId);
    
    return { success: true, message: 'Anonymous response submitted successfully' };
  }
}
