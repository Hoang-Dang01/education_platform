import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialsService } from './materials.service';
import { PrismaService } from '../../database/prisma.service';
import type { Response } from 'express';
import * as path from 'path';

// Allowed file extensions whitelist
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.ppt',
  '.pptx',
  '.odp',
  '.mp4',
  '.webm',
  '.avi',
  '.mov',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
];

// Dangerous file extensions blacklist for secondary safety
const BLACKLIST_EXTENSIONS = ['.exe', '.js', '.sh', '.bat', '.cmd', '.com', '.vbs', '.msi'];

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly prisma: PrismaService
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req: any, file: any, cb: any) => {
        const ext = path.extname(file.originalname).toLowerCase();
        
        // 1. Check blacklist
        if (BLACKLIST_EXTENSIONS.includes(ext)) {
          return cb(new BadRequestException('Định dạng tệp tin nguy hại bị cấm tải lên.'), false);
        }
        
        // 2. Check whitelist
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return cb(new BadRequestException('Định dạng tệp tin không được hỗ trợ tải lên.'), false);
        }

        cb(null, true);
      },
    })
  )
  async uploadFile(
    @Req() req: any,
    @UploadedFile() file: any,
    @Body('title') title: string,
    @Body('scope') scope: 'course' | 'personal',
    @Body('courseId') courseId?: string,
    @Body('isPrivate') isPrivateStr?: string
  ) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy tệp tin được gửi lên.');
    }
    if (!title || !title.trim()) {
      throw new BadRequestException('Tiêu đề tài liệu là bắt buộc.');
    }
    if (!scope || !['course', 'personal'].includes(scope)) {
      throw new BadRequestException('Trường phạm vi (scope) không hợp lệ.');
    }

    const userId = req.user.id;
    const role = req.user.role;
    const isPrivate = isPrivateStr === 'true' || isPrivateStr === '1' || scope === 'personal';

    // 1. Validation for Course scope uploads
    if (scope === 'course') {
      if (!courseId || courseId.trim() === '' || courseId === 'private') {
        throw new BadRequestException('ID khóa học là bắt buộc đối với tài liệu học tập.');
      }

      // Role check: Only admin, manager, or teacher can upload course materials
      if (!['admin', 'manager', 'teacher'].includes(role)) {
        throw new ForbiddenException('Bạn không có quyền tải lên tài liệu học tập của lớp học.');
      }

      // Teacher-specific check: Must be the instructor of at least one class in this course
      if (role === 'teacher') {
        const hasAccess = await this.prisma.class.findFirst({
          where: {
            courseId,
            teacherId: userId,
          },
        });
        if (!hasAccess) {
          throw new ForbiddenException('Bạn không có quyền tải lên tài liệu cho khóa học này.');
        }
      }
    }

    // 2. Delegate creation to service
    return this.materialsService.createMaterial(
      file,
      title.trim(),
      scope,
      scope === 'course' ? (courseId || null) : null,
      isPrivate,
      userId
    );
  }

  @Get('personal')
  async getPersonalMaterials(@Req() req: any) {
    return this.materialsService.getPersonalMaterials(req.user.id);
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response
  ) {
    const userId = req.user.id;
    const role = req.user.role;

    // 1. Fetch metadata & check deleted status
    const material = await this.materialsService.getMaterialById(id);

    // 2. Prevent IDOR - Validate access permission
    if (material.scope === 'personal') {
      // Personal scope: Only uploader has access
      if (material.uploadedById !== userId && role !== 'admin') {
        throw new ForbiddenException('Bạn không có quyền truy cập vào tài liệu riêng tư này.');
      }
    } else if (material.scope === 'course') {
      // Course scope: Check role constraints
      if (role === 'teacher') {
        // Teacher uploader or teacher of the course
        const hasAccess =
          material.uploadedById === userId ||
          (await this.prisma.class.findFirst({
            where: {
              courseId: material.courseId!,
              teacherId: userId,
            },
          }));
        if (!hasAccess) {
          throw new ForbiddenException('Bạn không giảng dạy khóa học này nên không thể tải tài liệu.');
        }
      } else if (role === 'student') {
        // Student must be enrolled in at least one active class under this course
        const enrolled = await this.prisma.enrollment.findFirst({
          where: {
            userId,
            status: 'active',
            class: {
              courseId: material.courseId!,
            },
          },
        });
        if (!enrolled) {
          throw new ForbiddenException(
            'Bạn không tham gia khóa học này nên không được phép tải tài liệu.'
          );
        }
      }
    }

    // 3. Serve physical file
    const stream = await this.materialsService.getFileStream(id);
    
    res.set({
      'Content-Type': this.getMimeType(material.fileName),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(material.fileName)}"`,
    });

    stream.pipe(res);
  }

  @Delete(':id')
  async deleteMaterial(@Param('id') id: string, @Req() req: any) {
    return this.materialsService.deleteMaterial(id, req.user);
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.odp': 'application/vnd.oasis.opendocument.presentation',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
