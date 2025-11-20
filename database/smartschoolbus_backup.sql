-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: smartschoolbus
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bus`
--

DROP TABLE IF EXISTS `bus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus` (
  `id` varchar(255) NOT NULL,
  `license_plate` varchar(20) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `speed` decimal(5,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `driver_id` varchar(255) DEFAULT NULL,
  `current_location_id` varchar(255) DEFAULT NULL,
  `route_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  UNIQUE KEY `driver_id` (`driver_id`),
  UNIQUE KEY `license_plate_2` (`license_plate`),
  UNIQUE KEY `license_plate_3` (`license_plate`),
  UNIQUE KEY `license_plate_4` (`license_plate`),
  UNIQUE KEY `license_plate_5` (`license_plate`),
  UNIQUE KEY `license_plate_6` (`license_plate`),
  UNIQUE KEY `license_plate_7` (`license_plate`),
  UNIQUE KEY `license_plate_8` (`license_plate`),
  UNIQUE KEY `license_plate_9` (`license_plate`),
  UNIQUE KEY `license_plate_10` (`license_plate`),
  UNIQUE KEY `license_plate_11` (`license_plate`),
  UNIQUE KEY `license_plate_12` (`license_plate`),
  UNIQUE KEY `license_plate_13` (`license_plate`),
  UNIQUE KEY `license_plate_14` (`license_plate`),
  UNIQUE KEY `license_plate_15` (`license_plate`),
  UNIQUE KEY `license_plate_16` (`license_plate`),
  UNIQUE KEY `license_plate_17` (`license_plate`),
  UNIQUE KEY `license_plate_18` (`license_plate`),
  UNIQUE KEY `license_plate_19` (`license_plate`),
  UNIQUE KEY `license_plate_20` (`license_plate`),
  UNIQUE KEY `license_plate_21` (`license_plate`),
  UNIQUE KEY `license_plate_22` (`license_plate`),
  UNIQUE KEY `license_plate_23` (`license_plate`),
  KEY `current_location_id` (`current_location_id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `bus_ibfk_11` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_14` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_17` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_2` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_20` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_23` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_26` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_29` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_32` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_35` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_38` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_41` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_44` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_47` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_5` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_50` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_53` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_56` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_59` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_62` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_64` FOREIGN KEY (`driver_id`) REFERENCES `driver` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_65` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_66` FOREIGN KEY (`route_id`) REFERENCES `route` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bus_ibfk_8` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_Bus_Location` FOREIGN KEY (`current_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus`
--

LOCK TABLES `bus` WRITE;
/*!40000 ALTER TABLE `bus` DISABLE KEYS */;
INSERT INTO `bus` VALUES ('B001','51A-12345',40,25.00,'ACTIVE','D001','L002','R001'),('B002','51A-67890',35,25.00,'ACTIVE','D002','L003','R002'),('B1763380000816','29A-211002',10,NULL,'ACTIVE','DRV1763381330912',NULL,'R002'),('B1763380421087','29A-2110021',1,NULL,'ACTIVE','DRV1763380451844',NULL,'R001'),('B1763380967499','29A-21133111',33,NULL,'ACTIVE','DRV1763441349717',NULL,'R002'),('B1763382353142','29A-2113311',22,NULL,'ACTIVE','DRV1763379969669',NULL,'R001'),('B1763446730882','8028',10,NULL,'ACTIVE','DRV1763446704478',NULL,NULL),('BUS1763290943704','29A-21134',232,NULL,'ACTIVE','DRV1762877651959',NULL,NULL);
/*!40000 ALTER TABLE `bus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver` (
  `id` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  `current_bus_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `license_number` (`license_number`),
  UNIQUE KEY `current_bus_id` (`current_bus_id`),
  UNIQUE KEY `license_number_2` (`license_number`),
  UNIQUE KEY `license_number_3` (`license_number`),
  UNIQUE KEY `license_number_4` (`license_number`),
  UNIQUE KEY `license_number_5` (`license_number`),
  UNIQUE KEY `license_number_6` (`license_number`),
  UNIQUE KEY `license_number_7` (`license_number`),
  UNIQUE KEY `license_number_8` (`license_number`),
  UNIQUE KEY `license_number_9` (`license_number`),
  UNIQUE KEY `license_number_10` (`license_number`),
  UNIQUE KEY `license_number_11` (`license_number`),
  UNIQUE KEY `license_number_12` (`license_number`),
  UNIQUE KEY `license_number_13` (`license_number`),
  UNIQUE KEY `license_number_14` (`license_number`),
  UNIQUE KEY `license_number_15` (`license_number`),
  UNIQUE KEY `license_number_16` (`license_number`),
  UNIQUE KEY `license_number_17` (`license_number`),
  UNIQUE KEY `license_number_18` (`license_number`),
  UNIQUE KEY `license_number_19` (`license_number`),
  UNIQUE KEY `license_number_20` (`license_number`),
  UNIQUE KEY `license_number_21` (`license_number`),
  UNIQUE KEY `license_number_22` (`license_number`),
  UNIQUE KEY `license_number_23` (`license_number`),
  CONSTRAINT `driver_ibfk_43` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `driver_ibfk_44` FOREIGN KEY (`current_bus_id`) REFERENCES `bus` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver`
--

LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` VALUES ('D001','Nguyễn Văn A','GPLX001','0901234567','OFF_DUTY','U002','B001'),('D002','Trần Văn B','GPLX002','0902345678','OFF_DUTY','U003','B002'),('DRV1762877651959','Phạm Văn D','B2-123456','0904567890','DRIVING','U1762877651768','BUS1763290943704'),('DRV1763379969669','TTTT','B2-1234511','124124422','DRIVING','U1763379969500','B1763382353142'),('DRV1763380451844','EWEq','B2-123455','1241244','DRIVING','U1763380451677','B1763380421087'),('DRV1763381330912','Lê Văn Kiên1','B2-12345611','09045678901','DRIVING','U1763381330748','B1763380000816'),('DRV1763440764602','Tài xế Test AI','GPLX_TEST_1763465963.97162','0912345678',NULL,'U1763440764324',NULL),('DRV1763441349717','12123','B1234555','43214124124','DRIVING','U1763441349516','B1763380967499'),('DRV1763445489315','New Driver','GPLX_TEST_1763445489040','090900900',NULL,'U1763445489131',NULL),('DRV1763446704478','TruongTrungKien','67A8028','038425522','DRIVING','U1763446704268','B1763446730882'),('DRV1763459123842','truongtrungkien14','A01','0384522883',NULL,'U1763459123623',NULL),('DRV1763563983627','213213','124r124','123124124',NULL,'U1763563983422',NULL);
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES ('L001','Trường Tiểu học A','123 Nguyễn Trãi',10.76262200,106.66017200,'SCHOOL'),('L002','Điểm đón 1','456 Lê Lợi',10.76300000,106.66100000,'PICKUP_POINT'),('L003','Điểm đón 2','789 Hai Bà Trưng',10.76400000,106.66200000,'PICKUP_POINT'),('L004','Điểm đón 3','321 Nguyễn Huệ',10.76500000,106.66300000,'PICKUP_POINT'),('L005','Bãi đỗ xe','Sân sau trường',10.76280000,106.66020000,'PARKING');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locationlog`
--

DROP TABLE IF EXISTS `locationlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locationlog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_id` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `speed` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bus_id` (`bus_id`),
  CONSTRAINT `locationlog_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `bus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locationlog`
--

LOCK TABLES `locationlog` WRITE;
/*!40000 ALTER TABLE `locationlog` DISABLE KEYS */;
INSERT INTO `locationlog` VALUES (1,'B001','2025-10-19 23:45:00',10.76300000,106.66100000,25.50),(2,'B001','2025-10-19 23:50:00',10.76400000,106.66200000,28.30),(3,'B001','2025-10-19 23:55:00',10.76500000,106.66300000,30.00),(4,'B001','2025-10-20 00:00:00',10.76280000,106.66020000,0.00),(5,'B002','2025-10-19 23:50:00',10.76400000,106.66200000,26.50),(6,'B002','2025-10-19 23:55:00',10.76500000,106.66300000,29.00),(7,'B002','2025-10-20 00:00:00',10.76280000,106.66020000,0.00);
/*!40000 ALTER TABLE `locationlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_type` varchar(50) DEFAULT NULL,
  `sender_id` varchar(255) DEFAULT NULL,
  `recipient_id` varchar(255) NOT NULL,
  `message_content` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_Message_Recipient` (`recipient_id`),
  KEY `FK_Message_Sender` (`sender_id`),
  CONSTRAINT `FK_Message_Recipient` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_Message_Sender` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (1,'DRIVER','U002','U005','Xe sẽ đến điểm đón trong 5 phút.','2025-10-19 23:40:00',1),(2,'PARENT','U005','U002','Con em hôm nay nghỉ học.','2025-10-19 23:30:00',1),(3,'SYSTEM','SYSTEM','U006','Xe buýt BUS001 đã đến điểm đón.','2025-10-19 23:45:00',1),(4,'DRIVER','U003','U008','Con bạn đã lên xe an toàn.','2025-10-19 23:50:00',0),(5,'SYSTEM','SYSTEM','U009','Xe buýt BUS002 sẽ đến trong 10 phút.','2025-10-19 23:55:00',0);
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parent`
--

DROP TABLE IF EXISTS `parent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parent` (
  `id` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `parent_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent`
--

LOCK TABLES `parent` WRITE;
/*!40000 ALTER TABLE `parent` DISABLE KEYS */;
INSERT INTO `parent` VALUES ('P001','Trần Thị B','0907654321','123 Nguyễn Trãi','U005'),('P002','Nguyễn Văn D','0908765432','456 Lê Lợi','U006'),('P003','Lê Thị E','0909876543','789 Hai Bà Trưng','U007'),('P004','Phạm Văn F','0912345678','321 Nguyễn Huệ','U008'),('P005','Hoàng Thị G','0913456789','654 Điện Biên Phủ','U009'),('P1763557950504','TruongTrungKien','123124124','377 Bạch Đằng','U1763557950504'),('P1763564028794',NULL,'1234124',NULL,'U1763564028794'),('P1763564217865','TruongT','21133411',NULL,'U1763564217865');
/*!40000 ALTER TABLE `parent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route`
--

DROP TABLE IF EXISTS `route`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route` (
  `id` varchar(255) NOT NULL,
  `route_name` varchar(100) NOT NULL,
  `estimated_duration` int DEFAULT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route`
--

LOCK TABLES `route` WRITE;
/*!40000 ALTER TABLE `route` DISABLE KEYS */;
INSERT INTO `route` VALUES ('R001','Tuyến Sáng Số 1',45,15.50),('R002','Tuyến Sáng Số 2',50,17.00);
/*!40000 ALTER TABLE `route` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_stop`
--

DROP TABLE IF EXISTS `route_stop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_stop` (
  `route_id` varchar(255) NOT NULL,
  `location_id` varchar(255) NOT NULL,
  `stop_order` int NOT NULL,
  PRIMARY KEY (`route_id`,`location_id`),
  KEY `FK_RouteStop_Location` (`location_id`),
  CONSTRAINT `FK_RouteStop_Location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_RouteStop_Route` FOREIGN KEY (`route_id`) REFERENCES `route` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_stop`
--

LOCK TABLES `route_stop` WRITE;
/*!40000 ALTER TABLE `route_stop` DISABLE KEYS */;
INSERT INTO `route_stop` VALUES ('R001','L001',4),('R001','L002',1),('R001','L003',2),('R001','L004',3),('R002','L001',3),('R002','L003',1),('R002','L004',2);
/*!40000 ALTER TABLE `route_stop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_waypoint`
--

DROP TABLE IF EXISTS `route_waypoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_waypoint` (
  `id` varchar(255) NOT NULL,
  `route_id` varchar(255) NOT NULL,
  `sequence` int NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `stop_name` varchar(255) DEFAULT NULL,
  `is_stop` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `route_waypoint_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `route` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_waypoint`
--

LOCK TABLES `route_waypoint` WRITE;
/*!40000 ALTER TABLE `route_waypoint` DISABLE KEYS */;
/*!40000 ALTER TABLE `route_waypoint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `id` varchar(255) NOT NULL,
  `bus_id` varchar(255) NOT NULL,
  `route_id` varchar(255) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('PLANNED','ONGOING','COMPLETED','CANCELED') DEFAULT 'PLANNED',
  PRIMARY KEY (`id`),
  KEY `FK_Schedule_Bus` (`bus_id`),
  KEY `FK_Schedule_Route` (`route_id`),
  CONSTRAINT `FK_Schedule_Bus` FOREIGN KEY (`bus_id`) REFERENCES `bus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_Schedule_Route` FOREIGN KEY (`route_id`) REFERENCES `route` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES ('6682e68a-10f5-4b7a-a603-2e16664dcb18','B002','R002','2025-11-18 15:31:00','2025-11-18 15:31:00','COMPLETED'),('SCH001','B001','R001','2025-10-20 06:30:00','2025-10-20 07:15:00','PLANNED'),('SCH002','B002','R002','2025-10-20 06:45:00','2025-10-20 07:30:00','PLANNED'),('SCH003','B001','R001','2025-10-21 06:30:00','2025-10-21 07:15:00','PLANNED');
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_student`
--

DROP TABLE IF EXISTS `schedule_student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_student` (
  `schedule_id` varchar(255) NOT NULL,
  `student_id` varchar(255) NOT NULL,
  `pickup_status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`schedule_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `schedule_student_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedule_student_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_student`
--

LOCK TABLES `schedule_student` WRITE;
/*!40000 ALTER TABLE `schedule_student` DISABLE KEYS */;
INSERT INTO `schedule_student` VALUES ('SCH001','S001','PICKED_UP'),('SCH001','S002','PICKED_UP'),('SCH001','S003','MISSED'),('SCH002','S004','PICKED_UP'),('SCH002','S005','PICKED_UP'),('SCH002','S006','PICKED_UP');
/*!40000 ALTER TABLE `schedule_student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `class` varchar(255) DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `parent_contact` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('IN_BUS','WAITING','ABSENT') DEFAULT 'WAITING',
  `parent_id` varchar(255) NOT NULL,
  `assigned_bus_id` varchar(255) DEFAULT NULL,
  `pickup_location_id` varchar(255) DEFAULT NULL,
  `dropoff_location_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `assigned_bus_id` (`assigned_bus_id`),
  KEY `pickup_location_id` (`pickup_location_id`),
  KEY `dropoff_location_id` (`dropoff_location_id`),
  CONSTRAINT `FK_Student_Dropoff` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_Student_Pickup` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_11` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_12` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_15` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_16` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_19` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_20` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_23` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_24` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_27` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_28` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_3` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_31` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_32` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_35` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_36` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_39` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_4` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_40` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_43` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_44` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_47` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_48` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_51` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_52` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_55` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_56` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_59` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_60` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_63` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_64` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_67` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_68` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_7` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_71` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_72` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_75` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_76` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_79` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_8` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_80` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_81` FOREIGN KEY (`parent_id`) REFERENCES `parent` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_82` FOREIGN KEY (`assigned_bus_id`) REFERENCES `bus` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_83` FOREIGN KEY (`pickup_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_ibfk_84` FOREIGN KEY (`dropoff_location_id`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES ('S001','Nguyễn Minh An','1A','Lớp 1','0911111111',NULL,'WAITING','P003','B001','L002','L001'),('S002','Trần Thùy Dung','3B','Lớp 3','0911111111',NULL,'WAITING','P005','B001','L002','L001'),('S003','Lê Hoàng Long','2A','Lớp 2','0922222222','3123','WAITING','P002','B001','L003','L001'),('S004','Phạm Thị Mai','4C','Lớp 4','0933333333',NULL,'WAITING','P003','B001','L004','L001'),('S005','Bùi Quang Huy','2B','Lớp 2','0944444444','11','WAITING','P002','B002','L003','L001'),('S006','Phạm Thu Hà','2C','Lớp 2','0944444444',NULL,'WAITING','P004','B002','L003','L001');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `username_21` (`username`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `username_22` (`username`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `username_23` (`username`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `username_24` (`username`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `username_25` (`username`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `username_26` (`username`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `username_27` (`username`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `username_28` (`username`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `username_29` (`username`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `username_30` (`username`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `username_31` (`username`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `username_32` (`username`),
  UNIQUE KEY `email_31` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('SYSTEM','system','nopass','system@school.com','admin'),('U001','admin1','123456','admin@school.com','admin'),('U002','driver1_up','123456','driver1@school.com','driver'),('U003','driver2','123456','driver2@school.com','driver'),('U004','driver3','123456','driver3@school.com','driver'),('U005','parent1','123456','parent1@gmail.com','parent'),('U006','parent2','123456','parent2@gmail.com','parent'),('U007','parent3','123456','parent3@gmail.com','parent'),('U008','parent4','123456','parent4@gmail.com','parent'),('U009','parent5','123456','parent5@gmail.com','parent'),('U1762877651768','kien','$2b$10$57J3AA9qMsijQFF8nkBpTuiyMT.pg2puadqFLO1sQNCPqeUEeP.fK','0904567890@driver.com','driver'),('U1763379969500','kien22111','$2b$10$8W9iG8CA25GEGOAgIDksMu07HnJTz1y8RSQGlQrQaCY.fAh8m9TIe','124124422@driver.com','driver'),('U1763380451677','ki1','$2b$10$E0sBvO0.anfP5YyyvsgqGOmsLikdW/TLfToUPNhdPPtKhzsJtsmp.','1241244@driver.com','driver'),('U1763380945613','ki','$2b$10$tFAK6FpjeCr01V1zrSA4gupcbuazDCGNAVeAb6Aghj7jb5ZTX.wUG','09045678903@driver.com','driver'),('U1763381330748','kien3123','$2b$10$pERbg6brBF5zreE2bPn9KOzd2gvntg/dK6MMHJ2AG.EA4NPIZ.0iK','09045678901@driver.com','driver'),('U1763440764324','testdriver_ai','$2b$10$NalDbZfW8RanSm.MIcebsO6TE7mJjTjP1pbi7.xR2mAoIKcpTQlw.','0912345678@driver.com','driver'),('U1763441349516','hqbao','$2b$10$m.c4QWhFlgn/leCvWf3QmukSWoOFtp0xp5vQymzJfZcUDHnH5FVd2','hqbao@driver.com','driver'),('U1763445489131','newdrv1','$2b$10$4TRqWoNZP7i1zWvNuxU2NO0E8rWuL3.kdmQSrZD5cQDzzwfwa7UIy','newdrv1@example.com','driver'),('U1763446704268','kien123','$2b$10$BLAMnNfbr.o3FFty2ESbJ.5hSsS645j57KP6v8oXl9MhjZc63DW8y','kien123@school.com','driver'),('U1763459123623','trungkien','$2b$10$YRiTmwkZsnTm3ar4axlyluHeB2ZvtwDVGN5D5ybIJAQ.W6khToxse','trungkien@school.com','driver'),('U1763557950504','kien112','1400','kien112@parent.com','parent'),('U1763563983422','ewqeqw','$2b$10$Y3BoT2X4/SD86Co7raTnG.BtPdcxUW7dsf/5zx1QqKo2KBcv57VmO','wqeqw@school.com','driver'),('U1763564028794','trungkien112223','14092','trungkien112223@school.com','parent'),('U1763564217865','qwera','1422','qwera@school.com','parent');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-19 22:02:18
