import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private ossClient: OSS;

  constructor(private readonly configService: ConfigService) {
    // 初始化 OSS 客户端
    const ossConfig = this.configService.get('oss');
    if (ossConfig && ossConfig.accessKeyId && ossConfig.accessKeySecret) {
      this.ossClient = new OSS({
        region: ossConfig.region,
        accessKeyId: ossConfig.accessKeyId,
        accessKeySecret: ossConfig.accessKeySecret,
        bucket: ossConfig.bucket,
      });
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
    // 生成文件名
    const ext = file.originalname.split('.').pop();
    const hash = crypto.randomBytes(8).toString('hex');
    const fileName = `${folder}/${userId}/${Date.now()}_${hash}.${ext}`;

    // 如果没有配置 OSS，使用本地存储（仅开发环境）
    if (!this.ossClient) {
      this.logger.warn('OSS 未配置，使用本地存储');
      // 这里可以实现本地文件系统存储
      // 演示环境直接返回一个模拟 URL
      const mockUrl = `https://example.com/${fileName}`;
      return { url: mockUrl, fileName };
    }

    try {
      // 上传到 OSS
      const result = await this.ossClient.put(fileName, file.buffer);
      const domain = this.configService.get<string>('oss.domain') || result.url;
      const url = domain.includes('http') ? `${domain}/${fileName}` : `https://${domain}/${fileName}`;

      this.logger.log(`文件上传成功: ${fileName}`);

      return { url: result.url || url, fileName };
    } catch (error) {
      this.logger.error(`文件上传失败: ${error.message}`);
      throw new Error('文件上传失败');
    }
  }
}
