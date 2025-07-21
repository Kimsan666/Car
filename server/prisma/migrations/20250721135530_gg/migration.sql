-- AlterTable
ALTER TABLE `salecar` ADD COLUMN `carId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `saleCar` ADD CONSTRAINT `saleCar_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `Car`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
