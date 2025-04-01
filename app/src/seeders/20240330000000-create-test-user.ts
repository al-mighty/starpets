import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('users', [
    {
      balance: 10000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('users', {});
} 