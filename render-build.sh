#!/usr/bin/env bash
# exit on error
set -o errexit

# Install all dependencies (including devDependencies so @nestjs/cli is available)
npm install --include=dev

npx prisma generate
npx prisma migrate deploy
npm run build

