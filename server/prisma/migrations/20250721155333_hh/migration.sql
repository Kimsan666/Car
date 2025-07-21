/*
  Warnings:

  - You are about to drop the column `name` on the `car` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `car` DROP COLUMN `name`;

-- AlterTable
ALTER TABLE `salecar` ADD COLUMN `name` VARCHAR(191) NULL;
