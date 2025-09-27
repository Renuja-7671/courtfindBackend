-- CreateTable
CREATE TABLE `users` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(20) NULL,
    `firstName` VARCHAR(20) NOT NULL,
    `lastName` VARCHAR(20) NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `country` VARCHAR(20) NOT NULL,
    `province` VARCHAR(20) NOT NULL,
    `email` VARCHAR(60) NOT NULL,
    `zip` VARCHAR(5) NOT NULL,
    `address` VARCHAR(90) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `resetToken` VARCHAR(255) NULL,
    `resetTokenExpires` VARCHAR(255) NULL,
    `profileImage` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arenas` (
    `arenaId` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` INTEGER NULL,
    `name` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL DEFAULT 'Sri Lanka',
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `arenaStatus` ENUM('Approved', 'Declined', 'Pending') NULL DEFAULT 'Pending',
    `paidStatus` ENUM('Paid', 'Pending') NULL DEFAULT 'Pending',
    `declinationReason` TEXT NULL,
    `invoiceUrl` TEXT NULL,
    `amount` DECIMAL(10, 2) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `owner_id`(`owner_id`),
    PRIMARY KEY (`arenaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sports` (
    `sportId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `noOfPlayer` INTEGER NULL,
    `sportType` VARCHAR(25) NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`sportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courts` (
    `courtId` INTEGER NOT NULL AUTO_INCREMENT,
    `arenaId` INTEGER NULL,
    `name` VARCHAR(100) NULL,
    `size` INTEGER NULL,
    `hourly_rate` DECIMAL(10, 2) NULL,
    `sport` VARCHAR(50) NULL,
    `images` TEXT NULL,
    `availability` TEXT NULL,

    INDEX `arenaId`(`arenaId`),
    PRIMARY KEY (`courtId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `bookingId` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NULL,
    `courtId` INTEGER NULL,
    `ownerId` INTEGER NULL,
    `arenaId` INTEGER NULL,
    `booking_date` DATE NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `total_price` DECIMAL(10, 2) NULL,
    `payment_status` ENUM('Pending', 'Paid', 'Failed') NULL DEFAULT 'Pending',
    `status` ENUM('Booked', 'Cancelled', 'Completed') NULL DEFAULT 'Booked',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `invoices_url` TEXT NULL,
    `cancellationReason` TEXT NULL,

    INDEX `arenaId`(`arenaId`),
    INDEX `courtId`(`courtId`),
    INDEX `ownerId`(`ownerId`),
    INDEX `playerId`(`playerId`),
    PRIMARY KEY (`bookingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `paymentId` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NULL,
    `ownerId` INTEGER NULL,
    `paymentDesc` VARCHAR(100) NULL,
    `amount` DECIMAL(10, 2) NULL,
    `payment_method` VARCHAR(50) NULL,
    `arenaId` INTEGER NULL,
    `playerId` INTEGER NULL,
    `paid_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `arenaId`(`arenaId`),
    INDEX `bookingId`(`bookingId`),
    INDEX `ownerId`(`ownerId`),
    INDEX `playerId`(`playerId`),
    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity_name` VARCHAR(255) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `reviewId` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NULL,
    `arenaId` INTEGER NULL,
    `courtId` INTEGER NULL,
    `rating` INTEGER NULL,
    `comment` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `arenaId`(`arenaId`),
    INDEX `courtId`(`courtId`),
    INDEX `playerId`(`playerId`),
    PRIMARY KEY (`reviewId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `email` VARCHAR(50) NULL,
    `phone` VARCHAR(10) NULL,
    `message` TEXT NULL,
    `status` VARCHAR(25) NULL DEFAULT 'Need Review',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revenue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity_name` VARCHAR(255) NULL,
    `amount_paid` DECIMAL(10, 2) NULL,
    `paid_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `user_id` INTEGER NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `login_time` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `arenas` ADD CONSTRAINT `arenas_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `courts` ADD CONSTRAINT `courts_ibfk_1` FOREIGN KEY (`arenaId`) REFERENCES `arenas`(`arenaId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`playerId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`courtId`) REFERENCES `courts`(`courtId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`ownerId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`arenaId`) REFERENCES `arenas`(`arenaId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`bookingId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`ownerId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`playerId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_ibfk_4` FOREIGN KEY (`arenaId`) REFERENCES `arenas`(`arenaId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`playerId`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`arenaId`) REFERENCES `arenas`(`arenaId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`courtId`) REFERENCES `courts`(`courtId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `revenue` ADD CONSTRAINT `revenue_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
