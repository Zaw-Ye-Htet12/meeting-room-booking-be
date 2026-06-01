import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room booking' })
  create(@Body() createBookingDto: CreateBookingDto, @Request() req: any) {
    return this.bookingsService.create(createBookingDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.bookingsService.findAll(page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined);
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiOperation({ summary: 'Get booking summary grouped by user (Admin/Owner only)' })
  getSummary() {
    return this.bookingsService.getSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Request() req: any) {
    return this.bookingsService.update(id, updateBookingDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.remove(id, req.user);
  }
}
