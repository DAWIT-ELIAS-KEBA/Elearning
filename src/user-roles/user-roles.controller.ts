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
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dtos/create-user-role.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { UserRoleResponseDto } from './dtos/user-role.response.dto';
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

@ApiTags('User Roles')
@Controller('user-roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @ApiSecurity('accessToken')

  // @Permissions('create-user-role')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({
    status: 201,
    description: 'The user-role assignment has been successfully created.',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.', type: String })
  @ApiResponse({
    status: 404,
    description: 'One or both of the provided UserID or RoleID do not exist.',
    type: String,
  })
  @ApiResponse({
    status: 409,
    description: 'This user already has this role assigned.',
    type: String,
  })
  async create(
    @Body() createUserRoleDto: CreateUserRoleDto,
  ): Promise<UserRoleResponseDto> {
    return this.userRolesService.create(createUserRoleDto);
  }

  @ApiSecurity('accessToken')

  // @Permissions('view-user-role')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all user-role assignments' })
  @ApiResponse({
    status: 200,
    description: 'A list of user-role assignments.',
    type: [UserRoleResponseDto],
  })
  async findAll(): Promise<UserRoleResponseDto[]> {
    return this.userRolesService.findAll();
  }

  @ApiSecurity('accessToken')

  // @Permissions('view-user-role')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a user-role assignment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the user-role assignment',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The user-role assignment found by ID.',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'UserRole not found.' })
  async findOne(@Param('id') id: string): Promise<UserRoleResponseDto> {
    return this.userRolesService.findOne(id);
  }

  @ApiSecurity('accessToken')

  // @Permissions('update-user-role')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user-role assignment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the user-role assignment',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The user-role assignment has been successfully updated.',
    type: UserRoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({
    status: 404,
    description: 'UserRole not found or invalid foreign keys.',
    type: String,
  })
  @ApiResponse({
    status: 409,
    description: 'This user already has this role assigned.',
    type: String,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserRoleResponseDto> {
    return this.userRolesService.update(id, updateUserRoleDto);
  }

  @ApiSecurity('accessToken')

  // @Permissions('delete-user-role')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user-role assignment by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the user-role assignment',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The user-role assignment has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'UserRole not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.userRolesService.remove(id);
  }

  @ApiSecurity('accessToken')

  // @Permissions('view-user-role')
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all roles for a specific user' })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of roles for the specified user.',
    type: [UserRoleResponseDto],
  })
  async findByUserId(@Param('userId') userId: string): Promise<UserRoleResponseDto[]> {
    return this.userRolesService.findByUserId(userId);
  }

  @ApiSecurity('accessToken')

  // @Permissions('delete-user-role')
  @Delete('user/:userId/role/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific role for a user' })
  @ApiParam({
    name: 'userId',
    description: 'The UUID of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'roleId',
    description: 'The UUID of the role',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The user-role assignment has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'UserRole not found.' })
  async removeRoleForUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<void> {
    await this.userRolesService.removeRoleForUser(userId, roleId);
  }
}
