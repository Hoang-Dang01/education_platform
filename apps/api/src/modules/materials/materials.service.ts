import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { MaterialScope } from '@prisma/client';

@Injectable()
export class MaterialsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async createMaterial(
    file: any,
    title: string,
    scope: 'course' | 'personal',
    courseId: string | null,
    isPrivate: boolean,
    uploadedById: string
  ) {
    // Generate UUID for the material (which will also be the filename on disk)
    const id = crypto.randomUUID();
    const diskPath = path.join(this.uploadDir, id);

    // Write file to disk
    fs.writeFileSync(diskPath, file.buffer);

    // Format file size
    const fileSizeStr = this.formatFileSize(file.size);

    // Create database metadata
    const material = await this.prisma.courseMaterial.create({
      data: {
        id,
        title,
        fileName: file.originalname,
        fileType: this.getFileTypeFromMime(file.mimetype, file.originalname),
        fileSize: fileSizeStr,
        filePath: `/materials/download/${id}`,
        uploadedById,
        isPrivate,
        scope: scope === 'personal' ? MaterialScope.personal : MaterialScope.course,
        courseId: scope === 'course' ? courseId : null,
      },
    });

    return material;
  }

  async getPersonalMaterials(userId: string) {
    return this.prisma.courseMaterial.findMany({
      where: {
        uploadedById: userId,
        scope: MaterialScope.personal,
        isDeleted: false,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }

  async getMaterialById(id: string) {
    const material = await this.prisma.courseMaterial.findUnique({
      where: { id },
    });
    if (!material || material.isDeleted) {
      throw new NotFoundException('Không tìm thấy tài liệu.');
    }
    return material;
  }

  async getFileStream(id: string) {
    const filePath = path.join(this.uploadDir, id);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Tệp tin không tồn tại trên hệ thống lưu trữ.');
    }
    return fs.createReadStream(filePath);
  }

  async deleteMaterial(id: string, user: any) {
    const material = await this.prisma.courseMaterial.findUnique({
      where: { id },
    });

    if (!material || material.isDeleted) {
      throw new NotFoundException('Không tìm thấy tài liệu.');
    }

    // Permission checks
    const isOwner = material.uploadedById === user.id;
    const canDelete =
      user.role === 'admin' ||
      user.role === 'manager' ||
      (['teacher', 'admin', 'manager'].includes(user.role) && isOwner);

    if (!canDelete) {
      throw new ForbiddenException('Bạn không có quyền xóa tài liệu này.');
    }

    // 1. Soft delete in DB
    await this.prisma.courseMaterial.update({
      where: { id },
      data: { isDeleted: true },
    });

    // 2. Delete physical file on disk
    try {
      const diskPath = path.join(this.uploadDir, id);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch (err) {
      console.error(`Lỗi khi xóa file trên đĩa cho material ${id}:`, err);
      // Vẫn tiếp tục để thực hiện xóa cứng trong DB
    }

    // 3. Hard delete from DB
    await this.prisma.courseMaterial.delete({
      where: { id },
    });

    return { success: true };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getFileTypeFromMime(mime: string, filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.pdf' || mime === 'application/pdf') {
      return 'pdf';
    }
    if (
      ['.ppt', '.pptx', '.odp'].includes(ext) ||
      mime.includes('presentation') ||
      mime.includes('powerpoint')
    ) {
      return 'slide';
    }
    if (['.mp4', '.webm', '.avi', '.mov'].includes(ext) || mime.startsWith('video/')) {
      return 'video';
    }
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext) || mime.startsWith('image/')) {
      return 'image';
    }
    return 'pdf'; // Fallback
  }
}
