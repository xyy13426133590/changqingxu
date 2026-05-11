import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly configService;
    private readonly logger;
    private ossClient;
    constructor(configService: ConfigService);
    uploadImage(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        fileName: string;
    }>;
    uploadVoice(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        fileName: string;
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        fileName: string;
    }>;
    private uploadToOss;
}
