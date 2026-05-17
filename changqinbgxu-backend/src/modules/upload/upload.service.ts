import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  /** 未填写 AK/SK 时保持为空，不走 OSS */
  private ossClient?: OSS | null;

  constructor(private readonly configService: ConfigService) {
    const ossConfig = this.configService.get('oss');
    if (ossConfig?.accessKeyId && ossConfig?.accessKeySecret && ossConfig?.bucket) {
      this.ossClient = new OSS({
        region: ossConfig.region,
        accessKeyId: ossConfig.accessKeyId,
        accessKeySecret: ossConfig.accessKeySecret,
        bucket: ossConfig.bucket,
      });
    } else {
      this.ossClient = undefined;
      this.logger.warn('OSS AK/SK 或 Bucket 未配置，上传将直接使用本地磁盘');
    }
  }

  /**
   * 上传图片
   */
  async uploadImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; fileName: string }> {
    return this.uploadToOss(userId, file, 'images');
  }

  /**
   * 上传语音
   */
  async uploadVoice(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; fileName: string }> {
    return this.uploadToOss(userId, file, 'voices');
  }

  /**
   * 上传头像
   */
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; fileName: string }> {
    // 头像特殊处理，可能需要裁剪
    return this.uploadToOss(userId, file, 'avatars');
  }

  /**
   * 上传到 OSS
   */
  private async uploadToOss(
    userId: string,
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; fileName: string }> {
    // 生成文件名（小程序上传可能不带扩展名，需兜底）
    const baseName = file.originalname || '';
    const extFromName =
      baseName.includes('.') && baseName.length > 0
        ? (baseName.split('.').pop() || '').toLowerCase()
        : '';
    const allowed = new Set([
      'mp3',
      'wav',
      'm4a',
      'aac',
      'mp4',
      'mpeg',
      'caf',
      'amr',
      '3gp',
    ]);
    const ext = extFromName && allowed.has(extFromName) ? extFromName : 'aac';
    const hash = crypto.randomBytes(8).toString('hex');
    const fileName = `${folder}/${userId}/${Date.now()}_${hash}.${ext}`;

    const buffer = file.buffer;
    if (!buffer?.length) {
      throw new Error('上传文件内容为空');
    }

    /** 写入项目根 uploads/ 并用 PUBLIC_BASE_URL 拼出符合 @IsUrl 的绝对地址 */
    const persistLocal = async (): Promise<{ url: string; fileName: string }> => {
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      const diskPath = path.join(uploadsRoot, ...fileName.split('/'));
      await fs.mkdir(path.dirname(diskPath), { recursive: true });
      await fs.writeFile(diskPath, buffer);
      const apiPrefix = (
        this.configService.get<string>('app.apiPrefix') ??
        process.env.API_PREFIX ??
        'api'
      ).replace(/^\/+|\/+$/g, '');
      const publicBase = (
        this.configService.get<string>('app.publicBaseUrl') ??
        `http://127.0.0.1:${this.configService.get<number>('app.port', 3000)}`
      ).replace(/\/+$/, '');
      const absoluteUrl = `${publicBase}/${apiPrefix}/upload-static/${fileName}`;
      this.logger.warn(`本地存储已写入 ${diskPath}`);
      return { url: absoluteUrl, fileName };
    };

    if (!this.ossClient) {
      return persistLocal();
    }

    try {
      const result = await this.ossClient.put(fileName, buffer);
      const domain = this.configService.get<string>('oss.domain') || result.url;
      const composed = domain.includes('http') ? `${domain}/${fileName}` : `https://${domain}/${fileName}`;
      const url = result.url || composed;
      this.logger.log(`文件上传成功(OSS): ${fileName}`);
      return { url, fileName };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`OSS 上传失败，降级为本地存储: ${message}`);
      return persistLocal();
    }
  }
}
