/*
  Warnings:

  - You are about to alter the column `price` on the `car` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to alter the column `costPrice` on the `car` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.

*/
-- AlterTable
ALTER TABLE `car` MODIFY `price` DOUBLE NOT NULL,
    MODIFY `costPrice` DOUBLE NOT NULL;
