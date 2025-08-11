import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PollsService } from '../polls/polls.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class PollsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private pollsService: PollsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinPoll')
  async handleJoinPoll(
    @MessageBody() data: { pollId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { pollId } = data;
    
    try {
      const poll = await this.pollsService.findOne(pollId);
      if (poll) {
        client.join(`poll_${pollId}`);
        client.emit('joinedPoll', { pollId, success: true });
        
        // Send current results to the newly joined client
        const results = await this.pollsService.getResults(pollId);
        client.emit('pollResults', results);
      }
    } catch (error) {
      client.emit('joinedPoll', { pollId, success: false, error: error.message });
    }
  }

  @SubscribeMessage('leavePoll')
  handleLeavePoll(
    @MessageBody() data: { pollId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { pollId } = data;
    client.leave(`poll_${pollId}`);
    client.emit('leftPoll', { pollId });
  }

  // Method to broadcast poll updates to all clients in a poll room
  async broadcastPollUpdate(pollId: string) {
    try {
      const results = await this.pollsService.getResults(pollId);
      this.server.to(`poll_${pollId}`).emit('pollResults', results);
    } catch (error) {
      console.error('Error broadcasting poll update:', error);
    }
  }

  // Method to notify about new poll responses
  async notifyNewResponse(pollId: string) {
    this.server.to(`poll_${pollId}`).emit('newResponse', { pollId });
    await this.broadcastPollUpdate(pollId);
  }
}
