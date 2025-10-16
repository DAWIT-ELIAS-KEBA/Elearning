import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { PermissionResponseDto } from './dtos/permission.response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Permissions')
@Controller('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiSecurity('accessToken')
  @Permissions('create-permission')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'The permission has been successfully created.',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({
    status: 409,
    description: 'Permission with this name already exists.',
  })
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.create(createPermissionDto);
  }

  @ApiSecurity('accessToken')
  @Permissions('view-permission')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all permissions' })
  @ApiResponse({
    status: 200,
    description: 'A list of permissions.',
    type: [PermissionResponseDto],
  })
  @Get()
  findAll(){
    return this.permissionsService.findAll();
  }

  @ApiSecurity('accessToken')
  @Permissions('view-permission')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a permission by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the permission',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The permission found by ID.',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  async findOne(@Param('id') id: string): Promise<PermissionResponseDto> {
    return this.permissionsService.findOne(id);
  }

  @ApiSecurity('accessToken')
  @Permissions('update-permission')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a permission by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the permission',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully updated.',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @ApiResponse({
    status: 409,
    description: 'Permission with this name already exists.',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @ApiSecurity('accessToken')
  @Permissions('delete-permission')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the permission',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The permission has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.permissionsService.remove(id);
  }
}
