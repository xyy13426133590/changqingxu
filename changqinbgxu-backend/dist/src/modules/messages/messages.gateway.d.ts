import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';
interface AuthenticatedSocket extends Socket {
    userId?: string;
}
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly messagesService;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    server: Server;
    private userSockets;
    constructor(messagesService: MessagesService, jwtService: JwtService, configService: ConfigService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleSendMessage(client: AuthenticatedSocket, data: SendMessageDto): Promise<void>;
    handleMarkRead(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): Promise<void>;
    handleJoinConversation(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): void;
    handleLeaveConversation(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): void;
    handlePing(client: AuthenticatedSocket): void;
}
export {};
