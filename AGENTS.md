# Backend Agent Rules (NestJS + PostgreSQL)

## Tech Stack
- **Framework:** NestJS 11+
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma (Recommended) or TypeORM
- **API Documentation:** Swagger (@nestjs/swagger)

## Rules & Conventions
1. **Module Structure:** Follow the standard NestJS modular architecture. Each feature should have its own Module, Controller, and Service (e.g., `rooms.module.ts`, `rooms.controller.ts`, `rooms.service.ts`).
2. **Database Access:** Use a dedicated service for database access (e.g., `PrismaService`). Do not put database logic directly in controllers.
3. **Validation:** Use `class-validator` and `class-transformer` with DTOs (Data Transfer Objects) for all incoming request payloads.
4. **Error Handling:** Use built-in NestJS exceptions (e.g., `NotFoundException`, `BadRequestException`) for HTTP error responses.
5. **Environment Variables:** Use `@nestjs/config` for configuration and environment variables. Never hardcode secrets.
6. **Documentation:** Decorate all controllers and DTOs with Swagger decorators (`@ApiTags`, `@ApiResponse`, `@ApiProperty`) to automatically generate API documentation.
7. **Business Logic:** Keep controllers thin; delegate all business logic to the services.