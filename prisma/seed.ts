import { PrismaClient, ResourceType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const PASSWORD = '12345678';

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  const hashedPassword = await hashPassword(PASSWORD);




  const [adminRole, directorRole] = await Promise.all([
    prisma.role.upsert({
      where: { role_name: 'Admin' },
      update: { description: 'Administrator' },
      create: { role_name: 'Admin', description: 'Administrator' },
    }),
    prisma.role.upsert({
      where: { role_name: 'Director' },
      update: { description: 'School Director' },
      create: { role_name: 'Director', description: 'School Director' },
    }),
   
  ]);

  // ------------------------------
  // All Permissions
  // ------------------------------
  const detailedPermissions = [

    'create-role',
    'update-role',
    'delete-role',
    'view-role',

    'create-user-role',
    'update-user-role',
    'delete-user-role',
    'view-user-role',

    'create-role-permission',
    'update-role-permission',
    'delete-role-permission',
    'view-role-permission',

    
    'create-admin',
    'update-admin',
    'delete-admin',
    'view-admin',


    'create-subcity',
    'update-subcity',
    'delete-subcity',
    'view-subcity',

    'create-woreda',
    'update-woreda',
    'delete-woreda',
    'view-woreda',

    'create-school',
    'update-school',
    'delete-school',
    'view-school',

    'create-course',
    'update-course',
    'delete-course',
    'view-course',


    'create-grade-course',
    'delete-grade-course',
    'view-grade-course',


    'create-resource',
    'update-resource',
    'delete-resource',
    'view-resource',


    'create-exam',
    'update-exam',
    'delete-exam',
    'view-exam',


    'create-school-admin',
    'update-school-admin',
    'delete-school-admin',
    'view-school-admin',

    'create-student',
    'update-student',
    'delete-student',
    'view-student',

    'create-teacher',
    'update-teacher',
    'delete-teacher',
    'view-teacher',

    'create-teacher-grade-course',
    'update-teacher-grade-course',
    'delete-teacher-grade-course',
    'view-teacher-grade-course',


    'view-school-dashboard',
    'view-all-dashboard',
    
  ];

  const allPermissions = await Promise.all(
    detailedPermissions.map((name) =>
      prisma.permission.upsert({
        where: { permission_name: name },
        update: { description: `Permission for ${name.replace(/-/g, ' ')}` },
        create: {
          permission_name: name,
          description: `Permission for ${name.replace(/-/g, ' ')}`,
        },
      }),
    ),
  );

  // ------------------------------
  // Role-Permission Mapping
  // ------------------------------
  const adminPermissions = allPermissions.map((p) => ({
    role_id: adminRole.id,
    permission_id: p.id,
  }));

  await Promise.all([
    prisma.rolePermission.createMany({
      data: adminPermissions,
      skipDuplicates: true,
    }),
 
  ]);
  // -----------------------
  // 1. Create Grades
  // -----------------------
  const gradeNames = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  await prisma.grade.createMany({
    data: gradeNames.map((name) => ({ name })),
    skipDuplicates: true,
  });
  const grades = await prisma.grade.findMany();



  const admin = await prisma.user.upsert({
    where: { user_name: 'admin' },
    update: {},
    create: {
      name: 'System Admin',
      user_name: 'admin',
      password: hashedPassword,
      user_type: 'admin',
      gender: 'male',
    },
  });


  const existingUserRole = await prisma.userRole.findUnique({
    where: {
      user_id_role_id: {
        user_id: admin.id,
        role_id: adminRole.id,
      },
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        user_id: admin.id,
        role_id: adminRole.id,
      },
    });
    console.log('✅ Admin role assigned to admin user');
  } else {
    console.log('ℹ️ Admin user already has Admin role');
  }






  // -----------------------
  // 2. Create Courses
  // -----------------------
  const courseNames = ['Math', 'English', 'Physics', 'Biology', 'Chemistry'];
  await prisma.course.createMany({
    data: courseNames.map((name) => ({ name, added_by: admin.id })), // updated later
    skipDuplicates: true,
  });
  const courses = await prisma.course.findMany();

  // -----------------------
  // 3. Create Admin User
  // -----------------------
  
  // Update courses to set added_by admin
  await prisma.course.updateMany({
    data: { added_by: admin.id },
  });

  // -----------------------
  // 4. Create Subcities → Woredas → Schools
  // -----------------------
  const subcitiesData = Array.from({ length: 3 }).map(() => ({
    name: faker.location.city(),
    woredas: Array.from({ length: 2 }).map(() => ({
      name: faker.location.county(),
      schools: Array.from({ length: 2 }).map(() => faker.company.name()),
    })),
  }));

  const allSchools: any[] = [];

  for (const sub of subcitiesData) {
    const subcity = await prisma.subcity.create({
      data: { name: sub.name, added_by: admin.id },
    });

    for (const w of sub.woredas) {
      const woreda = await prisma.woreda.create({
        data: { name: w.name, subcity_id: subcity.id, added_by: admin.id },
      });

      for (const s of w.schools) {
        const school = await prisma.school.create({
          data: {
            name: s,
            woreda_id: woreda.id,
            school_type: 'secondary',
            added_by: admin.id,
          },
        });
        allSchools.push(school);
      }
    }
  }

  // -----------------------
  // 5. GradeCourse & Resources
  // -----------------------
  for (const grade of grades) {
    for (const course of courses) {
     

      await prisma.gradeCourse.createMany({
          data: grades.flatMap(grade =>
            courses.map(course => ({
              grade_id: grade.id,
              course_id: course.id,
              added_by: admin.id,
              status: true, // <-- Type 'true' is not assignable to type 'never'
            }))
          ),
          skipDuplicates: true,
        });

      // Create resources
      for (let chapter = 1; chapter <= 3; chapter++) {
        await prisma.resource.create({
          data: {
            name: `${course.name} ${grade.name} Chapter ${chapter}`,
            description: `${course.name} ${grade.name} Chapter ${chapter}`,
            file_path: `/files/${course.name.toLowerCase()}-${grade.name.replace(
              ' ',
              ''
            )}-ch${chapter}.pdf`,
            grade_id: grade.id,
            course_id: course.id,
            added_by: admin.id,
            resource_type: 'pdf',
            chapter,
          },
        });
      }
    }
  }

  // -----------------------
  // 6. Users (Teachers + Students)
  // -----------------------
  const users: any[] = [];
  for (const school of allSchools) {
    for (const grade of grades) {
      const hashed = await hashPassword(PASSWORD);

      // Teachers
      for (let i = 0; i < 2; i++) {
        const teacher = await prisma.user.create({
          data: {
            name: faker.person.fullName(),
            user_name: faker.internet.userName(),
            password: hashed,
            user_type: 'teacher',
            gender: i % 2 ? 'male' : 'female',
            school_id: school.id,
            grade_id: grade.id,
          },
        });
        users.push(teacher);

        // Assign TeacherGradeCourse
        for (const course of courses) {
          await prisma.teacherGradeCourse.create({
            data: {
              teacher_id: teacher.id,
              grade_id: grade.id,
              course_id: course.id,
              added_by: admin.id,
            },
          });
        }
      }

      // Students
      for (const section of ['A', 'B']) {
        for (let i = 0; i < 5; i++) {
          const student = await prisma.user.create({
            data: {
              name: faker.person.fullName(),
              user_name: faker.internet.userName(),
              password: hashed,
              user_type: 'student',
              gender: i % 2 ? 'male' : 'female',
              school_id: school.id,
              grade_id: grade.id,
              section,
            },
          });
          users.push(student);
        }
      }
    }
  }

  // -----------------------
  // 7. Visit History
  // -----------------------
  for (const user of users) {
    await prisma.visitHistory.create({
      data: {
        user_id: user.id,
        login_date: faker.date.recent(),
        is_student: user.user_type === 'student',
        is_teacher: user.user_type === 'teacher',
        is_admin: user.user_type === 'admin',
        is_director: user.user_type === 'director',
      },
    });
  }

  // -----------------------
  // 8. Exams + Options + Comments + Results
  // -----------------------
  for (const grade of grades) {
    for (const course of courses) {
      const resources = await prisma.resource.findMany({
        where: { grade_id: grade.id, course_id: course.id },
      });

      // Exam Questions
      for (let q = 0; q < 3; q++) {
        const question = await prisma.examQuestion.create({
          data: {
            question_text: faker.lorem.sentence(),
            course_id: course.id,
            grade_id: grade.id,
            chapter: faker.number.int({ min: 1, max: 3 }),
            created_by: admin.id,
          },
        });

        // Options
        for (let o = 0; o < 4; o++) {
          await prisma.examOption.create({
            data: {
              question_id: question.id,
              option_text: faker.lorem.words(3),
              is_correct: o === 0, // first option correct
            },
          });
        }

        // Comments
        await prisma.examComment.create({
          data: {
            question_id: question.id,
            user_id: admin.id,
          },
        });

        // Exam Results for students
        const students = users.filter(
          (u) => u.user_type === 'student' && u.grade_id === grade.id
        );
        for (const student of students) {
          await prisma.examResult.create({
            data: {
              user_id: student.id,
              grade_id: grade.id,
              course_id: course.id,
              max_score: 100,
              result: faker.number.int({ min: 50, max: 100 }),
            },
          });
        }
      }
    }
  }

  // -----------------------
  // 9. Downloads (Students + Teachers)
  // -----------------------
  const allResources = await prisma.resource.findMany();
  const teachers = users.filter((u) => u.user_type === 'teacher');
  const students = users.filter((u) => u.user_type === 'student');

  for (const student of students) {
    const randomResource = faker.helpers.arrayElement(allResources);
    await prisma.studentDownload.create({
      data: {
        student_id: student.id,
        resource_id: randomResource.id,
        year: faker.date.past().getFullYear(),
      },
    });
  }

  for (const teacher of teachers) {
    const randomResource = faker.helpers.arrayElement(allResources);
    await prisma.teacherDownload.create({
      data: {
        teacher_id: teacher.id,
        resource_id: randomResource.id,
        year: faker.date.past().getFullYear(),
      },
    });
  }

  console.log('✅ Full seeding completed!');
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
