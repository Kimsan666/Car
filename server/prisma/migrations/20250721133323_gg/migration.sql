/*
  Warnings:

  - You are about to drop the column `costPrice` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `engineNumber` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `licensePlate` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `soldDate` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `soldPrice` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `vin` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `car` table. All the data in the column will be lost.
  - You are about to drop the column `actualCarId` on the `itemoniputcar` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `itemoniputcar` DROP FOREIGN KEY `ItemOnIputCar_actualCarId_fkey`;

-- DropForeignKey
ALTER TABLE `itemonorder` DROP FOREIGN KEY `ItemOnOrder_carId_fkey`;

-- DropIndex
DROP INDEX `Car_licensePlate_key` ON `car`;

-- DropIndex
DROP INDEX `Car_vin_key` ON `car`;

-- DropIndex
DROP INDEX `ItemOnIputCar_actualCarId_fkey` ON `itemoniputcar`;

-- DropIndex
DROP INDEX `ItemOnOrder_carId_fkey` ON `itemonorder`;

-- AlterTable
ALTER TABLE `car` DROP COLUMN `costPrice`,
    DROP COLUMN `engineNumber`,
    DROP COLUMN `licensePlate`,
    DROP COLUMN `price`,
    DROP COLUMN `soldDate`,
    DROP COLUMN `soldPrice`,
    DROP COLUMN `status`,
    DROP COLUMN `vin`,
    DROP COLUMN `year`;

-- AlterTable
ALTER TABLE `itemoniputcar` DROP COLUMN `actualCarId`;

-- AlterTable
ALTER TABLE `itemonorder` ADD COLUMN `cartId` INTEGER NULL,
    ADD COLUMN `saleCarId` INTEGER NULL,
    MODIFY `carId` INTEGER NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `status`;

-- CreateTable
CREATE TABLE `saleCar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `licensePlate` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `colorCarId` INTEGER NULL,
    `vin` VARCHAR(191) NULL,
    `engineNumber` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Available',
    `price` DOUBLE NOT NULL,
    `costPrice` DOUBLE NOT NULL,
    `soldDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `saleCar_licensePlate_key`(`licensePlate`),
    UNIQUE INDEX `saleCar_vin_key`(`vin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderdById` INTEGER NOT NULL,
    `customerId` INTEGER NULL,
    `totalAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemOnCart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `saleCarId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `saleCar` ADD CONSTRAINT `saleCar_colorCarId_fkey` FOREIGN KEY (`colorCarId`) REFERENCES `ColorCar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_orderdById_fkey` FOREIGN KEY (`orderdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOnCart` ADD CONSTRAINT `ItemOnCart_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOnCart` ADD CONSTRAINT `ItemOnCart_saleCarId_fkey` FOREIGN KEY (`saleCarId`) REFERENCES `saleCar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOnOrder` ADD CONSTRAINT `ItemOnOrder_saleCarId_fkey` FOREIGN KEY (`saleCarId`) REFERENCES `saleCar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOnOrder` ADD CONSTRAINT `ItemOnOrder_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOnOrder` ADD CONSTRAINT `ItemOnOrder_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
