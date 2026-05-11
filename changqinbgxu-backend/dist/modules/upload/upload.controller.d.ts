import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
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
}
