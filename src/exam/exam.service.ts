import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioService } from 'src/minio/minio.service';
import { CreateExamQuestionDto, UpdateExamQuestionDto, ExamOptionDto, SaveResultDto, ToggleQuestionStatusDto } from './dto/exam.dto';

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  // --------------------------
  // CREATE QUESTION
  // --------------------------
  async createQuestion(dto: CreateExamQuestionDto, files?: { question_image?: Express.Multer.File[], answer_image?: Express.Multer.File[] }) {
    let questionImageUrl: string | null = null;
    let answerImageUrl: string | null = null;

    if (files?.question_image?.[0]) {
      const file = files.question_image[0];
      await this.minio.uploadFile(file.originalname, file.buffer);
      questionImageUrl = file.originalname;
    }

    if (files?.answer_image?.[0]) {
      const file = files.answer_image[0];
      await this.minio.uploadFile(file.originalname, file.buffer);
      answerImageUrl = file.originalname;
    }

    return this.prisma.examQuestion.create({
      data: {
        question_text: dto.question_text,
        answer_desc: dto.answer_desc,
        question_image: questionImageUrl,
        answer_image: answerImageUrl,
        course_id: dto.course_id,
        grade_id: dto.grade_id,
        chapter: dto.chapter,
        created_by: dto.created_by,
      },
    });
  }

  // --------------------------
  // UPDATE QUESTION
  // --------------------------
  async updateQuestion(id: string, dto: UpdateExamQuestionDto, files?: { question_image?: Express.Multer.File[], answer_image?: Express.Multer.File[] }) {
    const existing = await this.prisma.examQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found');

    let questionImageUrl = existing.question_image;
    let answerImageUrl = existing.answer_image;

    if (files?.question_image?.[0]) {
      const file = files.question_image[0];
      await this.minio.uploadFile(file.originalname, file.buffer);
      questionImageUrl = file.originalname;
    }

    if (files?.answer_image?.[0]) {
      const file = files.answer_image[0];
      await this.minio.uploadFile(file.originalname, file.buffer);
      answerImageUrl = file.originalname;
    }

    return this.prisma.examQuestion.update({
      where: { id },
      data: {
        question_text: dto.question_text ?? existing.question_text,
        answer_desc: dto.answer_desc ?? existing.answer_desc,
        question_image: questionImageUrl,
        answer_image: answerImageUrl,
        course_id: dto.course_id ?? existing.course_id,
        grade_id: dto.grade_id ?? existing.grade_id,
        chapter: dto.chapter ?? existing.chapter,
        created_by: dto.created_by ?? existing.created_by,
      },
    });
  }

  // --------------------------
  // CREATE OPTION
  // --------------------------
  async createOption(dto: ExamOptionDto, file?: Express.Multer.File) {
  let optionImageUrl: string | null = null; // fix type

  if (file) {
    await this.minio.uploadFile(file.originalname, file.buffer);
    optionImageUrl = file.originalname; // ✅ OK
  }

  return this.prisma.examOption.create({
    data: {
      question_id: dto.question_id,
      option_text: dto.option_text,
      option_image: optionImageUrl,
      is_correct: dto.is_correct,
    },
  });
}

  // --------------------------
  // UPDATE OPTION
  // --------------------------
  async updateOption(dto: ExamOptionDto, file?: Express.Multer.File) {
    if (!dto.id) throw new NotFoundException('Option ID is required');

    const existing = await this.prisma.examOption.findUnique({ where: { id: dto.id } });
    if (!existing) throw new NotFoundException('Option not found');

    let optionImageUrl = existing.option_image;
    if (file) {
      await this.minio.uploadFile(file.originalname, file.buffer);
      optionImageUrl = file.originalname;
    }

    return this.prisma.examOption.update({
      where: { id: dto.id },
      data: {
        option_text: dto.option_text ?? existing.option_text,
        option_image: optionImageUrl,
        is_correct: dto.is_correct ?? existing.is_correct,
      },
    });
  }

  // --------------------------
  // DELETE OPTION
  // --------------------------
  async deleteOption(id: string) {
    // Find the option with its parent question
    const option = await this.prisma.examOption.findUnique({
      where: { id },
      include: { question: true }, // include parent question
    });

    if (!option) throw new NotFoundException('Option not found');

    // Check if parent question is active
    if (option.question.status) {
      throw new Error(
        'Cannot delete option because the parent question is currently active'
      );
    }

    // Safe to delete
    return this.prisma.examOption.delete({ where: { id } });
  }

  // --------------------------
  // GET QUESTION WITH OPTIONS
  // --------------------------
  async getQuestionWithOptions(id: string) {
    return this.prisma.examQuestion.findUnique({
      where: { id },
      include: { options: true },
    });
  }

  // --------------------------
  // GET ALL QUESTIONS BY GRADE & COURSE
  // --------------------------
  async getExamsByGradeAndCourse(grade_id: string, course_id: string) {
    return this.prisma.examQuestion.findMany({
      where: { grade_id, course_id },
      include: { options: true },
    });
  }

  // --------------------------
  // GET RANDOM QUESTIONS
  // --------------------------
  async getRandomQuestions(courseId: string, gradeId: string, chapter?: number, limit = 10) {
    return this.prisma.examQuestion.findMany({
      where: { course_id: courseId, grade_id: gradeId, ...(chapter && { chapter }) },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { options: true },
    });
  }

  // --------------------------
  // SAVE RESULT
  // --------------------------
  async saveResult(dto: SaveResultDto) {
    return this.prisma.examResult.create({
      data: {
        user_id: dto.user_id,
        grade_id: dto.grade_id,
        course_id: dto.course_id,
        max_score: dto.max_score,
        result: dto.result,
      },
    });
  }


 async toggleQuestionStatus(dto: ToggleQuestionStatusDto) {
  const { question_id } = dto;

  const question = await this.prisma.examQuestion.findUnique({
    where: { id: question_id },
    include: { options: true },
  });

  if (!question) throw new NotFoundException('Question not found');

  if (!question.status) {
    // Enable only if 4 options exist and at least 1 correct
    const options = question.options;
    if (options.length !== 4)
      throw new Error('Question must have exactly 4 options to enable');
    if (!options.some(opt => opt.is_correct))
      throw new Error('Question must have at least one correct option to enable');

    return this.prisma.examQuestion.update({
      where: { id: question_id },
      data: { status: true },
    });
  } else {
    // Disable without any checks
    return this.prisma.examQuestion.update({
      where: { id: question_id },
      data: { status: false },
    });
  }
}


 

}

