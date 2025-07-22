/*
  Warnings:

  - You are about to drop the column `year` on the `salecar` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `car` ADD COLUMN `year` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salecar` DROP COLUMN `year`;
