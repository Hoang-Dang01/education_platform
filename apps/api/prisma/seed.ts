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

  // 2. Seed a single active session for WebRTC multi-device testing
  console.log('Seeding a single active live session for testing...');
  const course = await prisma.course.create({
    data: {
      id: 'course-math',
      code: 'MATH101',
      name: 'Toán học Đại cương',
      description: 'Lớp học Toán học đại cương phục vụ cho mục đích nghiên cứu và kiểm thử.',
    },
  });

  const classItem = await prisma.class.create({
    data: {
      id: 'class-math',
      courseId: course.id,
      name: 'Lớp Toán 12A1',
      teacherId: TEACHER1_ID,
      status: 'ongoing',
    },
  });

  await prisma.session.create({
    data: {
      id: 'math-live-class-1',
      classId: classItem.id,
      roomName: 'math-live-room-' + Math.floor(Math.random() * 1000), // Tên phòng duy nhất cho WebRTC server
      status: 'live',
      startTime: new Date(),
    },
  });
  console.log('Active session seeded: math-live-class-1');

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
