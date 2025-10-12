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
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dtos/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dtos/update-role-permission.dto';
import { RolePermissionResponseDto } from './dtos/role-permission.response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateRolePermissionsDto } from './dtos/create-role-permissions.dto';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { SyncRolePermissionsDto } from './dtos/sync-role-permission.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Role Permissions')
@Controller('role-permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @ApiSecurity('accessToken')
  @Permissions('update-role-permission')
  @Post('add-to-role/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Add multiple permissions to an existing role without removing existing ones',
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions added successfully.',
    type: [RolePermissionResponseDto],
  })
  async addPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body() body: SyncRolePermissionsDto,
  ): Promise<RolePermissionResponseDto[]> {
    return this.rolePermissionsService.addPermissionsToRole(
      roleId,
      body.permissionIds,
    );
  }

  @ApiSecurity('accessToken')
  @Permissions('create-role-permission')
  @Post('assign-many')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign multiple permissions to a role' })
  @ApiResponse({
    status: 201,
    description: 'Permissions have been successfully assigned to the role.',
    type: [RolePermissionResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({
    status: 404,
    description:
      'One or more of the provided RoleID or PermissionIDs do not exist.',
  })
  @ApiResponse({
    status: 409,
    description: 'One or more permissions are already assigned to this role.',
  })
  async createMany(
    @Body() createRolePermissionDto: CreateRolePermissionsDto,
  ): Promise<RolePermissionResponseDto[]> {
    return this.rolePermissionsService.createMany(createRolePermissionDto);
  }

  @ApiSecurity('accessToken')
  @Permissions('create-role-permission')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a permission to a role' })
  @ApiResponse({
    status: 201,
    description:
      'The role-permission assignment has been successfully created.',
    type: RolePermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.', type: String })
  @ApiResponse({
    status: 404,
    description:
      'One or both of the provided RoleID or PermissionID do not exist.',
    type: String,
  })
  @ApiResponse({
    status: 409,
    description: 'This role already has this permission assigned.',
    type: String,
  })
  async create(
    @Body() createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermissionResponseDto> {
    return this.rolePermissionsService.create(createRolePermissionDto);
  }

  @ApiSecurity('accessToken')
  @Permissions('view-role-permission')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all role-permission assignments' })
  @ApiResponse({
    status: 200,
    description: 'A list of role-permission assignments.',
    type: [RolePermissionResponseDto],
  })
  async findAll(): Promise<RolePermissionResponseDto[]> {
    return this.rolePermissionsService.findAll();
  }

  @ApiSecurity('accessToken')
  @Permissions('view-role-permission')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a role-permission assignment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role-permission assignment',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The role-permission assignment found by ID.',
    type: RolePermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'RolePermission not found.' })
  async findOne(@Param('id') id: string): Promise<RolePermissionResponseDto> {
    return this.rolePermissionsService.findOne(id);
  }

  @ApiSecurity('accessToken')
  @Permissions('update-role-permission')
  @Patch('sync/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synchronize role permissions with provided list' })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Role permissions synchronized successfully.',
    type: [RolePermissionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async syncRolePermissions(
    @Param('roleId') roleId: string,
    @Body() body: SyncRolePermissionsDto,
  ): Promise<RolePermissionResponseDto[]> {
    return this.rolePermissionsService.syncRolePermissions(
      roleId,
      body.permissionIds,
    );
  }

  @ApiSecurity('accessToken')
  @Permissions('update-role-permission')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a role-permission assignment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role-permission assignment',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:
      'The role-permission assignment has been successfully updated.',
    type: RolePermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({
    status: 404,
    description: 'RolePermission not found or invalid foreign keys.',
    type: String,
  })
  @ApiResponse({
    status: 409,
    description: 'This role already has this permission assigned.',
    type: String,
  })
  async update(
    @Param('id') id: string,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto,
  ): Promise<RolePermissionResponseDto> {
    return this.rolePermissionsService.update(id, updateRolePermissionDto);
  }

  @ApiSecurity('accessToken')
  @Permissions('delete-role-permission')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role-permission assignment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role-permission assignment',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description:
      'The role-permission assignment has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'RolePermission not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.rolePermissionsService.remove(id);
  }

  @ApiSecurity('accessToken')
  @Permissions('view-role-permission')
  @Get('role/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all permissions under a specific role' })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of permissions for the specified role.',
    type: [RolePermissionResponseDto],
  })
  async findPermissionsByRoleId(
    @Param('roleId') roleId: string,
  ): Promise<RolePermissionResponseDto[]> {
    return this.rolePermissionsService.findPermissionsByRoleId(roleId);
  }
}
