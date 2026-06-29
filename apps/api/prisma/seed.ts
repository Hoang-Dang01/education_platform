import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding relations database...');

  // 0. Clean up existing data in correct order to avoid foreign key violations
  console.log('Cleaning up existing database records...');
  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.courseMaterial.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database cleanup completed.');

  // Hash passwords concurrently using Argon2
  const [adminHash, managerHash, teacherHash, studentHash] = await Promise.all([
    argon2.hash('admin123'),
    argon2.hash('manager123'),
    argon2.hash('teacher123'),
    argon2.hash('student123'),
  ]);

  // Stable UUIDs for idempotent references
  const ADMIN_ID = '8612140d-d421-4f10-911d-cd12f451f151';
  const MANAGER_ID = '71b2d075-8160-496a-85d2-a7f43bb2de14';
  const TEACHER1_ID = 'c5643477-f273-455b-b991-7299066bf9b0';
  const TEACHER2_ID = 'c5643477-f273-455b-b991-7299066bf9b1';

  const STUDENT1_ID = '2984918e-49b0-4de2-bc57-22d7211db48d';
  const STUDENT2_ID = '2984918e-49b0-4de2-bc57-22d7211db48e';
  const STUDENT3_ID = '2984918e-49b0-4de2-bc57-22d7211db48f';
  const STUDENT4_ID = '2984918e-49b0-4de2-bc57-22d7211db490';
  const STUDENT5_ID = '2984918e-49b0-4de2-bc57-22d7211db491';
  const STUDENT6_ID = '2984918e-49b0-4de2-bc57-22d7211db492';

  const COURSE_MATH_ID = 'course-math-id-1111-2222-333333333333';
  const COURSE_PHYS_ID = 'course-phys-id-1111-2222-333333333333';
  const COURSE_CHEM_ID = 'course-chem-id-1111-2222-333333333333';
  const COURSE_JAVA_ID = 'course-java-id-1111-2222-333333333333';
  const COURSE_ENGL_ID = 'course-engl-id-1111-2222-333333333333';

  const CLASS_MATH_10A_ID = 'class-math-10a-id-1111-2222-333333333333';
  const CLASS_PHYS_11B_ID = 'class-phys-11b-id-1111-2222-333333333333';
  const CLASS_CHEM_12C_ID = 'class-chem-12c-id-1111-2222-333333333333';
  const CLASS_JAVA_BEG_ID = 'class-java-beg-id-1111-2222-333333333333';

  // 1. Seeding users
  const users = [
    { id: ADMIN_ID, email: 'admin@edumeet.vn', username: 'admin', name: 'Hệ Thống Admin', password: adminHash, role: 'admin' },
    { id: MANAGER_ID, email: 'manager@edumeet.vn', username: 'manager', name: 'Quản Lý Đào Tạo', password: managerHash, role: 'manager' },
    { id: TEACHER1_ID, email: 'teacher@edumeet.vn', username: 'namnh', name: 'Thầy Nguyễn Hải Nam', password: teacherHash, role: 'teacher' },
    { id: TEACHER2_ID, email: 'teacher2@edumeet.vn', username: 'thaolt', name: 'Cô Lê Thu Thảo', password: teacherHash, role: 'teacher' },
    { id: STUDENT1_ID, email: 'student@edumeet.vn', username: 'dangn4821', name: 'Nguyễn Đăng', password: studentHash, role: 'student', profile: { studentCode: 'STU-2026-00001', phone: '0912345678', dob: new Date('2005-05-15'), cccd: '037205001234' } },
    { id: STUDENT2_ID, email: 'student2@edumeet.vn', username: 'tamtm1234', name: 'Trần Minh Tâm', password: studentHash, role: 'student', profile: { studentCode: 'STU-2026-00002', phone: '0912345679', dob: new Date('2005-08-20'), cccd: '037205001235' } },
    { id: STUDENT3_ID, email: 'student3@edumeet.vn', username: 'hoalt5678', name: 'Lê Thị Hoa', password: studentHash, role: 'student', profile: { studentCode: 'STU-2026-00003', phone: '0912345680', dob: new Date('2006-02-10'), cccd: '037205001236' } },
    { id: STUDENT4_ID, email: 'student4@edumeet.vn', username: 'baopq8899', name: 'Phạm Quốc Bảo', password: studentHash, role: 'student', profile: { studentCode: 'STU-2026-00004', phone: '0912345681', dob: new Date('2005-11-30'), cccd: '037205001237' } },
    { id: STUDENT5_ID, email: 'student5@edumeet.vn', username: 'thaont1122', name: 'Nguyễn Thu Thảo', password: studentHash, role: 'student', profile: { studentCode: 'STU-2026-00005', phone: '0912345682', dob: new Date('2006-06-05'), cccd: '037205001238' } },
    { id: STUDENT6_ID, email: 'student6@edumeet.vn', username: 'huyhg3344', name: 'Hoàng Gia Huy', password: studentHash, role: 'student', profile: { studentCode: 'STU-2026-00006', phone: '0912345683', dob: new Date('2005-04-25'), cccd: '037205001239' } },
  ];

  for (const userData of users) {
    const roleClean = userData.role.toLowerCase() as any;
    await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password: userData.password,
        role: roleClean,
        status: 'active',
        // Nguyễn Đăng cần đổi mật khẩu cưỡng chế ở lần đầu login để test luồng
        mustChangePassword: userData.id === STUDENT1_ID,
      },
    });
    console.log(`Created user: ${userData.username} (${roleClean})`);

    if (userData.role === 'student' && userData.profile) {
      await prisma.studentProfile.create({
        data: {
          userId: userData.id,
          studentCode: userData.profile.studentCode,
          phone: userData.profile.phone,
          dob: userData.profile.dob,
          cccd: userData.profile.cccd,
        },
      });
      console.log(`Created student profile for: ${userData.name}`);
    }
  }

  // 2. Seeding Courses
  const courses = [
    { id: COURSE_MATH_ID, code: 'MATH-12', name: 'Toán Học Giải Tích 12', description: 'Khóa học cung cấp kiến thức nền tảng và nâng cao về Đạo hàm, Tích phân và Ứng dụng.' },
    { id: COURSE_PHYS_ID, code: 'PHYS-12', name: 'Vật Lý Lớp 12', description: 'Tìm hiểu về các định luật Vật Lý cơ bản: Dao động cơ học, Sóng cơ và Sóng âm.' },
    { id: COURSE_CHEM_ID, code: 'CHEM-12', name: 'Hóa Học Hữu Cơ', description: 'Giới thiệu về thế giới hóa học hữu cơ: Este, Lipit, Cacbohidrat và các phản ứng hữu cơ.' },
    { id: COURSE_JAVA_ID, code: 'JAVA-101', name: 'Java Cơ Bản', description: 'Lập trình Java căn bản cho người mới bắt đầu.' },
    { id: COURSE_ENGL_ID, code: 'ENGL-12', name: 'Tiếng Anh Giao Tiếp', description: 'Tiếng Anh giao tiếp trung cấp phục vụ học tập và nghề nghiệp.' },
  ];

  for (const courseData of courses) {
    await prisma.course.create({
      data: {
        id: courseData.id,
        code: courseData.code,
        name: courseData.name,
        description: courseData.description,
        status: 'active',
      },
    });
    console.log(`Created course: ${courseData.code} - ${courseData.name}`);
  }

  // 3. Seeding Classes
  const classes = [
    { id: CLASS_MATH_10A_ID, courseId: COURSE_MATH_ID, name: 'Lớp Toán Học 12A1', teacherId: TEACHER1_ID, status: 'ongoing' },
    { id: CLASS_PHYS_11B_ID, courseId: COURSE_PHYS_ID, name: 'Lớp Vật Lý 12B2', teacherId: TEACHER2_ID, status: 'scheduled' },
    { id: CLASS_CHEM_12C_ID, courseId: COURSE_CHEM_ID, name: 'Lớp Hóa Học 12C3', teacherId: TEACHER1_ID, status: 'scheduled' },
    { id: CLASS_JAVA_BEG_ID, courseId: COURSE_JAVA_ID, name: 'Lớp Java Beginner J1', teacherId: TEACHER2_ID, status: 'ongoing' },
  ];

  for (const classData of classes) {
    await prisma.class.create({
      data: {
        id: classData.id,
        courseId: classData.courseId,
        name: classData.name,
        teacherId: classData.teacherId,
        status: classData.status,
      },
    });
    console.log(`Created class: ${classData.name}`);
  }

  // 4. Seeding Enrollments (Enroll students in classes)
  const students = [STUDENT1_ID, STUDENT2_ID, STUDENT3_ID, STUDENT4_ID, STUDENT5_ID, STUDENT6_ID];
  let enrollCount = 1;
  for (const sId of students) {
    // Enroll in Math
    await prisma.enrollment.create({
      data: {
        userId: sId,
        classId: CLASS_MATH_10A_ID,
        status: 'active',
      },
    });
    // Enroll in Phys
    await prisma.enrollment.create({
      data: {
        userId: sId,
        classId: CLASS_PHYS_11B_ID,
        status: 'active',
      },
    });
    // Enroll in Java
    await prisma.enrollment.create({
      data: {
        userId: sId,
        classId: CLASS_JAVA_BEG_ID,
        status: 'active',
      },
    });
    console.log(`Enrolled student ${enrollCount++} in multiple classes`);
  }

  // 5. Seeding Sessions (Live and Ended sessions for rich reports)
  const sessionLiveMath = {
    id: 'session-math-live-uuid-0000-0000-0000',
    classId: CLASS_MATH_10A_ID,
    roomName: 'phong-toan-live-9999',
    status: 'live',
    startTime: new Date(),
  };

  const sessionEndedMath = {
    id: 'session-math-ended-uuid-1111-1111-1111',
    classId: CLASS_MATH_10A_ID,
    roomName: 'phong-toan-tich-phan-24',
    status: 'ended',
    startTime: new Date(Date.now() - 24 * 3600 * 1000 - 90 * 60 * 1000), // yesterday
    endTime: new Date(Date.now() - 24 * 3600 * 1000),
  };

  const sessionEndedPhys = {
    id: 'session-phys-ended-uuid-2222-2222-2222',
    classId: CLASS_PHYS_11B_ID,
    roomName: 'phong-vat-ly-song-co-15',
    status: 'ended',
    startTime: new Date(Date.now() - 48 * 3600 * 1000 - 90 * 60 * 1000), // 2 days ago
    endTime: new Date(Date.now() - 48 * 3600 * 1000),
  };

  await prisma.session.create({ data: sessionLiveMath });
  await prisma.session.create({ data: sessionEndedMath });
  await prisma.session.create({ data: sessionEndedPhys });
  console.log('Created live and ended sessions.');

  // 6. Seeding Attendances for ended sessions
  const attendances = [
    // Math Ended Session Attendances
    { sessionId: sessionEndedMath.id, userId: STUDENT1_ID, presentTimeMins: 85, totalTimeMins: 90, pct: 94.4, avgPing: 28.5, avgLoss: 0.2, avgJitter: 4.2, status: 'pass' },
    { sessionId: sessionEndedMath.id, userId: STUDENT2_ID, presentTimeMins: 72, totalTimeMins: 90, pct: 80.0, avgPing: 45.1, avgLoss: 0.3, avgJitter: 6.0, status: 'pass' },
    { sessionId: sessionEndedMath.id, userId: STUDENT3_ID, presentTimeMins: 88, totalTimeMins: 90, pct: 97.7, avgPing: 95.2, avgLoss: 1.2, avgJitter: 14.5, status: 'pass' },
    { sessionId: sessionEndedMath.id, userId: STUDENT4_ID, presentTimeMins: 90, totalTimeMins: 90, pct: 100.0, avgPing: 60.3, avgLoss: 0.5, avgJitter: 8.1, status: 'pass' },
    { sessionId: sessionEndedMath.id, userId: STUDENT5_ID, presentTimeMins: 45, totalTimeMins: 90, pct: 50.0, avgPing: 185.7, avgLoss: 4.2, avgJitter: 24.1, status: 'fail' },
    { sessionId: sessionEndedMath.id, userId: STUDENT6_ID, presentTimeMins: 82, totalTimeMins: 90, pct: 91.1, avgPing: 70.4, avgLoss: 0.8, avgJitter: 10.2, status: 'pass' },

    // Phys Ended Session Attendances
    { sessionId: sessionEndedPhys.id, userId: STUDENT1_ID, presentTimeMins: 90, totalTimeMins: 90, pct: 100.0, avgPing: 22.1, avgLoss: 0.0, avgJitter: 3.1, status: 'pass' },
    { sessionId: sessionEndedPhys.id, userId: STUDENT2_ID, presentTimeMins: 85, totalTimeMins: 90, pct: 94.4, avgPing: 35.4, avgLoss: 0.1, avgJitter: 4.0, status: 'pass' },
    { sessionId: sessionEndedPhys.id, userId: STUDENT3_ID, presentTimeMins: 80, totalTimeMins: 90, pct: 88.8, avgPing: 45.8, avgLoss: 0.2, avgJitter: 6.1, status: 'pass' },
    { sessionId: sessionEndedPhys.id, userId: STUDENT4_ID, presentTimeMins: 50, totalTimeMins: 90, pct: 55.5, avgPing: 110.4, avgLoss: 8.5, avgJitter: 22.3, status: 'fail' },
    { sessionId: sessionEndedPhys.id, userId: STUDENT5_ID, presentTimeMins: 89, totalTimeMins: 90, pct: 98.8, avgPing: 60.1, avgLoss: 0.6, avgJitter: 9.2, status: 'pass' },
    { sessionId: sessionEndedPhys.id, userId: STUDENT6_ID, presentTimeMins: 87, totalTimeMins: 90, pct: 96.6, avgPing: 47.3, avgLoss: 0.1, avgJitter: 5.4, status: 'pass' },
  ];

  for (const att of attendances) {
    await prisma.attendance.create({
      data: {
        sessionId: att.sessionId,
        userId: att.userId,
        presentTimeMins: att.presentTimeMins,
        totalTimeMins: att.totalTimeMins,
        pct: att.pct,
        avgPing: att.avgPing,
        avgLoss: att.avgLoss,
        avgJitter: att.avgJitter,
        status: att.status,
      },
    });
  }
  console.log('Created ended session attendances.');

  // 7. Seeding Course Materials
  const materials = [
    { id: 'mat-math-1', courseId: COURSE_MATH_ID, title: 'Bài giảng Đạo hàm & Khảo sát hàm số', fileName: 'DaoHam_KhaoSat.pptx', fileType: 'slide', fileSize: '4.2 MB', filePath: '/materials/math/DaoHam_KhaoSat.pptx', uploadedById: TEACHER1_ID, isPrivate: false, scope: 'course' as any },
    { id: 'mat-math-2', courseId: COURSE_MATH_ID, title: 'Tài liệu ôn tập Nguyên hàm - Tích phân', fileName: 'TichPhan_NguyenHam.pdf', fileType: 'pdf', fileSize: '1.8 MB', filePath: '/materials/math/TichPhan_NguyenHam.pdf', uploadedById: TEACHER1_ID, isPrivate: false, scope: 'course' as any },
    { id: 'mat-math-3', courseId: COURSE_MATH_ID, title: 'Bài tập trắc nghiệm chương 2 giải tích', fileName: 'TracNghiem_Chuong2.pdf', fileType: 'pdf', fileSize: '850 KB', filePath: '/materials/math/TracNghiem_Chuong2.pdf', uploadedById: TEACHER1_ID, isPrivate: false, scope: 'course' as any },
    { id: 'mat-phys-1', courseId: COURSE_PHYS_ID, title: 'Đề cương ôn tập học kỳ Dao động cơ', fileName: 'OnTap_DaoDongCo.pdf', fileType: 'pdf', fileSize: '2.1 MB', filePath: '/materials/phys/OnTap_DaoDongCo.pdf', uploadedById: TEACHER2_ID, isPrivate: false, scope: 'course' as any },
    { id: 'mat-phys-2', courseId: COURSE_PHYS_ID, title: 'Slide bài giảng Sóng âm & Đặc tính vật lý', fileName: 'SongAm_Slide.pptx', fileType: 'slide', fileSize: '3.6 MB', filePath: '/materials/phys/SongAm_Slide.pptx', uploadedById: TEACHER2_ID, isPrivate: false, scope: 'course' as any },
  ];

  for (const matData of materials) {
    await prisma.courseMaterial.create({
      data: {
        id: matData.id,
        courseId: matData.courseId,
        title: matData.title,
        fileName: matData.fileName,
        fileType: matData.fileType,
        fileSize: matData.fileSize,
        filePath: matData.filePath,
        uploadedById: matData.uploadedById,
        isPrivate: matData.isPrivate,
        scope: matData.scope,
      },
    });
    console.log(`Created material: ${matData.title}`);
  }

  console.log('Seeding relational database completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
