import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto, UpdatePollDto } from './dto/poll.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPollDto: CreatePollDto, @Request() req) {
    return this.pollsService.create(createPollDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.pollsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pollsService.findOne(id);
  }

  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.pollsService.getResults(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto, @Request() req) {
    return this.pollsService.update(id, updatePollDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.pollsService.remove(id, req.user.id);
  }
}
