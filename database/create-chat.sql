-- database/create-chat.sql
-- Create chat_message table used by backend ChatMessage model
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `chat_message`;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE IF NOT EXISTS `chat_message` (
  `id` VARCHAR(255) NOT NULL,
  `sender_id` VARCHAR(255) NOT NULL,
  `receiver_id` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_idx` (`sender_id`),
  KEY `receiver_idx` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Optionally add foreign keys if `user` table exists and IDs match
-- ALTER TABLE `chat_message` ADD CONSTRAINT `fk_chat_sender` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE `chat_message` ADD CONSTRAINT `fk_chat_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
