import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  Get,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ExamService } from './exam.service';
import {
  CreateExamQuestionDto,
  UpdateExamQuestionDto,
  SaveResultDto,
  GetExamsQueryDto,
  ExamOptionDto,
  ToggleQuestionStatusDto,
} from './dto/exam.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('exam')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // --------------------------
  // CREATE QUESTION
  // --------------------------
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  createQuestion(
    @Body() dto: CreateExamQuestionDto,
    @UploadedFiles() files?: { question_image?: Express.Multer.File[], answer_image?: Express.Multer.File[] }
  ) {
    return this.examService.createQuestion(dto, files);
  }

  // --------------------------
  // UPDATE QUESTION
  // --------------------------
  @Put('update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateExamQuestionDto,
    @UploadedFiles() files?: { question_image?: Express.Multer.File[], answer_image?: Express.Multer.File[] }
  ) {
    return this.examService.updateQuestion(id, dto, files);
  }

  // --------------------------
  // CREATE OPTION
  // --------------------------
  @Post('add_option')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('option_image'))
  createOption(
    @Body() dto: ExamOptionDto,
    @UploadedFiles() file?: Express.Multer.File
  ) {
    return this.examService.createOption(dto, file);
  }

  // --------------------------
  // UPDATE OPTION
  // --------------------------
  @Put('update_option/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('option_image'))
  updateOption(
    @Param('id') id: string,
    @Body() dto: ExamOptionDto,
    @UploadedFiles() file?: Express.Multer.File
  ) {
    dto.id = id;
    return this.examService.updateOption(dto, file);
  }

  // --------------------------
  // DELETE OPTION
  // --------------------------
  @Delete('delete_option/:id')
  deleteOption(@Param('id') id: string) {
    return this.examService.deleteOption(id);
  }

  // --------------------------
  // GET ALL QUESTIONS BY GRADE & COURSE
  // --------------------------
  @Get('all_grade_course_questions')
  @ApiOperation({ summary: 'Get all exam questions by grade and course' })
  getExams(@Query() query: GetExamsQueryDto) {
    return this.examService.getExamsByGradeAndCourse(query.grade_id, query.course_id);
  }

  // --------------------------
  // GET RANDOM QUESTIONS
  // --------------------------
  @Get('random_questions')
  getRandomQuestions(
    @Query('course_id') course_id: string,
    @Query('grade_id') grade_id: string,
    @Query('chapter') chapter?: string,
    @Query('limit') limit?: string,
  ) {
    return this.examService.getRandomQuestions(
      course_id,
      grade_id,
      chapter ? Number(chapter) : undefined,
      limit ? Number(limit) : 10,
    );
  }

  // --------------------------
  // TOGGLE QUESTION STATUS
  // --------------------------
  @Put('question/toggle-status')
  @ApiOperation({ summary: 'Toggle exam question status using DTO' })
  toggleQuestionStatus(@Body() dto: ToggleQuestionStatusDto) {
    return this.examService.toggleQuestionStatus(dto);
  }

  // --------------------------
  // SAVE RESULT
  // --------------------------
  @Post('save_result')
  saveResult(@Body() dto: SaveResultDto) {
    return this.examService.saveResult(dto);
  }

  // --------------------------
  // GET QUESTION WITH OPTIONS
  // --------------------------
  @Get('question/:id/question_options')
  getQuestionWithOptions(@Param('id') id: string) {
    return this.examService.getQuestionWithOptions(id);
  }
}
