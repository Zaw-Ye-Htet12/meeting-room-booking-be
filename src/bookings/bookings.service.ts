import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Role } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const start = new Date(createBookingDto.startTime);
    const end = new Date(createBookingDto.endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    const now = new Date();
    if (start < now) {
      throw new BadRequestException('Cannot book a meeting room in the past');
    }

    if (start.toDateString() !== end.toDateString()) {
      throw new BadRequestException(
        'Booking must start and end on the same calendar day',
      );
    }

    const roomName = createBookingDto.roomName;

    // Use a serializable transaction to prevent race conditions (NFR-4)
    // Two simultaneous requests cannot both pass the overlap check
    return this.prisma.$transaction(
      async (tx) => {
        const overlaps = await tx.booking.findFirst({
          where: {
            AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
          },
        });

        if (overlaps) {
          throw new ConflictException(
            'Booking overlaps with an existing reservation for this room',
          );
        }

        return tx.booking.create({
          data: {
            roomName,
            startTime: start,
            endTime: end,
            userId: userId,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        });
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.booking.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary() {
    const users = await this.prisma.user.findMany({
      include: {
        bookings: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            createdAt: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    return users
      .filter((user) => user.bookings.length > 0)
      .map((user) => ({
        userId: user.id,
        userName: user.name,
        totalBookings: user.bookings.length,
        bookings: user.bookings,
      }));
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private checkModifyPermission(booking: any, user: any) {
    if (
      booking.userId !== user.id &&
      user.role !== Role.ADMIN &&
      user.role !== Role.OWNER
    ) {
      throw new ForbiddenException(
        'You are not allowed to modify this booking',
      );
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, user: any) {
    const booking = await this.findOne(id);
    this.checkModifyPermission(booking, user);

    let start = booking.startTime;
    let end = booking.endTime;
    let roomName = booking.roomName;

    if (updateBookingDto.startTime)
      start = new Date(updateBookingDto.startTime);
    if (updateBookingDto.endTime) end = new Date(updateBookingDto.endTime);
    if (updateBookingDto.roomName) roomName = updateBookingDto.roomName;

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    const now = new Date();
    // Validate past dates ONLY when the client is attempting to change/set the start time to the past
    if (updateBookingDto.startTime && start < now) {
      throw new BadRequestException('Cannot update booking to a past time');
    }

    if (start.toDateString() !== end.toDateString()) {
      throw new BadRequestException(
        'Booking must start and end on the same calendar day',
      );
    }

    // Use a serializable transaction to prevent race conditions (NFR-4)
    return this.prisma.$transaction(
      async (tx) => {
        const overlaps = await tx.booking.findFirst({
          where: {
            id: { not: id },
            AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
          },
        });

        if (overlaps) {
          throw new ConflictException(
            'Updated booking overlaps with an existing reservation',
          );
        }

        return tx.booking.update({
          where: { id },
          data: {
            roomName,
            startTime: start,
            endTime: end,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        });
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async remove(id: string, user: any) {
    const booking = await this.findOne(id);
    this.checkModifyPermission(booking, user);
    await this.prisma.booking.delete({ where: { id } });
    return { message: 'Booking cancelled successfully' };
  }
}
