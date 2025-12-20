-- CreateTable
CREATE TABLE `payment_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NULL,
    `arenaId` INTEGER NULL,
    `paymentId` VARCHAR(100) NULL,
    `orderId` VARCHAR(100) NULL,
    `amount` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(10) NULL,
    `method` VARCHAR(50) NULL,
    `cardHolderName` VARCHAR(100) NULL,
    `cardNo` VARCHAR(50) NULL,
    `status` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bookingId`(`bookingId`),
    INDEX `arenaId`(`arenaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_details` ADD CONSTRAINT `payment_details_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`bookingId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment_details` ADD CONSTRAINT `payment_details_arenaId_fkey` FOREIGN KEY (`arenaId`) REFERENCES `arenas`(`arenaId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
