import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private getColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  async getShaggarStudentInformation() {
    const subcities = await this.prisma.subcity.findMany({
      include: {
        woredas: {
          include: { schools: true },
        },
      },
    });

    const totalStudents = await this.prisma.user.count({ where: { user_type: 'student' } });
    const totalMale = await this.prisma.user.count({ where: { user_type: 'student', gender: 'Male' } });
    const totalFemale = await this.prisma.user.count({ where: { user_type: 'student', gender: 'Female' } });

    // Chart1
    const Chart1 = {
      Type: 'doughnut',
      Title: 'Total Student Chart',
      Labels: ['Total', 'Male', 'Female'],
      Data: [totalStudents, totalMale, totalFemale],
      BackgroundColor: [this.getColor(), this.getColor(), this.getColor()],
    };

    // Chart2
    const Chart2 = {
      Type: 'bar',
      Title: 'Total Subcity Students',
      Labels: [] as string[],
      Dataset: [
        { Label: 'Total', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Male', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Female', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
      ],
    };

    for (const subcity of subcities) {
      let total = 0;
      let totalMaleSub = 0;
      let totalFemaleSub = 0;

      for (const woreda of subcity.woredas) {
        for (const school of woreda.schools) {
          total += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
          totalMaleSub += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
          totalFemaleSub += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });
        }
      }

      Chart2.Labels.push(subcity.name);
      Chart2.Dataset[0].Data.push(total);
      Chart2.Dataset[1].Data.push(totalMaleSub);
      Chart2.Dataset[2].Data.push(totalFemaleSub);
    }

    // Chart3 and Chart4 (Government / Private)
    const Chart3 = {
      Type: 'bar',
      Title: 'Report for students from GOVERNMENT schools',
      Labels: [] as string[],
      Dataset: [
        { Label: 'Total', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Male', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Female', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
      ],
    };

    const Chart4 = {
      Type: 'bar',
      Title: 'Report for students from PRIVATE schools',
      Labels: [] as string[],
      Dataset: [
        { Label: 'Total', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Male', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Female', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
      ],
    };

    for (const subcity of subcities) {
      let gTotal = 0, gMale = 0, gFemale = 0;
      let pTotal = 0, pMale = 0, pFemale = 0;

      for (const woreda of subcity.woredas) {
        for (const school of woreda.schools) {
          if (school.school_type === 'government') {
            gTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
            gMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
            gFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });
          } else {
            pTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
            pMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
            pFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });
          }
        }
      }

      Chart3.Labels.push(subcity.name);
      Chart3.Dataset[0].Data.push(gTotal);
      Chart3.Dataset[1].Data.push(gMale);
      Chart3.Dataset[2].Data.push(gFemale);

      Chart4.Labels.push(subcity.name);
      Chart4.Dataset[0].Data.push(pTotal);
      Chart4.Dataset[1].Data.push(pMale);
      Chart4.Dataset[2].Data.push(pFemale);
    }

    return {
      Title: 'GENERAL STUDENT REPORT FOR SHAGGAR CITY',
      Charts: [Chart1, Chart2, Chart3, Chart4],
      Subcities: subcities,
    };
  }



  async getSubcityStudentInformation(subcityId: string) {
    const subcity = await this.prisma.subcity.findUnique({
      where: { id: subcityId },
      include: {
        woredas: {
          include: { schools: true },
        },
      },
    });

    if (!subcity) return null;

    // Totals
    let totalStudents = 0;
    let totalMale = 0;
    let totalFemale = 0;

    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        totalStudents += await this.prisma.user.count({
          where: { user_type: 'student', school_id: school.id },
        });
        totalMale += await this.prisma.user.count({
          where: { user_type: 'student', school_id: school.id, gender: 'Male' },
        });
        totalFemale += await this.prisma.user.count({
          where: { user_type: 'student', school_id: school.id, gender: 'Female' },
        });
      }
    }

    const Chart1 = {
      Type: 'doughnut',
      Title: `Total ${subcity.name} student report`,
      Labels: ['Total', 'Male', 'Female'],
      Data: [totalStudents, totalMale, totalFemale],
      BackgroundColor: [this.getColor(), this.getColor(), this.getColor()],
    };

    // Chart2 - Woredas
    const Chart2 = {
      Type: 'bar',
      Title: `Total ${subcity.name} woredas student`,
      Labels: [] as string[],
      Dataset: [
        { Label: 'Total', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Male', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
        { Label: 'Female', Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] },
      ],
    };

    for (const woreda of subcity.woredas) {
      let woredaTotal = 0;
      let woredaMale = 0;
      let woredaFemale = 0;

      for (const school of woreda.schools) {
        woredaTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
        woredaMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
        woredaFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });
      }

      Chart2.Labels.push(woreda.name);
      Chart2.Dataset[0].Data.push(woredaTotal);
      Chart2.Dataset[1].Data.push(woredaMale);
      Chart2.Dataset[2].Data.push(woredaFemale);
    }

    // Chart3 & Chart4 - Government vs Private Schools
    const Chart3 = { Type: 'bar', Title: `${subcity.name} report for students from GOVERNMENT schools`, Labels: [] as string[], Dataset: [] as any[] };
    const Chart4 = { Type: 'bar', Title: `${subcity.name} report for students from PRIVATE schools`, Labels: [] as string[], Dataset: [] as any[] };

    for (const type of ['Total', 'Male', 'Female']) {
      Chart3.Dataset.push({ Label: type, Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] });
      Chart4.Dataset.push({ Label: type, Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] });
    }

    for (const woreda of subcity.woredas) {
      let gTotal = 0, gMale = 0, gFemale = 0;
      let pTotal = 0, pMale = 0, pFemale = 0;

      for (const school of woreda.schools) {
        if (school.school_type === 'government') {
          gTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
          gMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
          gFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });
        } else {
          pTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
          pMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
          pFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });
        }
      }

      Chart3.Labels.push(woreda.name);
      Chart3.Dataset[0].Data.push(gTotal);
      Chart3.Dataset[1].Data.push(gMale);
      Chart3.Dataset[2].Data.push(gFemale);

      Chart4.Labels.push(woreda.name);
      Chart4.Dataset[0].Data.push(pTotal);
      Chart4.Dataset[1].Data.push(pMale);
      Chart4.Dataset[2].Data.push(pFemale);
    }

    // Chart5 - Students per year
    const Chart5 = { Type: 'bar', Title: `${subcity.name} total students registered per years`, Labels: [] as string[], Dataset: [] as any[] };
    for (const type of ['Total', 'Male', 'Female']) {
      Chart5.Dataset.push({ Label: type, Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] });
    }

    const firstStudent = await this.prisma.user.findFirst({ where: { user_type: 'student' }, orderBy: { created_at: 'asc' } });
    const lastStudent = await this.prisma.user.findFirst({ where: { user_type: 'student' }, orderBy: { created_at: 'desc' } });

    const startYear = firstStudent ? new Date(firstStudent.created_at).getFullYear() : 2023;
    const endYear = lastStudent ? new Date(lastStudent.created_at).getFullYear() : 2023;

    for (let year = startYear; year <= endYear; year++) {
      Chart5.Labels.push(year.toString());
      let yTotal = 0, yMale = 0, yFemale = 0;

      for (const woreda of subcity.woredas) {
        for (const school of woreda.schools) {
          yTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } } });
          yMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male', created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } } });
          yFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female', created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } } });
        }
      }

      Chart5.Dataset[0].Data.push(yTotal);
      Chart5.Dataset[1].Data.push(yMale);
      Chart5.Dataset[2].Data.push(yFemale);
    }

    // Chart6 - Students per grades
    const grades = await this.prisma.grade.findMany();
    const Chart6 = { Type: 'bar', Title: `${subcity.name} total students per grades`, Labels: [] as string[], Dataset: [] as any[] };
    for (const type of ['Total', 'Male', 'Female']) {
      Chart6.Dataset.push({ Label: type, Color: this.getColor(), PointColor: this.getColor(), Data: [] as number[] });
    }

    for (const grade of grades) {
      Chart6.Labels.push(grade.name);
      let gTotal = 0, gMale = 0, gFemale = 0;

      for (const woreda of subcity.woredas) {
        for (const school of woreda.schools) {
          gTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id } });
          gMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id, gender: 'Male' } });
          gFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id, gender: 'Female' } });
        }
      }

      Chart6.Dataset[0].Data.push(gTotal);
      Chart6.Dataset[1].Data.push(gMale);
      Chart6.Dataset[2].Data.push(gFemale);
    }

    // Result
    return {
      Title: `GENERAL STUDENT REPORT FOR ${subcity.name.toUpperCase()}`,
      Charts: [Chart1, Chart2, Chart3, Chart4, Chart5, Chart6],
      Subcities: await this.prisma.subcity.findMany(),
      Subcity: subcity,
    };
  }



  async getWoredaStudentInformation(woredaId: string) {
    const woreda = await this.prisma.woreda.findUnique({
      where: { id: woredaId },
      include: {
        schools: true,
        subcity: true,
      },
    });

    if (!woreda) return null;

    // Totals
    let totalStudents = 0;
    let totalMale = 0;
    let totalFemale = 0;

    for (const school of woreda.schools) {
      totalStudents += await this.prisma.user.count({
        where: { user_type: 'student', school_id: school.id },
      });
      totalMale += await this.prisma.user.count({
        where: { user_type: 'student', school_id: school.id, gender: 'Male' },
      });
      totalFemale += await this.prisma.user.count({
        where: { user_type: 'student', school_id: school.id, gender: 'Female' },
      });
    }

    const Chart1 = {
      type: 'doughnut',
      title: `Total ${woreda.name} woreda student report`,
      labels: ['Total', 'Male', 'Female'],
      data: [totalStudents, totalMale, totalFemale],
      background_color: [this.getColor(), this.getColor(), this.getColor()],
    };

    // Chart2 - per school
    const Chart2 = {
      type: 'bar',
      title: `Total ${woreda.name} woreda student per school`,
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const school of woreda.schools) {
      const total = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
      const male = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
      const female = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });

      Chart2.labels.push(school.name);
      Chart2.dataset[0].data.push(total);
      Chart2.dataset[1].data.push(male);
      Chart2.dataset[2].data.push(female);
    }

    // Chart3 & Chart4 - Government vs Private
    const Chart3 = { type: 'bar', title: `${woreda.name} woreda report for student from GOVERNMENT school`, labels: [] as string[], dataset: [] as any[] };
    const Chart4 = { type: 'bar', title: `${woreda.name} woreda report for student from PRIVATE school`, labels: [] as string[], dataset: [] as any[] };

    for (const type of ['Total', 'Male', 'Female']) {
      Chart3.dataset.push({ label: type, color: this.getColor(), pointColor: this.getColor(), data: [] as number[] });
      Chart4.dataset.push({ label: type, color: this.getColor(), pointColor: this.getColor(), data: [] as number[] });
    }

    for (const school of woreda.schools) {
      let gTotal = 0, gMale = 0, gFemale = 0;
      let pTotal = 0, pMale = 0, pFemale = 0;

      if (school.school_type === 'government') {
        gTotal = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
        gMale = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
        gFemale = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });

        Chart3.labels.push(woreda.name);
        Chart3.dataset[0].data.push(gTotal);
        Chart3.dataset[1].data.push(gMale);
        Chart3.dataset[2].data.push(gFemale);
      } else {
        pTotal = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id } });
        pMale = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male' } });
        pFemale = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female' } });

        Chart4.labels.push(woreda.name);
        Chart4.dataset[0].data.push(pTotal);
        Chart4.dataset[1].data.push(pMale);
        Chart4.dataset[2].data.push(pFemale);
      }
    }

    // Chart5 - students per year
    const Chart5 = { type: 'bar', title: `${woreda.name} woreda total students registered per years`, labels: [] as string[], dataset: [] as any[] };
    for (const type of ['Total', 'Male', 'Female']) {
      Chart5.dataset.push({ label: type, color: this.getColor(), pointColor: this.getColor(), data: [] as number[] });
    }

    const firstStudent = await this.prisma.user.findFirst({ where: { user_type: 'student' }, orderBy: { created_at: 'asc' } });
    const lastStudent = await this.prisma.user.findFirst({ where: { user_type: 'student' }, orderBy: { created_at: 'desc' } });

    const startYear = firstStudent ? new Date(firstStudent.created_at).getFullYear() : 2023;
    const endYear = lastStudent ? new Date(lastStudent.created_at).getFullYear() : 2023;

    for (let year = startYear; year <= endYear; year++) {
      Chart5.labels.push(year.toString());
      let yTotal = 0, yMale = 0, yFemale = 0;

      for (const school of woreda.schools) {
        yTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } } });
        yMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Male', created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } } });
        yFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, gender: 'Female', created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } } });
      }

      Chart5.dataset[0].data.push(yTotal);
      Chart5.dataset[1].data.push(yMale);
      Chart5.dataset[2].data.push(yFemale);
    }

    // Chart6 - students per grade
    const grades = await this.prisma.grade.findMany();
    const Chart6 = { type: 'bar', title: `${woreda.name} woreda total students per grades`, labels: [] as string[], dataset: [] as any[] };
    for (const type of ['Total', 'Male', 'Female']) {
      Chart6.dataset.push({ label: type, color: this.getColor(), pointColor: this.getColor(), data: [] as number[] });
    }

    for (const grade of grades) {
      Chart6.labels.push(grade.name);
      let gTotal = 0, gMale = 0, gFemale = 0;

      for (const school of woreda.schools) {
        gTotal += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id } });
        gMale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id, gender: 'Male' } });
        gFemale += await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id, gender: 'Female' } });
      }

      Chart6.dataset[0].data.push(gTotal);
      Chart6.dataset[1].data.push(gMale);
      Chart6.dataset[2].data.push(gFemale);
    }

    return {
      title: `GENERAL STUDENT REPORT FOR ${woreda.name.toUpperCase()}`,
      charts: [Chart1, Chart2, Chart3, Chart4, Chart5, Chart6],
      subcitys: await this.prisma.subcity.findMany(),
      _subcity: woreda.subcity,
      _woreda: woreda,
    };
  }




   async getSchoolStudentInformation(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        woreda: { include: { subcity: true } },
      },
    });

    if (!school) return null;

    // Totals
    const totalStudents = await this.prisma.user.count({
      where: { user_type: 'student', school_id: school.id },
    });
    const totalMale = await this.prisma.user.count({
      where: { user_type: 'student', school_id: school.id, gender: 'Male' },
    });
    const totalFemale = await this.prisma.user.count({
      where: { user_type: 'student', school_id: school.id, gender: 'Female' },
    });

    const Chart1 = {
      type: 'doughnut',
      title: `Total ${school.name} student report`,
      labels: ['Total', 'Male', 'Female'],
      data: [totalStudents, totalMale, totalFemale],
      background_color: [this.getColor(), this.getColor(), this.getColor()],
    };

    // Chart5 - students per year
    const Chart5 = {
      type: 'bar',
      title: `${school.name} total students registered per years`,
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    const firstStudent = await this.prisma.user.findFirst({
      where: { user_type: 'student' },
      orderBy: { created_at: 'asc' },
    });
    const lastStudent = await this.prisma.user.findFirst({
      where: { user_type: 'student' },
      orderBy: { created_at: 'desc' },
    });

    const startYear = firstStudent ? new Date(firstStudent.created_at).getFullYear() : 2023;
    const endYear = lastStudent ? new Date(lastStudent.created_at).getFullYear() : 2023;

    for (let year = startYear; year <= endYear; year++) {
      Chart5.labels.push(year.toString());
      const yTotal = await this.prisma.user.count({
        where: {
          user_type: 'student',
          school_id: school.id,
          created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) },
        },
      });
      const yMale = await this.prisma.user.count({
        where: {
          user_type: 'student',
          school_id: school.id,
          gender: 'Male',
          created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) },
        },
      });
      const yFemale = await this.prisma.user.count({
        where: {
          user_type: 'student',
          school_id: school.id,
          gender: 'Female',
          created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) },
        },
      });

      Chart5.dataset[0].data.push(yTotal);
      Chart5.dataset[1].data.push(yMale);
      Chart5.dataset[2].data.push(yFemale);
    }

    // Chart6 - students per grade
    const grades = await this.prisma.grade.findMany();
    const Chart6 = {
      type: 'bar',
      title: `${school.name} woreda total students per grades`,
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const grade of grades) {
      Chart6.labels.push(grade.name);
      const total = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id } });
      const male = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id, gender: 'Male' } });
      const female = await this.prisma.user.count({ where: { user_type: 'student', school_id: school.id, grade_id: grade.id, gender: 'Female' } });

      Chart6.dataset[0].data.push(total);
      Chart6.dataset[1].data.push(male);
      Chart6.dataset[2].data.push(female);
    }

    return {
      title: `GENERAL STUDENT REPORT FOR ${school.name.toUpperCase()}`,
      charts: [Chart1, Chart5, Chart6],
      subcitys: await this.prisma.subcity.findMany(),
      _subcity: school.woreda.subcity,
      _woreda: school.woreda,
      _school: school,
    };
  }


  async getAllShaggarTeacherInformation() {
    const subcitys = await this.prisma.subcity.findMany({
      include: {
        woredas: {
          include: {
            schools: true,
          },
        },
      },
    });

    // Chart1 - total teachers
    const totalTeachers = await this.prisma.user.count({ where: { user_type: 'teacher' } });
    const totalMale = await this.prisma.user.count({ where: { user_type: 'teacher', gender: 'Male' } });
    const totalFemale = await this.prisma.user.count({ where: { user_type: 'teacher', gender: 'Female' } });

    const chart1 = {
      type: 'doughnut' as const,
      title: 'Total teacher chart',
      labels: ['Total', 'Male', 'Female'] as string[],
      data: [totalTeachers, totalMale, totalFemale] as number[],
      background_color: [this.getColor(), this.getColor(), this.getColor()] as string[],
    };

    // Chart2 - teachers per subcity
    const chart2 = {
      type: 'bar' as const,
      title: 'Total subcitys teacher',
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const subcity of subcitys) {
      let total = 0,
        totalMale = 0,
        totalFemale = 0;
      for (const woreda of subcity.woredas) {
        for (const school of woreda.schools) {
          total += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
          totalMale += await this.prisma.user.count({
            where: { user_type: 'teacher', gender: 'Male', school_id: school.id },
          });
          totalFemale += await this.prisma.user.count({
            where: { user_type: 'teacher', gender: 'Female', school_id: school.id },
          });
        }
      }
      chart2.labels.push(subcity.name);
      chart2.dataset[0].data.push(total);
      chart2.dataset[1].data.push(totalMale);
      chart2.dataset[2].data.push(totalFemale);
    }

    // Chart3 & Chart4 - government vs private
    const chart3 = {
      type: 'bar' as const,
      title: 'Teacher from government school',
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    const chart4 = {
      type: 'bar' as const,
      title: 'Teacher from private school',
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const subcity of subcitys) {
      let g_total = 0,
        g_totalMale = 0,
        g_totalFemale = 0;
      let p_total = 0,
        p_totalMale = 0,
        p_totalFemale = 0;

      for (const woreda of subcity.woredas) {
        for (const school of woreda.schools) {
          if (school.school_type === 'government') {
            g_total += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
            g_totalMale += await this.prisma.user.count({
              where: { user_type: 'teacher', gender: 'Male', school_id: school.id },
            });
            g_totalFemale += await this.prisma.user.count({
              where: { user_type: 'teacher', gender: 'Female', school_id: school.id },
            });
          } else {
            p_total += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
            p_totalMale += await this.prisma.user.count({
              where: { user_type: 'teacher', gender: 'Male', school_id: school.id },
            });
            p_totalFemale += await this.prisma.user.count({
              where: { user_type: 'teacher', gender: 'Female', school_id: school.id },
            });
          }
        }
      }

      chart3.labels.push(subcity.name);
      chart3.dataset[0].data.push(g_total);
      chart3.dataset[1].data.push(g_totalMale);
      chart3.dataset[2].data.push(g_totalFemale);

      chart4.labels.push(subcity.name);
      chart4.dataset[0].data.push(p_total);
      chart4.dataset[1].data.push(p_totalMale);
      chart4.dataset[2].data.push(p_totalFemale);
    }

    return { charts: [chart1, chart2, chart3, chart4], subcitys, type: 'teacher' };
  }



   async getAllSubcityTeacherInformation(subcityId: string) {
    const subcity = await this.prisma.subcity.findUnique({
      where: { id: subcityId },
      include: {
        woredas: {
          include: {
            schools: true,
          },
        },
      },
    });

    if (!subcity) throw new NotFoundException('Subcity not found');

    // Chart1 - total teachers
    let tTeacher = 0;
    let tmTeacher = 0;
    let tfTeacher = 0;

    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        tTeacher += await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id },
        });
        tmTeacher += await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id, gender: 'Male' },
        });
        tfTeacher += await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id, gender: 'Female' },
        });
      }
    }

    const chart1 = {
      type: 'doughnut' as const,
      title: `Total ${subcity.name} teacher report`,
      labels: ['Total', 'Male', 'Female'] as string[],
      data: [tTeacher, tmTeacher, tfTeacher] as number[],
      background_color: [this.getColor(), this.getColor(), this.getColor()] as string[],
    };

    // Chart2 - teachers per woreda
    const chart2 = {
      type: 'bar' as const,
      title: `Total ${subcity.name} woredas teacher`,
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const woreda of subcity.woredas) {
      let total = 0,
        totalMale = 0,
        totalFemale = 0;
      for (const school of woreda.schools) {
        total += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
        totalMale += await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id, gender: 'Male' },
        });
        totalFemale += await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id, gender: 'Female' },
        });
      }
      chart2.labels.push(woreda.name);
      chart2.dataset[0].data.push(total);
      chart2.dataset[1].data.push(totalMale);
      chart2.dataset[2].data.push(totalFemale);
    }

    // Chart3 & Chart4 - government vs private
    const chart3 = {
      type: 'bar' as const,
      title: `${subcity.name} report for teacher from GOVERNMENT school`,
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    const chart4 = {
      type: 'bar' as const,
      title: `${subcity.name} report for teacher from PRIVATE school`,
      labels: [] as string[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const woreda of subcity.woredas) {
      let gTotal = 0,
        gMale = 0,
        gFemale = 0;
      let pTotal = 0,
        pMale = 0,
        pFemale = 0;

      for (const school of woreda.schools) {
        if (school.school_type === 'government') {
          gTotal += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
          gMale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Male' } });
          gFemale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Female' } });
        } else {
          pTotal += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
          pMale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Male' } });
          pFemale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Female' } });
        }
      }

      chart3.labels.push(woreda.name);
      chart3.dataset[0].data.push(gTotal);
      chart3.dataset[1].data.push(gMale);
      chart3.dataset[2].data.push(gFemale);

      chart4.labels.push(woreda.name);
      chart4.dataset[0].data.push(pTotal);
      chart4.dataset[1].data.push(pMale);
      chart4.dataset[2].data.push(pFemale);
    }

    // You can continue similarly for chart5 (years), chart6 (grades), chart7 (courses)...

    return {
      title: `GENERAL STUDENT REPORT FOR ${subcity.name.toUpperCase()}`,
      charts: [chart1, chart2, chart3, chart4],
      subcity,
      type: 'teacher',
    };
  }




   async getAllWoredaTeacherInformation(woredaId: string) {
    const woreda = await this.prisma.woreda.findUnique({
      where: { id: woredaId },
      include: {
        schools: true,
        subcity: true,
      },
    });

    if (!woreda) throw new NotFoundException('Woreda not found');

    // Chart1 - Total teachers
    let tTeacher = 0;
    let tmTeacher = 0;
    let tfTeacher = 0;

    for (const school of woreda.schools) {
      tTeacher += await this.prisma.user.count({
        where: { user_type: 'teacher', school_id: school.id },
      });
      tmTeacher += await this.prisma.user.count({
        where: { user_type: 'teacher', school_id: school.id, gender: 'Male' },
      });
      tfTeacher += await this.prisma.user.count({
        where: { user_type: 'teacher', school_id: school.id, gender: 'Female' },
      });
    }

    const chart1 = {
      type: 'doughnut' as const,
      title: `Total ${woreda.name} woreda teacher report`,
      labels: ['Total', 'Male', 'Female'] as string[],
      data: [tTeacher, tmTeacher, tfTeacher] as number[],
      background_color: [this.getColor(), this.getColor(), this.getColor()] as string[],
    };

    // Chart2 - Teachers per school
    const chart2 = {
      type: 'bar' as const,
      title: `Total ${woreda.name} woreda teacher per school`,
      labels: woreda.schools.map(s => s.name),
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const school of woreda.schools) {
      chart2.dataset[0].data.push(
        await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } })
      );
      chart2.dataset[1].data.push(
        await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Male' } })
      );
      chart2.dataset[2].data.push(
        await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Female' } })
      );
    }

    // Chart3 & Chart4 - Government vs Private
    const chart3 = {
      type: 'bar' as const,
      title: `${woreda.name} woreda report for teacher from GOVERNMENT school`,
      labels: [woreda.name],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    const chart4 = {
      type: 'bar' as const,
      title: `${woreda.name} woreda report for teacher from PRIVATE school`,
      labels: [woreda.name],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    let gTotal = 0,
      gMale = 0,
      gFemale = 0,
      pTotal = 0,
      pMale = 0,
      pFemale = 0;

    for (const school of woreda.schools) {
      if (school.school_type === 'government') {
        gTotal += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
        gMale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Male' } });
        gFemale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Female' } });
      } else {
        pTotal += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id } });
        pMale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Male' } });
        pFemale += await this.prisma.user.count({ where: { user_type: 'teacher', school_id: school.id, gender: 'Female' } });
      }
    }

    chart3.dataset[0].data.push(gTotal);
    chart3.dataset[1].data.push(gMale);
    chart3.dataset[2].data.push(gFemale);

    chart4.dataset[0].data.push(pTotal);
    chart4.dataset[1].data.push(pMale);
    chart4.dataset[2].data.push(pFemale);

    // For chart5, chart6, chart7, you can follow the same logic using Prisma count, groupBy, and include relations.

    return {
      title: `GENERAL STUDENT REPORT FOR ${woreda.name.toUpperCase()}`,
      charts: [chart1, chart2, chart3, chart4],
      subcitys: await this.prisma.subcity.findMany(),
      _subcity: woreda.subcity,
      _woreda: woreda,
      type: 'teacher',
    };
  }


  async getAllSchoolTeacherInformation(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        woreda: { include: { subcity: true } },
      },
    });

    if (!school) throw new NotFoundException('School not found');

    // Chart1 - Total teachers
    const tTeacher = await this.prisma.user.count({
      where: { user_type: 'teacher', school_id: school.id },
    });
    const tmTeacher = await this.prisma.user.count({
      where: { user_type: 'teacher', school_id: school.id, gender: 'Male' },
    });
    const tfTeacher = await this.prisma.user.count({
      where: { user_type: 'teacher', school_id: school.id, gender: 'Female' },
    });

    const chart1 = {
      type: 'doughnut' as const,
      title: `Total ${school.name} teacher report`,
      labels: ['Total', 'Male', 'Female'] as string[],
      data: [tTeacher, tmTeacher, tfTeacher] as number[],
      background_color: [this.getColor(), this.getColor(), this.getColor()],
    };

    // Chart5 - Teachers per year
    const firstTeacher = await this.prisma.user.findFirst({
      where: { user_type: 'teacher' },
      orderBy: { created_at: 'asc' },
    });
    const lastTeacher = await this.prisma.user.findFirst({
      where: { user_type: 'teacher' },
      orderBy: { created_at: 'desc' },
    });

    const startYear = firstTeacher ? new Date(firstTeacher.created_at).getFullYear() : 2023;
    const lastYear = lastTeacher ? new Date(lastTeacher.created_at).getFullYear() : 2023;

    const chart5 = {
      type: 'bar' as const,
      title: `${school.name} total teachers registered per years`,
      labels: [] as number[],
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (let year = startYear; year <= lastYear; year++) {
      chart5.labels.push(year);
      chart5.dataset[0].data.push(
        await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id, created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
        }),
      );
      chart5.dataset[1].data.push(
        await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id, gender: 'Male', created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
        }),
      );
      chart5.dataset[2].data.push(
        await this.prisma.user.count({
          where: { user_type: 'teacher', school_id: school.id, gender: 'Female', created_at: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
        }),
      );
    }

    // Chart6 - Teachers per grade
    const grades = await this.prisma.grade.findMany();
    const chart6 = {
      type: 'bar' as const,
      title: `${school.name} total teachers per grades`,
      labels: grades.map(g => g.name),
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const grade of grades) {
      const total = await this.prisma.teacherGradeCourse.count({
        where: { grade_id: grade.id, teacher: { school_id: school.id } },
      });
      const male = await this.prisma.teacherGradeCourse.count({
        where: { grade_id: grade.id, teacher: { school_id: school.id, gender: 'Male' } },
      });
      const female = await this.prisma.teacherGradeCourse.count({
        where: { grade_id: grade.id, teacher: { school_id: school.id, gender: 'Female' } },
      });

      chart6.dataset[0].data.push(total);
      chart6.dataset[1].data.push(male);
      chart6.dataset[2].data.push(female);
    }

    // Chart7 - Teachers per course
    const courses = await this.prisma.course.findMany();
    const chart7 = {
      type: 'bar' as const,
      title: `${school.name} total teachers per courses`,
      labels: courses.map(c => c.name),
      dataset: [
        { label: 'Total', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Male', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
        { label: 'Female', color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      ],
    };

    for (const course of courses) {
      const total = await this.prisma.teacherGradeCourse.count({
        where: { course_id: course.id, teacher: { school_id: school.id } },
      });
      const male = await this.prisma.teacherGradeCourse.count({
        where: { course_id: course.id, teacher: { school_id: school.id, gender: 'Male' } },
      });
      const female = await this.prisma.teacherGradeCourse.count({
        where: { course_id: course.id, teacher: { school_id: school.id, gender: 'Female' } },
      });

      chart7.dataset[0].data.push(total);
      chart7.dataset[1].data.push(male);
      chart7.dataset[2].data.push(female);
    }

    return {
      title: `GENERAL STUDENT REPORT FOR ${school.name.toUpperCase()}`,
      charts: [chart1, chart5, chart6, chart7],
      subcitys: await this.prisma.subcity.findMany(),
      _subcity: school.woreda.subcity,
      _woreda: school.woreda,
      _school: school,
      type: 'teacher',
    };
  }


  async getAllShaggarGeneralInformation() {
    const currentYear = new Date().getFullYear();

    const [
      totalStudents,
      totalTeachers,
      totalSubcities,
      totalWoredas,
      totalSchools,
      totalBooks,
      totalStudentDownloads,
      totalTeacherDownloads,
      totalStudentDownloadsThisYear,
      totalTeacherDownloadsThisYear,
      totalUserVisits,
      totalUserVisitsThisYear,
      subcities,
    ] = await Promise.all([
      this.prisma.user.count({ where: { user_type: 'student' } }),
      this.prisma.user.count({ where: { user_type: 'teacher' } }),
      this.prisma.subcity.count(),
      this.prisma.woreda.count(),
      this.prisma.school.count(),
      this.prisma.resource.count(),
      this.prisma.studentDownload.count(),
      this.prisma.teacherDownload.count(),
      this.prisma.studentDownload.count({ where: { year: currentYear } }),
      this.prisma.teacherDownload.count({ where: { year: currentYear } }),
      this.prisma.visitHistory.count(),
      this.prisma.visitHistory.count({
        where: {
          login_date: {
            gte: new Date(`${currentYear}-01-01`),
            lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      }),
      this.prisma.subcity.findMany(),
    ]);

    const data = {
      title: 'DIGITAL LIBRARY OVERALL REPORT FOR SHAGGAR CITY',
      dashboard: {
        data: [
          { title: 'Total student', count: totalStudents, link: "/city/dashboard?type='student'" },
          { title: 'Total teachers', count: totalTeachers, link: "/city/dashboard?type='teacher'" },
          { title: 'Total subcity', count: totalSubcities, link: "/city/dashboard?type='subcity'" },
          { title: 'Total woreda', count: totalWoredas, link: "/city/dashboard?type='woreda'" },
          { title: 'Total school', count: totalSchools, link: "/city/dashboard?type='school'" },
          { title: 'Total resource', count: totalBooks, link: "/city/dashboard?type='book'" },
          { title: 'Total download by student', count: totalStudentDownloads, link: "/city/dashboard?type='student_download'" },
          { title: 'Total download by teacher', count: totalTeacherDownloads, link: "/city/dashboard?type='teacher_download'" },
          { title: 'Total download by student this year', count: totalStudentDownloadsThisYear, link: "/city/dashboard?type='student_download'" },
          { title: 'Total download by teacher this year', count: totalTeacherDownloadsThisYear, link: "/city/dashboard?type='teacher_download'" },
          { title: 'Total user visit', count: totalUserVisits, link: "/city/dashboard#" },
          { title: 'Total user visit this year', count: totalUserVisitsThisYear, link: "/city/dashboard#" },
        ],
        class: ['success', 'primary', 'info', 'secondary', 'dark', 'warning', 'danger', 'light'],
      },
      subcities,
    };

    return data;
  }



  async getAllSubcityGeneralInformation(subcityId: string) {
  const subcity = await this.prisma.subcity.findUnique({
    where: { id: subcityId },
    include: {
      woredas: {
        include: {
          schools: {
            include: {
              users: true, // all users, filter in code
            },
          },
        },
      },
    },
  });

  if (!subcity) {
    throw new NotFoundException('Select valid subcity for displaying report!!');
  }

  let totalStudents = 0;
  let totalTeachers = 0;
  let totalSchools = 0;
  let totalStudentDownloads = 0;
  let totalTeacherDownloads = 0;
  let totalStudentDownloadsThisYear = 0;
  let totalTeacherDownloadsThisYear = 0;

  const currentYear = new Date().getFullYear();

  for (const woreda of subcity.woredas) {
    totalSchools += woreda.schools.length;

    for (const school of woreda.schools) {
      const students = school.users.filter(u => u.user_type === 'student');
      const teachers = school.users.filter(u => u.user_type === 'teacher');

      totalStudents += students.length;
      totalTeachers += teachers.length;

      // Count student downloads
      const studentPromises = students.map(student =>
        Promise.all([
          this.prisma.studentDownload.count({ where: { student_id: student.id } }),
          this.prisma.studentDownload.count({
            where: {
              student_id: student.id,
              created_at: {
                gte: new Date(`${currentYear}-01-01`),
                lt: new Date(`${currentYear + 1}-01-01`),
              },
            },
          }),
        ]).then(([all, thisYear]) => {
          totalStudentDownloads += all;
          totalStudentDownloadsThisYear += thisYear;
        })
      );

      // Count teacher downloads
      const teacherPromises = teachers.map(teacher =>
        Promise.all([
          this.prisma.teacherDownload.count({ where: { teacher_id: teacher.id } }),
          this.prisma.teacherDownload.count({
            where: {
              teacher_id: teacher.id,
              created_at: {
                gte: new Date(`${currentYear}-01-01`),
                lt: new Date(`${currentYear + 1}-01-01`),
              },
            },
          }),
        ]).then(([all, thisYear]) => {
          totalTeacherDownloads += all;
          totalTeacherDownloadsThisYear += thisYear;
        })
      );

      await Promise.all([...studentPromises, ...teacherPromises]);
    }
  }

  const [totalUserVisits, totalUserVisitsThisYear, subcities] = await Promise.all([
    this.prisma.visitHistory.count(),
    this.prisma.visitHistory.count({
      where: {
        login_date: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    }),
    this.prisma.subcity.findMany(),
  ]);

  const data = {
    title: `DIGITAL LIBRARY OVERALL REPORT FOR <span style='color:blue'>${subcity.name.toUpperCase()}</span>`,
    dashboard: {
      data: [
        { title: 'Total student', count: totalStudents, link: "/city/dashboard?type='student'" },
        { title: 'Total teachers', count: totalTeachers, link: "/city/dashboard?type='teacher'" },
        { title: 'Total woreda', count: subcity.woredas.length, link: "/city/dashboard?type='woreda'" },
        { title: 'Total school', count: totalSchools, link: "/city/dashboard?type='school'" },
        { title: 'Total download by student', count: totalStudentDownloads, link: "/city/dashboard?type='student_download'" },
        { title: 'Total download by teacher', count: totalTeacherDownloads, link: "/city/dashboard?type='teacher_download'" },
        { title: 'Total download by student this year', count: totalStudentDownloadsThisYear, link: "/city/dashboard?type='student_download'" },
        { title: 'Total download by teacher this year', count: totalTeacherDownloadsThisYear, link: "/city/dashboard?type='teacher_download'" },
      ],
      class: ['success','primary','info','secondary','dark','warning','danger','light'],
    },
    subcities,
    _subcity: subcity,
    totalUserVisits,
    totalUserVisitsThisYear,
  };

  return data;
}


async getAllWoredaGeneralInformation(woredaId: string) {
  const woreda = await this.prisma.woreda.findUnique({
    where: { id: woredaId },
    include: {
      schools: {
        include: {
          users: true, // all users; filter by type in code
        },
      },
      subcity: true, // to include subcity info
    },
  });

  if (!woreda) {
    throw new NotFoundException('Select valid woreda for displaying report!!');
  }

  let totalStudents = 0;
  let totalTeachers = 0;
  let totalSchools = woreda.schools.length;
  let totalStudentDownloads = 0;
  let totalTeacherDownloads = 0;
  let totalStudentDownloadsThisYear = 0;
  let totalTeacherDownloadsThisYear = 0;

  const currentYear = new Date().getFullYear();

  for (const school of woreda.schools) {
    const students = school.users.filter(u => u.user_type === 'student');
    const teachers = school.users.filter(u => u.user_type === 'teacher');

    totalStudents += students.length;
    totalTeachers += teachers.length;

    const studentPromises = students.map(student =>
      Promise.all([
        this.prisma.studentDownload.count({ where: { student_id: student.id } }),
        this.prisma.studentDownload.count({
          where: {
            student_id: student.id,
            created_at: {
              gte: new Date(`${currentYear}-01-01`),
              lt: new Date(`${currentYear + 1}-01-01`),
            },
          },
        }),
      ]).then(([all, thisYear]) => {
        totalStudentDownloads += all;
        totalStudentDownloadsThisYear += thisYear;
      })
    );

    const teacherPromises = teachers.map(teacher =>
      Promise.all([
        this.prisma.teacherDownload.count({ where: { teacher_id: teacher.id } }),
        this.prisma.teacherDownload.count({
          where: {
            teacher_id: teacher.id,
            created_at: {
              gte: new Date(`${currentYear}-01-01`),
              lt: new Date(`${currentYear + 1}-01-01`),
            },
          },
        }),
      ]).then(([all, thisYear]) => {
        totalTeacherDownloads += all;
        totalTeacherDownloadsThisYear += thisYear;
      })
    );

    await Promise.all([...studentPromises, ...teacherPromises]);
  }

  const [totalUserVisits, totalUserVisitsThisYear, subcities] = await Promise.all([
    this.prisma.visitHistory.count(),
    this.prisma.visitHistory.count({
      where: {
        login_date: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    }),
    this.prisma.subcity.findMany(),
  ]);

  const data = {
    title: `DIGITAL LIBRARY OVERALL REPORT FOR <span style='color:blue'>${woreda.name.toUpperCase()}</span>`,
    dashboard: {
      data: [
        { title: 'Total student', count: totalStudents, link: "/city/dashboard?type='student'" },
        { title: 'Total teachers', count: totalTeachers, link: "/city/dashboard?type='teacher'" },
        { title: 'Total school', count: totalSchools, link: "/city/dashboard?type='school'" },
        { title: 'Total download by student', count: totalStudentDownloads, link: "/city/dashboard?type='student_download'" },
        { title: 'Total download by teacher', count: totalTeacherDownloads, link: "/city/dashboard?type='teacher_download'" },
        { title: 'Total download by student this year', count: totalStudentDownloadsThisYear, link: "/city/dashboard?type='student_download'" },
        { title: 'Total download by teacher this year', count: totalTeacherDownloadsThisYear, link: "/city/dashboard?type='teacher_download'" },
      ],
      class: ['success','primary','info','secondary','dark','warning','danger','light'],
    },
    subcities,
    _subcity: woreda.subcity,
    _woreda: woreda,
    totalUserVisits,
    totalUserVisitsThisYear,
  };

  return data; // You can return JSON or render it in a template if using a view engine
}



async getAllSchoolGeneralInformation(schoolId: string) {
  const school = await this.prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      users: true, // all users, filter by user_type
      woreda: { include: { subcity: true } }, // for _woreda and _subcity info
    },
  });

  if (!school) {
    throw new NotFoundException('Select valid school for displaying report!!');
  }

  let totalStudents = 0;
  let totalTeachers = 0;
  let totalStudentDownloads = 0;
  let totalTeacherDownloads = 0;
  let totalStudentDownloadsThisYear = 0;
  let totalTeacherDownloadsThisYear = 0;

  const currentYear = new Date().getFullYear();

  const students = school.users.filter(u => u.user_type === 'student');
  const teachers = school.users.filter(u => u.user_type === 'teacher');

  totalStudents = students.length;
  totalTeachers = teachers.length;

  const studentPromises = students.map(student =>
    Promise.all([
      this.prisma.studentDownload.count({ where: { student_id: student.id } }),
      this.prisma.studentDownload.count({
        where: {
          student_id: student.id,
          created_at: {
            gte: new Date(`${currentYear}-01-01`),
            lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      }),
    ]).then(([all, thisYear]) => {
      totalStudentDownloads += all;
      totalStudentDownloadsThisYear += thisYear;
    })
  );

  const teacherPromises = teachers.map(teacher =>
    Promise.all([
      this.prisma.teacherDownload.count({ where: { teacher_id: teacher.id } }),
      this.prisma.teacherDownload.count({
        where: {
          teacher_id: teacher.id,
          created_at: {
            gte: new Date(`${currentYear}-01-01`),
            lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      }),
    ]).then(([all, thisYear]) => {
      totalTeacherDownloads += all;
      totalTeacherDownloadsThisYear += thisYear;
    })
  );

  await Promise.all([...studentPromises, ...teacherPromises]);

  const [totalUserVisits, totalUserVisitsThisYear, subcities] = await Promise.all([
    this.prisma.visitHistory.count(),
    this.prisma.visitHistory.count({
      where: {
        login_date: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    }),
    this.prisma.subcity.findMany(),
  ]);

  const data = {
    title: `DIGITAL LIBRARY OVERALL REPORT FOR <span style='color:blue'>${school.name.toUpperCase()}</span>`,
    dashboard: {
      data: [
        { title: 'Total student', count: totalStudents, link: "/city/dashboard?type='student'" },
        { title: 'Total teachers', count: totalTeachers, link: "/city/dashboard?type='teacher'" },
        { title: 'Total download by student', count: totalStudentDownloads, link: "/city/dashboard?type='student_download'" },
        { title: 'Total download by teacher', count: totalTeacherDownloads, link: "/city/dashboard?type='teacher_download'" },
        { title: 'Total download by student this year', count: totalStudentDownloadsThisYear, link: "/city/dashboard?type='student_download'" },
        { title: 'Total download by teacher this year', count: totalTeacherDownloadsThisYear, link: "/city/dashboard?type='teacher_download'" },
      ],
      class: ['success','primary','info','secondary','dark','warning','danger','light'],
    },
    subcities,
    _subcity: school.woreda.subcity,
    _woreda: school.woreda,
    _school: school,
    totalUserVisits,
    totalUserVisitsThisYear,
  };

  return data; // return JSON or pass to a template if using a view engine
}



async getAllShaggarStudentDownloadInformation() {
  const subcities = await this.prisma.subcity.findMany({
    include: {
      woredas: {
        include: {
          schools: {
            include: {
              users: true, // all students/teachers
            },
          },
        },
      },
    },
  });

  const getColor = (): string => {
    const colors = ['#007bff','#28a745','#dc3545','#ffc107','#17a2b8','#6c757d','#fd7e14','#6610f2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Helper type for charts
  type Chart = {
    type: string;
    title: string;
    labels: string[];
    dataset: { label: string; color: string; pointColor: string; data: number[] }[];
  };

  const chart2: Chart = {
    type: 'bar',
    title: 'Total subcitys student download',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart3: Chart = {
    type: 'bar',
    title: "Report for student download from <ins style='font-weight:bolder'>GOVERNMENT</ins> school",
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart4: Chart = {
    type: 'bar',
    title: "Report for student from <ins style='font-weight:bolder'>PRIVATE</ins> school",
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart5: Chart = {
    type: 'bar',
    title: 'Total student download per years',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart6: Chart = {
    type: 'bar',
    title: 'Total student download per grades',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart7: Chart = {
    type: 'bar',
    title: 'Total student download per courses',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  // Helper: Count downloads for a school
  const countStudentDownloads = async (schoolId: string, gender?: 'Male' | 'Female') => {
    const whereClause: any = { student: { school_id: schoolId } };
    if (gender) whereClause.student.gender = gender;
    return this.prisma.studentDownload.count({ where: whereClause });
  };

  // Fill chart2, chart3, chart4
  for (const subcity of subcities) {
    let total = 0, totalMale = 0, totalFemale = 0;
    let govTotal = 0, govMale = 0, govFemale = 0;
    let privTotal = 0, privMale = 0, privFemale = 0;

    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        const t = await countStudentDownloads(school.id);
        const m = await countStudentDownloads(school.id, 'Male');
        const f = await countStudentDownloads(school.id, 'Female');

        total += t;
        totalMale += m;
        totalFemale += f;

        if (school.school_type === 'government') {
          govTotal += t;
          govMale += m;
          govFemale += f;
        } else {
          privTotal += t;
          privMale += m;
          privFemale += f;
        }
      }
    }

    chart2.labels.push(subcity.name);
    chart2.dataset[0].data.push(total);
    chart2.dataset[1].data.push(totalMale);
    chart2.dataset[2].data.push(totalFemale);

    chart3.labels.push(subcity.name);
    chart3.dataset[0].data.push(govTotal);
    chart3.dataset[1].data.push(govMale);
    chart3.dataset[2].data.push(govFemale);

    chart4.labels.push(subcity.name);
    chart4.dataset[0].data.push(privTotal);
    chart4.dataset[1].data.push(privMale);
    chart4.dataset[2].data.push(privFemale);
  }

  // Chart5: per year
  const firstStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'asc' } });
  const lastStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'desc' } });
  const startYear = firstStudent ? firstStudent.year : 2023;
  const lastYear = lastStudent ? lastStudent.year : 2023;

  for (let year = startYear; year <= lastYear; year++) {
    chart5.labels.push(year.toString());
    chart5.dataset[0].data.push(await this.prisma.studentDownload.count({ where: { year } }));
    chart5.dataset[1].data.push(await this.prisma.studentDownload.count({ where: { year, student: { gender: 'Male' } } }));
    chart5.dataset[2].data.push(await this.prisma.studentDownload.count({ where: { year, student: { gender: 'Female' } } }));
  }

  // Chart6: per grade
  const grades = await this.prisma.grade.findMany();
  for (const grade of grades) {
    chart6.labels.push(grade.name);
    chart6.dataset[0].data.push(await this.prisma.studentDownload.count({ where: { resource: { grade_id: grade.id } } }));
    chart6.dataset[1].data.push(await this.prisma.studentDownload.count({ where: { resource: { grade_id: grade.id }, student: { gender: 'Male' } } }));
    chart6.dataset[2].data.push(await this.prisma.studentDownload.count({ where: { resource: { grade_id: grade.id }, student: { gender: 'Female' } } }));
  }

  // Chart7: per course
  const courses = await this.prisma.course.findMany();
  for (const course of courses) {
    chart7.labels.push(course.name);
    chart7.dataset[0].data.push(await this.prisma.studentDownload.count({ where: { resource: { course_id: course.id } } }));
    chart7.dataset[1].data.push(await this.prisma.studentDownload.count({ where: { resource: { course_id: course.id }, student: { gender: 'Male' } } }));
    chart7.dataset[2].data.push(await this.prisma.studentDownload.count({ where: { resource: { course_id: course.id }, student: { gender: 'Female' } } }));
  }

  const data = {
    title: 'GENERAL STUDENT REPORT FOR SHAGGAR CITY',
    charts: {
      data: [chart2, chart3, chart4, chart5, chart6, chart7],
      class: ['success','primary','info','secondary','dark','warning','danger','light'],
    },
    subcities,
  };

  const type = 'student_download';
  return { data, type }; // Return JSON; can render in a template in your controller
}



async getAllSubcityStudentDownloadInformation(subcityId: string) {
  const subcity = await this.prisma.subcity.findUnique({
    where: { id: subcityId },
    include: {
      woredas: {
        include: {
          schools: true,
        },
      },
    },
  });

  if (!subcity) return { data: null, type: 'student_download' };

  const getColor = (): string => {
    const colors = ['#007bff','#28a745','#dc3545','#ffc107','#17a2b8','#6c757d','#fd7e14','#6610f2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  type Chart = {
    type: string;
    title: string;
    labels: string[];
    dataset: { label: string; color: string; pointColor: string; data: number[] }[];
  };

  const chart2: Chart = {
    type: 'bar',
    title: 'Total woredas student download',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart3: Chart = {
    type: 'bar',
    title: "Report for student download from GOVERNMENT school",
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart4: Chart = {
    type: 'bar',
    title: "Report for student download from PRIVATE school",
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart5: Chart = {
    type: 'bar',
    title: 'Total student download per years',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart6: Chart = {
    type: 'bar',
    title: 'Total student download per grades',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const chart7: Chart = {
    type: 'bar',
    title: 'Total student download per courses',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  // Helper to count downloads for a school with optional gender
  const countStudentDownloads = async (schoolId: string, year?: number, gender?: 'Male' | 'Female', gradeId?: string, courseId?: string) => {
    const where: any = { student: { school_id: schoolId } };
    if (year) where.year = year;
    if (gender) where.student.gender = gender;
    if (gradeId) where.book = { grade_id: gradeId };
    if (courseId) where.book = { course_id: courseId };
    return this.prisma.studentDownload.count({ where });
  };

  // Fill chart2, chart3, chart4
  for (const woreda of subcity.woredas) {
    let total = 0, totalMale = 0, totalFemale = 0;
    let govTotal = 0, govMale = 0, govFemale = 0;
    let privTotal = 0, privMale = 0, privFemale = 0;

    for (const school of woreda.schools) {
      const t = await countStudentDownloads(school.id);
      const m = await countStudentDownloads(school.id, undefined, 'Male');
      const f = await countStudentDownloads(school.id, undefined, 'Female');

      total += t;
      totalMale += m;
      totalFemale += f;

      if (school.school_type === 'government') {
        govTotal += t;
        govMale += m;
        govFemale += f;
      } else {
        privTotal += t;
        privMale += m;
        privFemale += f;
      }
    }

    chart2.labels.push(woreda.name);
    chart2.dataset[0].data.push(total);
    chart2.dataset[1].data.push(totalMale);
    chart2.dataset[2].data.push(totalFemale);

    chart3.labels.push(woreda.name);
    chart3.dataset[0].data.push(govTotal);
    chart3.dataset[1].data.push(govMale);
    chart3.dataset[2].data.push(govFemale);

    chart4.labels.push(woreda.name);
    chart4.dataset[0].data.push(privTotal);
    chart4.dataset[1].data.push(privMale);
    chart4.dataset[2].data.push(privFemale);
  }

  // Chart5: per year
  const firstStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'asc' } });
  const lastStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'desc' } });
  const startYear = firstStudent?.year ?? 2023;
  const lastYear = lastStudent?.year ?? 2023;

  for (let year = startYear; year <= lastYear; year++) {
    chart5.labels.push(year.toString());
    chart5.dataset[0].data.push(await countStudentDownloads('', year));
    chart5.dataset[1].data.push(await countStudentDownloads('', year, 'Male'));
    chart5.dataset[2].data.push(await countStudentDownloads('', year, 'Female'));
  }

  // Chart6: per grade
  const grades = await this.prisma.grade.findMany();
  for (const grade of grades) {
    chart6.labels.push(grade.name);
    chart6.dataset[0].data.push(await countStudentDownloads('', undefined, undefined, grade.id));
    chart6.dataset[1].data.push(await countStudentDownloads('', undefined, 'Male', grade.id));
    chart6.dataset[2].data.push(await countStudentDownloads('', undefined, 'Female', grade.id));
  }

  // Chart7: per course
  const courses = await this.prisma.course.findMany();
  for (const course of courses) {
    chart7.labels.push(course.name);
    chart7.dataset[0].data.push(await countStudentDownloads('', undefined, undefined, undefined, course.id));
    chart7.dataset[1].data.push(await countStudentDownloads('', undefined, 'Male', undefined, course.id));
    chart7.dataset[2].data.push(await countStudentDownloads('', undefined, 'Female', undefined, course.id));
  }

  const data = {
    title: `GENERAL STUDENT DOWNLOAD REPORT FOR ${subcity.name.toUpperCase()} SUBCITY`,
    charts: {
      data: [chart2, chart3, chart4, chart5, chart6, chart7],
      class: ['success','primary','info','secondary','dark','warning','danger','light'],
    },
    subcities: await this.prisma.subcity.findMany(),
    _subcity: subcity,
  };

  const type = 'student_download';
  return { data, type };
}



async getAllWoredaStudentDownloadInformation(woredaId: string) {
  const woreda = await this.prisma.woreda.findUnique({
    where: { id: woredaId },
    include: {
      schools: true,
      subcity: true,
    },
  });

  if (!woreda) return { data: null, type: 'student_download' };

  const getColor = (): string => {
    const colors = ['#007bff','#28a745','#dc3545','#ffc107','#17a2b8','#6c757d','#fd7e14','#6610f2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  type Chart = {
    type: string;
    title: string;
    labels: string[];
    dataset: { label: string; color: string; pointColor: string; data: number[] }[];
  };

  const createEmptyChart = (title: string): Chart => ({
    type: 'bar',
    title,
    labels: [],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] },
    ],
  });

  const chart2 = createEmptyChart('Total schools student download');
  const chart3 = createEmptyChart('Report for student download from GOVERNMENT school');
  const chart4 = createEmptyChart('Report for student from PRIVATE school');
  const chart5 = createEmptyChart('Total student download per years');
  const chart6 = createEmptyChart('Total student download per grades');
  const chart7 = createEmptyChart('Total student download per courses');

  // Helper to count downloads for a school with optional filters
  const countStudentDownloads = async (
    schoolId: string,
    year?: number,
    gender?: 'Male' | 'Female',
    gradeId?: string,
    courseId?: string
  ) => {
    const where: any = { student: { school_id: schoolId } };
    if (year) where.year = year;
    if (gender) where.student.gender = gender;
    if (gradeId) where.book = { grade_id: gradeId };
    if (courseId) where.book = { course_id: courseId };
    return this.prisma.studentDownload.count({ where });
  };

  // Fill chart2, chart3, chart4
  for (const school of woreda.schools) {
    const total = await countStudentDownloads(school.id);
    const totalMale = await countStudentDownloads(school.id, undefined, 'Male');
    const totalFemale = await countStudentDownloads(school.id, undefined, 'Female');

    chart2.labels.push(school.name);
    chart2.dataset[0].data.push(total);
    chart2.dataset[1].data.push(totalMale);
    chart2.dataset[2].data.push(totalFemale);

    if (school.school_type === 'government') {
      chart3.labels.push(woreda.name);
      chart3.dataset[0].data.push(total);
      chart3.dataset[1].data.push(totalMale);
      chart3.dataset[2].data.push(totalFemale);
    } else {
      chart4.labels.push(woreda.name);
      chart4.dataset[0].data.push(total);
      chart4.dataset[1].data.push(totalMale);
      chart4.dataset[2].data.push(totalFemale);
    }
  }

  // Chart5: per year
  const firstStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'asc' } });
  const lastStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'desc' } });
  const startYear = firstStudent?.year ?? 2023;
  const lastYear = lastStudent?.year ?? 2023;

  for (let year = startYear; year <= lastYear; year++) {
    const total = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, year)));
    const totalMale = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, year, 'Male')));
    const totalFemale = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, year, 'Female')));

    chart5.labels.push(year.toString());
    chart5.dataset[0].data.push(total.reduce((a, b) => a + b, 0));
    chart5.dataset[1].data.push(totalMale.reduce((a, b) => a + b, 0));
    chart5.dataset[2].data.push(totalFemale.reduce((a, b) => a + b, 0));
  }

  // Chart6: per grade
  const grades = await this.prisma.grade.findMany();
  for (const grade of grades) {
    const total = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, undefined, undefined, grade.id)));
    const totalMale = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, undefined, 'Male', grade.id)));
    const totalFemale = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, undefined, 'Female', grade.id)));

    chart6.labels.push(grade.name);
    chart6.dataset[0].data.push(total.reduce((a, b) => a + b, 0));
    chart6.dataset[1].data.push(totalMale.reduce((a, b) => a + b, 0));
    chart6.dataset[2].data.push(totalFemale.reduce((a, b) => a + b, 0));
  }

  // Chart7: per course
  const courses = await this.prisma.course.findMany();
  for (const course of courses) {
    const total = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, undefined, undefined, undefined, course.id)));
    const totalMale = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, undefined, 'Male', undefined, course.id)));
    const totalFemale = await Promise.all(woreda.schools.map(school => countStudentDownloads(school.id, undefined, 'Female', undefined, course.id)));

    chart7.labels.push(course.name);
    chart7.dataset[0].data.push(total.reduce((a, b) => a + b, 0));
    chart7.dataset[1].data.push(totalMale.reduce((a, b) => a + b, 0));
    chart7.dataset[2].data.push(totalFemale.reduce((a, b) => a + b, 0));
  }

  const data = {
    title: `GENERAL STUDENT DOWNLOAD REPORT FOR ${woreda.name.toUpperCase()} Woreda`,
    charts: {
      data: [chart2, chart3, chart4, chart5, chart6, chart7],
      class: ['success','primary','info','secondary','dark','warning','danger','light'],
    },
    subcities: await this.prisma.subcity.findMany(),
    _subcity: woreda.subcity,
    _woreda: woreda,
  };

  return { data, type: 'student_download' };
}



async getAllSchoolStudentDownloadInformation(schoolId: string) {
  const school = await this.prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      woreda: {
        include: { subcity: true },
      },
    },
  });

  if (!school) return { data: null, type: 'student_download' };

  const getColor = (): string => {
    const colors = ['#007bff','#28a745','#dc3545','#ffc107','#17a2b8','#6c757d','#fd7e14','#6610f2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  type Chart = {
    type: string;
    title: string;
    labels?: string[];
    dataset?: { label: string; color: string; pointColor: string; data: number[] }[];
    data?: number[];
    background_color?: string[];
  };

  const countStudentDownloads = async (
    filters: {
      year?: number;
      gender?: 'Male' | 'Female';
      gradeId?: string;
      courseId?: string;
    } = {}
  ) => {
    const where: any = { student: { school_id: school.id } };
    if (filters.year) where.year = filters.year;
    if (filters.gender) where.student.gender = filters.gender;
    if (filters.gradeId) where.book = { grade_id: filters.gradeId };
    if (filters.courseId) where.book = { course_id: filters.courseId };
    return this.prisma.studentDownload.count({ where });
  };

  // Chart 1: Doughnut
  const total = await countStudentDownloads();
  const totalMale = await countStudentDownloads({ gender: 'Male' });
  const totalFemale = await countStudentDownloads({ gender: 'Female' });

  const chart1: Chart = {
    type: 'doughnut',
    title: `Total ${school.name} student download report`,
    labels: ['Total', 'Male', 'Female'],
    data: [total, totalMale, totalFemale],
    background_color: [getColor(), getColor(), getColor()],
  };

  // Chart 5: per year
  const chart5: Chart = {
    type: 'bar',
    title: 'Total student download per years',
    labels: [],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] },
    ],
  };

  const firstStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'asc' } });
  const lastStudent = await this.prisma.studentDownload.findFirst({ orderBy: { year: 'desc' } });
  const startYear = firstStudent?.year ?? 2023;
  const lastYear = lastStudent?.year ?? 2023;

  for (let year = startYear; year <= lastYear; year++) {
    const totalYear = await countStudentDownloads({ year });
    const totalMaleYear = await countStudentDownloads({ year, gender: 'Male' });
    const totalFemaleYear = await countStudentDownloads({ year, gender: 'Female' });

    chart5.labels!.push(year.toString());
    chart5.dataset![0].data.push(totalYear);
    chart5.dataset![1].data.push(totalMaleYear);
    chart5.dataset![2].data.push(totalFemaleYear);
  }

  // Chart 6: per grade
  const chart6: Chart = {
    type: 'bar',
    title: 'Total student download per grades',
    labels: [],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] },
    ],
  };

  const grades = await this.prisma.grade.findMany();
  for (const grade of grades) {
    const totalGrade = await countStudentDownloads({ gradeId: grade.id });
    const totalMaleGrade = await countStudentDownloads({ gradeId: grade.id, gender: 'Male' });
    const totalFemaleGrade = await countStudentDownloads({ gradeId: grade.id, gender: 'Female' });

    chart6.labels!.push(grade.name);
    chart6.dataset![0].data.push(totalGrade);
    chart6.dataset![1].data.push(totalMaleGrade);
    chart6.dataset![2].data.push(totalFemaleGrade);
  }

  // Chart 7: per course
  const chart7: Chart = {
    type: 'bar',
    title: 'Total student download per courses',
    labels: [],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] },
    ],
  };

  const courses = await this.prisma.course.findMany();
  for (const course of courses) {
    const totalCourse = await countStudentDownloads({ courseId: course.id });
    const totalMaleCourse = await countStudentDownloads({ courseId: course.id, gender: 'Male' });
    const totalFemaleCourse = await countStudentDownloads({ courseId: course.id, gender: 'Female' });

    chart7.labels!.push(course.name);
    chart7.dataset![0].data.push(totalCourse);
    chart7.dataset![1].data.push(totalMaleCourse);
    chart7.dataset![2].data.push(totalFemaleCourse);
  }

  const data = {
    title: `GENERAL STUDENT DOWNLOAD REPORT FOR ${school.name.toUpperCase()}`,
    charts: {
      data: [chart1, chart5, chart6, chart7],
      class: ['success','primary','info','secondary','dark','warning','danger','light'],
    },
    subcities: await this.prisma.subcity.findMany(),
    _subcity: school.woreda.subcity,
    _woreda: school.woreda,
    _school: school,
  };

  return { data, type: 'student_download' };
}




async getAllShaggarTeacherDownloadInformation() {
  const subcities = await this.prisma.subcity.findMany({
    include: {
      woredas: {
        include: {
          schools: true,
        },
      },
    },
  });

  const getColor = (): string => {
    const colors = ['#007bff','#28a745','#dc3545','#ffc107','#17a2b8','#6c757d','#fd7e14','#6610f2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  type Chart = {
    type: string;
    title: string;
    labels?: string[];
    dataset?: { label: string; color: string; pointColor: string; data: number[] }[];
  };

  const countTeacherDownloads = async (filters: {
    schoolId?: string;
    gender?: 'Male' | 'Female';
    year?: number;
    gradeId?: string;
    courseId?: string;
  } = {}) => {
    const where: any = {};
    if (filters.year) where.year = filters.year;
    if (filters.schoolId) where.teacher = { school_id: filters.schoolId };
    if (filters.gender) where.teacher = { ...where.teacher, gender: filters.gender };
    if (filters.gradeId) where.book = { grade_id: filters.gradeId };
    if (filters.courseId) where.book = { course_id: filters.courseId };
    return this.prisma.teacherDownload.count({ where });
  };

  // Chart 2: Total subcities teacher download
  const chart2: Chart = {
    type: 'bar',
    title: 'Total subcitys teacher download',
    labels: [],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] },
    ],
  };

  for (const subcity of subcities) {
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        total += await countTeacherDownloads({ schoolId: school.id });
        totalMale += await countTeacherDownloads({ schoolId: school.id, gender: 'Male' });
        totalFemale += await countTeacherDownloads({ schoolId: school.id, gender: 'Female' });
      }
    }
    chart2.labels!.push(subcity.name);
    chart2.dataset![0].data.push(total);
    chart2.dataset![1].data.push(totalMale);
    chart2.dataset![2].data.push(totalFemale);
  }

  // Charts 3 & 4: Government vs Private
  const chart3: Chart = { type: 'bar', title: 'Report for teacher download from GOVERNMENT school', labels: [], dataset: [ { label: 'Total', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Male', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Female', color: getColor(), pointColor: getColor(), data: [] } ] };
  const chart4: Chart = { type: 'bar', title: 'Report for teacher from PRIVATE school', labels: [], dataset: [ { label: 'Total', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Male', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Female', color: getColor(), pointColor: getColor(), data: [] } ] };

  for (const subcity of subcities) {
    let g_total = 0, g_totalMale = 0, g_totalFemale = 0;
    let p_total = 0, p_totalMale = 0, p_totalFemale = 0;
    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        if (school.school_type === 'government') {
          g_total += await countTeacherDownloads({ schoolId: school.id });
          g_totalMale += await countTeacherDownloads({ schoolId: school.id, gender: 'Male' });
          g_totalFemale += await countTeacherDownloads({ schoolId: school.id, gender: 'Female' });
        } else {
          p_total += await countTeacherDownloads({ schoolId: school.id });
          p_totalMale += await countTeacherDownloads({ schoolId: school.id, gender: 'Male' });
          p_totalFemale += await countTeacherDownloads({ schoolId: school.id, gender: 'Female' });
        }
      }
    }
    chart3.labels!.push(subcity.name);
    chart3.dataset![0].data.push(g_total);
    chart3.dataset![1].data.push(g_totalMale);
    chart3.dataset![2].data.push(g_totalFemale);

    chart4.labels!.push(subcity.name);
    chart4.dataset![0].data.push(p_total);
    chart4.dataset![1].data.push(p_totalMale);
    chart4.dataset![2].data.push(p_totalFemale);
  }

  // Chart 5: per year
  const chart5: Chart = { type: 'bar', title: 'Total teacher download per years', labels: [], dataset: [ { label: 'Total', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Male', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Female', color: getColor(), pointColor: getColor(), data: [] } ] };

  const firstTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: 'asc' } });
  const lastTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: 'desc' } });
  const startYear = firstTeacher?.year ?? 2023;
  const lastYear = lastTeacher?.year ?? 2023;

  for (let year = startYear; year <= lastYear; year++) {
    chart5.labels!.push(year.toString());
    chart5.dataset![0].data.push(await countTeacherDownloads({ year }));
    chart5.dataset![1].data.push(await countTeacherDownloads({ year, gender: 'Male' }));
    chart5.dataset![2].data.push(await countTeacherDownloads({ year, gender: 'Female' }));
  }

  // Chart 6: per grade
  const chart6: Chart = { type: 'bar', title: 'Total teacher download per grades', labels: [], dataset: [ { label: 'Total', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Male', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Female', color: getColor(), pointColor: getColor(), data: [] } ] };
  const grades = await this.prisma.grade.findMany();
  for (const grade of grades) {
    chart6.labels!.push(grade.name);
    chart6.dataset![0].data.push(await countTeacherDownloads({ gradeId: grade.id }));
    chart6.dataset![1].data.push(await countTeacherDownloads({ gradeId: grade.id, gender: 'Male' }));
    chart6.dataset![2].data.push(await countTeacherDownloads({ gradeId: grade.id, gender: 'Female' }));
  }

  // Chart 7: per course
  const chart7: Chart = { type: 'bar', title: 'Total teacher download per courses', labels: [], dataset: [ { label: 'Total', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Male', color: getColor(), pointColor: getColor(), data: [] }, { label: 'Female', color: getColor(), pointColor: getColor(), data: [] } ] };
  const courses = await this.prisma.course.findMany();
  for (const course of courses) {
    chart7.labels!.push(course.name);
    chart7.dataset![0].data.push(await countTeacherDownloads({ courseId: course.id }));
    chart7.dataset![1].data.push(await countTeacherDownloads({ courseId: course.id, gender: 'Male' }));
    chart7.dataset![2].data.push(await countTeacherDownloads({ courseId: course.id, gender: 'Female' }));
  }

  const data = {
    title: 'GENERAL TEACHER REPORT FOR SHAGGAR CITY',
    charts: { data: [chart2, chart3, chart4, chart5, chart6, chart7], class: ['success','primary','info','secondary','dark','warning','danger','light'] },
    subcities,
  };

  return { data, type: 'teacher_download' };
}




async getAllSubcityTeacherDownloadInformation(subcityId: string) {
  const subcity = await this.prisma.subcity.findUnique({
    where: { id: subcityId },
    include: {
      woredas: { include: { schools: true } },
    },
  });

  if (!subcity) return null;

  const getColor = (): string => {
    const colors = ['#007bff','#28a745','#dc3545','#ffc107','#17a2b8','#6c757d','#fd7e14','#6610f2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const countTeacherDownloads = async (filters: {
    schoolId?: string;
    gender?: 'Male' | 'Female';
    year?: number;
    gradeId?: string;
    courseId?: string;
  } = {}) => {
    const where: any = {};
    if (filters.year) where.year = filters.year;
    if (filters.schoolId) where.teacher = { school_id: filters.schoolId };
    if (filters.gender) where.teacher = { ...where.teacher, gender: filters.gender };
    if (filters.gradeId) where.book = { grade_id: filters.gradeId };
    if (filters.courseId) where.book = { course_id: filters.courseId };
    return this.prisma.teacherDownload.count({ where });
  };

  // Chart 2: Woreda teacher download
  const chart2 = {
    type: 'bar',
    title: 'Total woredas teacher download',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  for (const woreda of subcity.woredas) {
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const school of woreda.schools) {
      total += await countTeacherDownloads({ schoolId: school.id });
      totalMale += await countTeacherDownloads({ schoolId: school.id, gender: 'Male' });
      totalFemale += await countTeacherDownloads({ schoolId: school.id, gender: 'Female' });
    }
    chart2.labels.push(woreda.name);
    chart2.dataset[0].data.push(total);
    chart2.dataset[1].data.push(totalMale);
    chart2.dataset[2].data.push(totalFemale);
  }

  // Charts 3 & 4: Government vs Private
  const chart3 = {
    type: 'bar',
    title: 'Report for teacher download from GOVERNMENT school',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };
  const chart4 = {
    type: 'bar',
    title: 'Report for teacher from PRIVATE school',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  for (const woreda of subcity.woredas) {
    let g_total = 0, g_totalMale = 0, g_totalFemale = 0;
    let p_total = 0, p_totalMale = 0, p_totalFemale = 0;
    for (const school of woreda.schools) {
      if (school.school_type === 'government') {
        g_total += await countTeacherDownloads({ schoolId: school.id });
        g_totalMale += await countTeacherDownloads({ schoolId: school.id, gender: 'Male' });
        g_totalFemale += await countTeacherDownloads({ schoolId: school.id, gender: 'Female' });
      } else {
        p_total += await countTeacherDownloads({ schoolId: school.id });
        p_totalMale += await countTeacherDownloads({ schoolId: school.id, gender: 'Male' });
        p_totalFemale += await countTeacherDownloads({ schoolId: school.id, gender: 'Female' });
      }
    }
    chart3.labels.push(woreda.name);
    chart3.dataset[0].data.push(g_total);
    chart3.dataset[1].data.push(g_totalMale);
    chart3.dataset[2].data.push(g_totalFemale);

    chart4.labels.push(woreda.name);
    chart4.dataset[0].data.push(p_total);
    chart4.dataset[1].data.push(p_totalMale);
    chart4.dataset[2].data.push(p_totalFemale);
  }

  // Chart 5: per year
  const chart5 = {
    type: 'bar',
    title: 'Total teacher download per years',
    labels: [] as string[],
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  const firstTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: 'asc' } });
  const lastTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: 'desc' } });
  const startYear = firstTeacher?.year ?? 2023;
  const lastYear = lastTeacher?.year ?? 2023;

  for (let year = startYear; year <= lastYear; year++) {
    chart5.labels.push(year.toString());
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        total += await countTeacherDownloads({ schoolId: school.id, year });
        totalMale += await countTeacherDownloads({ schoolId: school.id, year, gender: 'Male' });
        totalFemale += await countTeacherDownloads({ schoolId: school.id, year, gender: 'Female' });
      }
    }
    chart5.dataset[0].data.push(total);
    chart5.dataset[1].data.push(totalMale);
    chart5.dataset[2].data.push(totalFemale);
  }

  // Chart 6: per grade
  const grades = await this.prisma.grade.findMany();
  const chart6 = {
    type: 'bar',
    title: 'Total teacher download per grades',
    labels: grades.map(g => g.name),
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  for (const grade of grades) {
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        total += await countTeacherDownloads({ schoolId: school.id, gradeId: grade.id });
        totalMale += await countTeacherDownloads({ schoolId: school.id, gradeId: grade.id, gender: 'Male' });
        totalFemale += await countTeacherDownloads({ schoolId: school.id, gradeId: grade.id, gender: 'Female' });
      }
    }
    chart6.dataset[0].data.push(total);
    chart6.dataset[1].data.push(totalMale);
    chart6.dataset[2].data.push(totalFemale);
  }

  // Chart 7: per course
  const courses = await this.prisma.course.findMany();
  const chart7 = {
    type: 'bar',
    title: 'Total teacher download per courses',
    labels: courses.map(c => c.name),
    dataset: [
      { label: 'Total', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Male', color: getColor(), pointColor: getColor(), data: [] as number[] },
      { label: 'Female', color: getColor(), pointColor: getColor(), data: [] as number[] },
    ],
  };

  for (const course of courses) {
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const woreda of subcity.woredas) {
      for (const school of woreda.schools) {
        total += await countTeacherDownloads({ schoolId: school.id, courseId: course.id });
        totalMale += await countTeacherDownloads({ schoolId: school.id, courseId: course.id, gender: 'Male' });
        totalFemale += await countTeacherDownloads({ schoolId: school.id, courseId: course.id, gender: 'Female' });
      }
    }
    chart7.dataset[0].data.push(total);
    chart7.dataset[1].data.push(totalMale);
    chart7.dataset[2].data.push(totalFemale);
  }

  const subcities = await this.prisma.subcity.findMany();

  const data = {
    title: `GENERAL TEACHER DOWNLOAD REPORT FOR ${subcity.name.toUpperCase()} SUBCITY`,
    charts: { data: [chart2, chart3, chart4, chart5, chart6, chart7], class: ['success','primary','info','secondary','dark','warning','danger','light'] },
    subcities,
    _subcity: subcity,
  };

  return { data, type: 'teacher_download' };
}



async getAllWoredaTeacherDownloadInformation(woredaId: string) {
  // 1. Fetch Woreda with Schools
  const woreda = await this.prisma.woreda.findUnique({
    where: { id: woredaId },
    include: { schools: true }, // include schools
  });
  if (!woreda) return "";

  // 2. Fetch Subcity
  const subcity = await this.prisma.subcity.findUnique({
    where: { id: woreda.subcity_id }, // assuming Woreda has subcityId
  });

  // Helper to get chart dataset
  const createChart = (title: string) => ({
    type: "bar",
    title,
    labels: [] as string[],
    dataset: [
      { label: "Total", color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      { label: "Male", color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      { label: "Female", color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
    ],
  });

  const chart2 = createChart("Total schools teacher download");
  const chart3 = createChart("Report for teacher download from GOVERNMENT school");
  const chart4 = createChart("Report for teacher from PRIVATE school");

  // 3. Loop over Schools to populate chart2, chart3, chart4
  for (const school of woreda.schools) {
    const total = await this.prisma.teacherDownload.count({
      where: { teacher: { subcity_id: school.id } },
    });
    const totalMale = await this.prisma.teacherDownload.count({
      where: { teacher: { subcity_id: school.id, gender: "Male" } },
    });
    const totalFemale = await this.prisma.teacherDownload.count({
      where: { teacher: { subcity_id: school.id, gender: "Female" } },
    });

    // chart2
    chart2.labels.push(school.name);
    chart2.dataset[0].data.push(total);
    chart2.dataset[1].data.push(totalMale);
    chart2.dataset[2].data.push(totalFemale);

    // chart3 / chart4
    if (school.school_type === "government") {
      chart3.labels.push(woreda.name);
      chart3.dataset[0].data.push(total);
      chart3.dataset[1].data.push(totalMale);
      chart3.dataset[2].data.push(totalFemale);
    } else {
      chart4.labels.push(woreda.name);
      chart4.dataset[0].data.push(total);
      chart4.dataset[1].data.push(totalMale);
      chart4.dataset[2].data.push(totalFemale);
    }
  }

  // 4. Chart5 - Teacher download per years
  const chart5 = createChart("Total teacher download per years");

  const firstTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: "asc" } });
  const lastTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: "desc" } });
  const startYear = firstTeacher?.year ?? 2023;
  const lastYear = lastTeacher?.year ?? 2023;

  for (let year = startYear; year <= lastYear; year++) {
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const school of woreda.schools) {
      total += await this.prisma.teacherDownload.count({ where: { teacher: { subcity_id: school.id }, year } });
      totalMale += await this.prisma.teacherDownload.count({ where: { teacher: { subcity_id: school.id, gender: "Male" }, year } });
      totalFemale += await this.prisma.teacherDownload.count({ where: { teacher: { subcity_id: school.id, gender: "Female" }, year } });
    }
    chart5.labels.push(year.toString());
    chart5.dataset[0].data.push(total);
    chart5.dataset[1].data.push(totalMale);
    chart5.dataset[2].data.push(totalFemale);
  }

  // 5. Chart6 - Teacher download per grades
  const chart6 = createChart("Total teacher download per grades");
  const grades = await this.prisma.grade.findMany();

  for (const grade of grades) {
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const school of woreda.schools) {
      total += await this.prisma.teacherDownload.count({
        where: { teacher: { subcity_id: school.id }, resource: { grade_id: grade.id } },
      });
      totalMale += await this.prisma.teacherDownload.count({
        where: { teacher: { subcity_id: school.id, gender: "Male" }, resource: { grade_id: grade.id } },
      });
      totalFemale += await this.prisma.teacherDownload.count({
        where: { teacher: { subcity_id: school.id, gender: "Female" }, resource: { grade_id: grade.id } },
      });
    }
    chart6.labels.push(grade.name);
    chart6.dataset[0].data.push(total);
    chart6.dataset[1].data.push(totalMale);
    chart6.dataset[2].data.push(totalFemale);
  }

  // 6. Chart7 - Teacher download per courses
  const chart7 = createChart("Total teacher download per courses");
  const courses = await this.prisma.course.findMany();

  for (const course of courses) {
    let total = 0, totalMale = 0, totalFemale = 0;
    for (const school of woreda.schools) {
      total += await this.prisma.teacherDownload.count({
        where: { teacher: { subcity_id: school.id }, resource: { course_id: course.id } },
      });
      totalMale += await this.prisma.teacherDownload.count({
        where: { teacher: { subcity_id: school.id, gender: "Male" }, resource: { course_id: course.id } },
      });
      totalFemale += await this.prisma.teacherDownload.count({
        where: { teacher: { subcity_id: school.id, gender: "Female" }, resource: { course_id: course.id } },
      });
    }
    chart7.labels.push(course.name);
    chart7.dataset[0].data.push(total);
    chart7.dataset[1].data.push(totalMale);
    chart7.dataset[2].data.push(totalFemale);
  }

  // 7. Fetch subcities
  const subcities = await this.prisma.subcity.findMany();

  // 8. Prepare data
  const data = {
    title: `GENERAL TEACHER DOWNLOAD REPORT FOR ${woreda.name.toUpperCase()} WOREDA`,
    charts: { data: [chart2, chart3, chart4, chart5, chart6, chart7], class: ["success","primary","info","secondary","dark","warning","danger","light"] },
    subcities,
    _subcity: subcity,
    _woreda: woreda,
  };

  return data;
}



async getAllSchoolTeacherDownloadInformation(schoolId: string) {
  // 1. Fetch School with Woreda
  const school = await this.prisma.school.findUnique({
    where: { id: schoolId },
    include: { woreda: { include: { subcity: true } } },
  });
  if (!school) return "";

  // Helper to create chart dataset
  const createChart = (title: string) => ({
    type: "bar",
    title,
    labels: [] as string[],
    dataset: [
      { label: "Total", color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      { label: "Male", color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
      { label: "Female", color: this.getColor(), pointColor: this.getColor(), data: [] as number[] },
    ],
  });

  // 2. Chart1 - Doughnut
  const total = await this.prisma.teacherDownload.count({
    where: { teacher: { school_id: school.id } },
  });
  const totalMale = await this.prisma.teacherDownload.count({
    where: { teacher: { school_id: school.id, gender: "Male" } },
  });
  const totalFemale = await this.prisma.teacherDownload.count({
    where: { teacher: { school_id: school.id, gender: "Female" } },
  });

  const chart1 = {
    type: "doughnut",
    title: `Total ${school.name} teacher download report`,
    labels: ["Total", "Male", "Female"],
    data: [total, totalMale, totalFemale],
    background_color: [this.getColor(), this.getColor(), this.getColor()],
  };

  // 3. Chart5 - Teacher download per years
  const chart5 = createChart("Total teacher download per years");
  const firstTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: "asc" } });
  const lastTeacher = await this.prisma.teacherDownload.findFirst({ orderBy: { year: "desc" } });
  const startYear = firstTeacher?.year ?? 2023;
  const lastYear = lastTeacher?.year ?? 2023;

  for (let year = startYear; year <= lastYear; year++) {
    const total = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id }, year } });
    const totalMale = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id, gender: "Male" }, year } });
    const totalFemale = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id, gender: "Female" }, year } });

    chart5.labels.push(year.toString());
    chart5.dataset[0].data.push(total);
    chart5.dataset[1].data.push(totalMale);
    chart5.dataset[2].data.push(totalFemale);
  }

  // 4. Chart6 - Teacher download per grades
  const chart6 = createChart("Total teacher download per grades");
  const grades = await this.prisma.grade.findMany();

  for (const grade of grades) {
    const total = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id }, resource: { grade_id: grade.id } } });
    const totalMale = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id, gender: "Male" }, resource: { grade_id: grade.id } } });
    const totalFemale = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id, gender: "Female" }, resource: { grade_id: grade.id } } });

    chart6.labels.push(grade.name);
    chart6.dataset[0].data.push(total);
    chart6.dataset[1].data.push(totalMale);
    chart6.dataset[2].data.push(totalFemale);
  }

  // 5. Chart7 - Teacher download per courses
  const chart7 = createChart("Total teacher download per courses");
  const courses = await this.prisma.course.findMany();

  for (const course of courses) {
    const total = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id }, resource: { course_id: course.id } } });
    const totalMale = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id, gender: "Male" }, resource: { course_id: course.id } } });
    const totalFemale = await this.prisma.teacherDownload.count({ where: { teacher: { school_id: school.id, gender: "Female" }, resource: { course_id: course.id } } });

    chart7.labels.push(course.name);
    chart7.dataset[0].data.push(total);
    chart7.dataset[1].data.push(totalMale);
    chart7.dataset[2].data.push(totalFemale);
  }

  // 6. Fetch all subcities
  const subcities = await this.prisma.subcity.findMany();

  // 7. Prepare final data
  const data = {
    title: `GENERAL TEACHER DOWNLOAD REPORT FOR ${school.name.toUpperCase()}`,
    charts: { data: [chart1, chart5, chart6, chart7], class: ["success","primary","info","secondary","dark","warning","danger","light"] },
    subcities,
    _subcity: school.woreda.subcity,
    _woreda: school.woreda,
    _school: school,
  };

  return data;
}




}
