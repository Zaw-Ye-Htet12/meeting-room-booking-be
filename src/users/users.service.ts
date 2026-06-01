import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role || Role.USER,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({ where: { email: updateUserDto.email } });
      if (emailExists) throw new ConflictException('Email already exists');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { password, ...result } = updatedUser;
    return result;
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    // Deleting a user should be handled by Prisma cascade or manual delete
    // Currently relying on schema for cascade if needed, but let's delete bookings manually if no cascade
    await this.prisma.booking.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async setupInitialAdmin(createUserDto: CreateUserDto) {
    const count = await this.prisma.user.count();
    if (count > 0) {
      throw new BadRequestException('Setup can only be run when the database has no users.');
    }
    createUserDto.role = Role.ADMIN;
    return this.create(createUserDto);
  }
}
