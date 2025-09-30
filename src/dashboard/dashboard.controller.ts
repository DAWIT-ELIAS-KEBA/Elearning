import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SubcityIdDto, WoredaIdDto, SchoolIdDto } from './dto/dashboard.dto';

@Controller('shaggar')
export class DashboardController {
  constructor(private readonly DashboardService: DashboardService) {}

  // ---------- Student Information ----------
  @Get('students')
  getShaggarStudentInformation() {
    return this.DashboardService.getShaggarStudentInformation();
  }

  @Get('students/subcity/:subcityId')
  getSubcityStudentInformation(@Param() params: SubcityIdDto) {
    return this.DashboardService.getSubcityStudentInformation(params.subcityId);
  }

  @Get('students/woreda/:woredaId')
  getWoredaStudentInformation(@Param() params: WoredaIdDto) {
    return this.DashboardService.getWoredaStudentInformation(params.woredaId);
  }

  @Get('students/school/:schoolId')
  getSchoolStudentInformation(@Param() params: SchoolIdDto) {
    return this.DashboardService.getSchoolStudentInformation(params.schoolId);
  }

  // ---------- Teacher Information ----------
  @Get('teachers')
  getAllShaggarTeacherInformation() {
    return this.DashboardService.getAllShaggarTeacherInformation();
  }

  @Get('teachers/subcity/:subcityId')
  getAllSubcityTeacherInformation(@Param() params: SubcityIdDto) {
    return this.DashboardService.getAllSubcityTeacherInformation(params.subcityId);
  }

  @Get('teachers/woreda/:woredaId')
  getAllWoredaTeacherInformation(@Param() params: WoredaIdDto) {
    return this.DashboardService.getAllWoredaTeacherInformation(params.woredaId);
  }

  @Get('teachers/school/:schoolId')
  getAllSchoolTeacherInformation(@Param() params: SchoolIdDto) {
    return this.DashboardService.getAllSchoolTeacherInformation(params.schoolId);
  }

  // ---------- General Information ----------
  @Get('general')
  getAllShaggarGeneralInformation() {
    return this.DashboardService.getAllShaggarGeneralInformation();
  }

  @Get('general/subcity/:subcityId')
  getAllSubcityGeneralInformation(@Param() params: SubcityIdDto) {
    return this.DashboardService.getAllSubcityGeneralInformation(params.subcityId);
  }

  @Get('general/woreda/:woredaId')
  getAllWoredaGeneralInformation(@Param() params: WoredaIdDto) {
    return this.DashboardService.getAllWoredaGeneralInformation(params.woredaId);
  }

  @Get('general/school/:schoolId')
  getAllSchoolGeneralInformation(@Param() params: SchoolIdDto) {
    return this.DashboardService.getAllSchoolGeneralInformation(params.schoolId);
  }

  // ---------- Student Download ----------
  @Get('students/download')
  getAllShaggarStudentDownloadInformation() {
    return this.DashboardService.getAllShaggarStudentDownloadInformation();
  }

  @Get('students/download/subcity/:subcityId')
  getAllSubcityStudentDownloadInformation(@Param() params: SubcityIdDto) {
    return this.DashboardService.getAllSubcityStudentDownloadInformation(params.subcityId);
  }

  @Get('students/download/woreda/:woredaId')
  getAllWoredaStudentDownloadInformation(@Param() params: WoredaIdDto) {
    return this.DashboardService.getAllWoredaStudentDownloadInformation(params.woredaId);
  }

  // ---------- Teacher Download ----------
  @Get('teachers/download')
  getAllShaggarTeacherDownloadInformation() {
    return this.DashboardService.getAllShaggarTeacherDownloadInformation();
  }

  @Get('teachers/download/subcity/:subcityId')
  getAllSubcityTeacherDownloadInformation(@Param() params: SubcityIdDto) {
    return this.DashboardService.getAllSubcityTeacherDownloadInformation(params.subcityId);
  }

  @Get('teachers/download/woreda/:woredaId')
  getAllWoredaTeacherDownloadInformation(@Param() params: WoredaIdDto) {
    return this.DashboardService.getAllWoredaTeacherDownloadInformation(params.woredaId);
  }

  @Get('teachers/download/school/:schoolId')
  getAllSchoolTeacherDownloadInformation(@Param() params: SchoolIdDto) {
    return this.DashboardService.getAllSchoolTeacherDownloadInformation(params.schoolId);
  }
}
