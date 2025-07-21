/*
  Warnings:

  - You are about to drop the column `colorCarId` on the `car` table. All the data in the column will be lost.
  - Made the column `carId` on table `salecar` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `car` DROP FOREIGN KEY `Car_colorCarId_fkey`;

-- DropForeignKey
ALTER TABLE `salecar` DROP FOREIGN KEY `saleCar_carId_fkey`;

-- DropIndex
DROP INDEX `Car_colorCarId_fkey` ON `car`;

-- DropIndex
DROP INDEX `saleCar_carId_fkey` ON `salecar`;

-- AlterTable
ALTER TABLE `car` DROP COLUMN `colorCarId`;

-- AlterTable
ALTER TABLE `salecar` MODIFY `carId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `saleCar` ADD CONSTRAINT `saleCar_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
