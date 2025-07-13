/*
  Warnings:

  - Added the required column `sss` to the `ItemOnIputCar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `itemoniputcar` ADD COLUMN `sss` INTEGER NOT NULL;
