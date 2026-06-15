import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../modules/users/entities/user.entity';
import { HashUtil } from '../common/utils/hash.util';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('--- Bắt đầu chạy Seeding database ---');

  try {
    const userRepository = dataSource.getRepository(User);

    console.log('1. Đang đọc dữ liệu từ file JSON...');
    const filePath = path.join(__dirname, 'data', 'users.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const usersData = JSON.parse(rawData);

    for (const item of usersData) {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await userRepository.findOne({
        where: { email: item.email },
      });

      if (existingUser) {
        console.log(`Bỏ qua: User với email ${item.email} đã tồn tại.`);
        continue;
      }

      const passwordHash = await HashUtil.hash(item.password);
      const user = userRepository.create({
        email: item.email,
        passwordHash,
        fullName: item.fullName,
        phone: item.phone,
        role: item.role as UserRole,
        status: item.status as UserStatus,
        emailVerified: true,
        createdBy: 'seed',
        modifiedBy: 'seed',
      });
      await userRepository.save(user);
      console.log(`Đã tạo user: ${item.email} (${item.role})`);
    }

    console.log('--- Hoàn tất Seeding database ---');
  } catch (error) {
    console.error('Lỗi khi chạy Seeding:', error);
  } finally {
    await app.close();
    console.log('Đã đóng kết nối.');
  }
}

bootstrap();

