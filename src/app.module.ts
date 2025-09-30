import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { MinioModule } from './minio/minio.module';
import { ConfigModule } from '@nestjs/config';
import { CourseService } from './course/course.service';
import { CourseModule } from './course/course.module';
import { GradeModule } from './grade/grade.module';
import { ResourceModule } from './resource/resource.module';
import { SubcityModule } from './subcity/subcity.module';
import { WoredaModule } from './woreda/woreda.module';
import { SchoolModule } from './school/school.module';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { CityAdminModule } from './city-admin/city-admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DirectorModule } from './director/director.module';
import { ExamModule } from './exam/exam.module';
import { SubcityAdminModule } from './subcity-admin/subcity-admin.module';
import { TeacherCourseModule } from './teacher-course/teacher-course.module';
import { WoredaAdminModule } from './woreda-admin/woreda-admin.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,   // makes ConfigService available everywhere
    }),
    AuthModule,   // handles login, registration, JWT
    TeacherModule,
    TeacherCourseModule,
    UserModule,
    WoredaModule,
    WoredaAdminModule,
    PrismaModule, // provides PrismaService globally
    CityAdminModule,
    CourseModule,
    DashboardModule,
    DirectorModule,
    ExamModule,
    GradeModule,
    ResourceModule,
    SchoolModule,
    StudentModule,
    SubcityModule,
    SubcityAdminModule
    
  ],
  controllers: [AppController],
  providers: [AppService, CourseService],
  
})
export class AppModule {}