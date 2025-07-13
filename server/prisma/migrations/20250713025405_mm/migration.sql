/*
  Warnings:

  - You are about to drop the column `enabled` on the `supplier` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `itemoniputcar` DROP FOREIGN KEY `ItemOnIputCar_inputCarId_fkey`;

-- DropIndex
DROP INDEX `ItemOnIputCar_inputCarId_fkey` ON `itemoniputcar`;

-- AlterTable
ALTER TABLE `itemoniputcar` ADD COLUMN `actualBrandModel` VARCHAR(191) NULL,
    ADD COLUMN `actualCarId` INTEGER NULL,
    ADD COLUMN `actualColorName` VARCHAR(191) NULL,
    ADD COLUMN `actualCostPrice` DOUBLE NULL,
    ADD COLUMN `actualDescription` VARCHAR(191) NULL,
    ADD COLUMN `actualEngineNumber` VARCHAR(191) NULL,
    ADD COLUMN `actualLicensePlate` VARCHAR(191) NULL,
    ADD COLUMN `actualPrice` DOUBLE NULL,
    ADD COLUMN `actualTypeName` VARCHAR(191) NULL,
    ADD COLUMN `actualVin` VARCHAR(191) NULL,
    ADD COLUMN `actualYear` INTEGER NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `receivedDate` DATETIME(3) NULL,
    ADD COLUMN `receivedQuantity` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `enabled`;

-- AddForeignKey
ALTER TABLE `ItemOnIputCar` ADD CONSTRAINT `ItemOnIputCar_inputCarId_fkey` FOREIGN KEY (`inputCarId`) REFERENCES `InputCar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOnIputCar` ADD CONSTRAINT `ItemOnIputCar_actualCarId_fkey` FOREIGN KEY (`actualCarId`) REFERENCES `Car`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
