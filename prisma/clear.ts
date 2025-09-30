import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete in order to avoid foreign key issues
  await prisma.visitHistory.deleteMany({});
  await prisma.studentDownload.deleteMany({});
  await prisma.teacherDownload.deleteMany({});
  await prisma.examComment.deleteMany({});
  await prisma.examOption.deleteMany({});
  await prisma.examQuestion.deleteMany({});
  await prisma.teacherGradeCourse.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.gradeCourse.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.woreda.deleteMany({});
  await prisma.subcity.deleteMany({});
  await prisma.grade.deleteMany({});

  console.log('✅ All tables cleared!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
