import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

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
  await prisma.user.deleteMany({});
  console.log('Database cleanup completed.');

  // Hash passwords concurrently
  const [adminHash, managerHash, teacherHash, studentHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('manager123', 10),
    bcrypt.hash('teacher123', 10),
    bcrypt.hash('student123', 10),
  ]);

  // Stable UUIDs for idempotent references
  const ADMIN_ID = '8612140d-d421-4f10-911d-cd12f451f151';
  const MANAGER_ID = '71b2d075-8160-496a-85d2-a7f43bb2de14';
  const TEACHER_ID = 'c5643477-f273-455b-b991-7299066bf9b0';
  const STUDENT_ID = '2984918e-49b0-4de2-bc57-22d7211db48d';

  const COURSE_MATH_ID = 'course-math-id-1111-2222-333333333333';
  const COURSE_PHYS_ID = 'course-phys-id-1111-2222-333333333333';
  const COURSE_JAVA_ID = 'course-java-id-1111-2222-333333333333';

  const CLASS_MATH_10A_ID = 'class-math-10a-id-1111-2222-333333333333';
  const CLASS_PHYS_11B_ID = 'class-phys-11b-id-1111-2222-333333333333';

  const ENROLL_STUDENT_MATH_ID = 'enroll-stud-math-id-1111-2222-333333333333';
  const ENROLL_STUDENT_PHYS_ID = 'enroll-stud-phys-id-1111-2222-333333333333';

  const SESSION_MATH_ID = 'session-math-id-1111-2222-333333333333';
  const MATERIAL_MATH_PDF_ID = 'material-math-pdf-id-1111-2222-333333333333';

  // 1. Seeding 4 demo users using upsert
  const users = [
    {
      id: ADMIN_ID,
      email: 'admin@edumeet.vn',
      name: 'Hệ Thống Admin',
      password: adminHash,
      role: 'admin',
    },
    {
      id: MANAGER_ID,
      email: 'manager@edumeet.vn',
      name: 'Quản Lý Đào Tạo',
      password: managerHash,
      role: 'manager',
    },
    {
      id: TEACHER_ID,
      email: 'teacher@edumeet.vn',
      name: 'Nguyễn Văn A',
      password: teacherHash,
      role: 'teacher',
    },
    {
      id: STUDENT_ID,
      email: 'student@edumeet.vn',
      name: 'Trần Văn B',
      password: studentHash,
      role: 'student',
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: userData.password,
        role: userData.role,
      },
      create: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role,
        status: 'active',
      },
    });
    console.log(`Upserted user: ${user.email} (${user.role})`);
  }

  // 2. Seeding Courses
  const courses = [
    {
      id: COURSE_MATH_ID,
      code: 'MATH-101',
      name: 'Toán Học',
      description: 'Môn Toán Học nâng cao lớp 10',
    },
    {
      id: COURSE_PHYS_ID,
      code: 'PHYS-101',
      name: 'Vật Lý',
      description: 'Môn Vật Lý cơ bản lớp 11',
    },
    {
      id: COURSE_JAVA_ID,
      code: 'JAVA-101',
      name: 'Java Cơ Bản',
      description: 'Lập trình Java căn bản cho người mới bắt đầu',
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { id: courseData.id },
      update: {
        code: courseData.code,
        name: courseData.name,
        description: courseData.description,
      },
      create: {
        id: courseData.id,
        code: courseData.code,
        name: courseData.name,
        description: courseData.description,
        status: 'active',
      },
    });
    console.log(`Upserted course: ${course.code} - ${course.name}`);
  }

  // 3. Seeding Classes
  const classes = [
    {
      id: CLASS_MATH_10A_ID,
      courseId: COURSE_MATH_ID,
      name: 'Lớp Toán Học 10A',
      teacherId: TEACHER_ID,
      status: 'ongoing',
    },
    {
      id: CLASS_PHYS_11B_ID,
      courseId: COURSE_PHYS_ID,
      name: 'Lớp Vật Lý 11B',
      teacherId: TEACHER_ID,
      status: 'scheduled',
    },
  ];

  for (const classData of classes) {
    const cls = await prisma.class.upsert({
      where: { id: classData.id },
      update: {
        name: classData.name,
        teacherId: classData.teacherId,
        status: classData.status,
      },
      create: {
        id: classData.id,
        courseId: classData.courseId,
        name: classData.name,
        teacherId: classData.teacherId,
        status: classData.status,
      },
    });
    console.log(`Upserted class: ${cls.name}`);
  }

  // 4. Seeding Enrollments (Enroll the student in both classes)
  const enrollments = [
    {
      id: ENROLL_STUDENT_MATH_ID,
      userId: STUDENT_ID,
      classId: CLASS_MATH_10A_ID,
      status: 'active',
    },
    {
      id: ENROLL_STUDENT_PHYS_ID,
      userId: STUDENT_ID,
      classId: CLASS_PHYS_11B_ID,
      status: 'active',
    },
  ];

  for (const enrollData of enrollments) {
    const enroll = await prisma.enrollment.upsert({
      where: { id: enrollData.id },
      update: {
        status: enrollData.status,
      },
      create: {
        id: enrollData.id,
        userId: enrollData.userId,
        classId: enrollData.classId,
        status: enrollData.status,
      },
    });
    console.log(`Upserted enrollment: Student enrolled in class ID ${enroll.classId}`);
  }

  // 5. Seeding Sessions (Math 10A Session is live/ongoing)
  const sessions = [
    {
      id: SESSION_MATH_ID,
      classId: CLASS_MATH_10A_ID,
      roomName: 'room-math-10a-uuid-live-9999',
      status: 'live',
      startTime: new Date(),
    },
  ];

  for (const sessionData of sessions) {
    const session = await prisma.session.upsert({
      where: { id: sessionData.id },
      update: {
        status: sessionData.status,
      },
      create: {
        id: sessionData.id,
        classId: sessionData.classId,
        roomName: sessionData.roomName,
        status: sessionData.status,
        startTime: sessionData.startTime,
      },
    });
    console.log(`Upserted session: Live room ${session.roomName} for class ID ${session.classId}`);
  }

  // 6. Seeding Course Materials
  const materials = [
    {
      id: MATERIAL_MATH_PDF_ID,
      courseId: COURSE_MATH_ID,
      title: 'Tài liệu Đại Số Chương 1',
      fileName: 'Chuong1_DaiSo.pdf',
      fileType: 'pdf',
      fileSize: '12.5 MB',
      filePath: '/materials/math/Chuong1_DaiSo.pdf',
      uploadedBy: TEACHER_ID,
      isPrivate: false,
    },
  ];

  for (const matData of materials) {
    const mat = await prisma.courseMaterial.upsert({
      where: { id: matData.id },
      update: {
        title: matData.title,
        fileName: matData.fileName,
        fileType: matData.fileType,
        fileSize: matData.fileSize,
        filePath: matData.filePath,
        uploadedBy: matData.uploadedBy,
        isPrivate: matData.isPrivate,
      },
      create: {
        id: matData.id,
        courseId: matData.courseId,
        title: matData.title,
        fileName: matData.fileName,
        fileType: matData.fileType,
        fileSize: matData.fileSize,
        filePath: matData.filePath,
        uploadedBy: matData.uploadedBy,
        isPrivate: matData.isPrivate,
      },
    });
    console.log(`Upserted material: ${mat.title} for course ID ${mat.courseId}`);
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
