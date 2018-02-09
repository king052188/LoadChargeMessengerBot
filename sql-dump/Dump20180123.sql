CREATE DATABASE  IF NOT EXISTS `kpadb_l4d` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `kpadb_l4d`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: kpadb_l4d
-- ------------------------------------------------------
-- Server version	5.7.20-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_dealers`
--

DROP TABLE IF EXISTS `tbl_dealers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_dealers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `facebook_id` varchar(50) DEFAULT 'N/A',
  `firstname` varchar(20) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `type` tinyint(4) DEFAULT '0',
  `status` tinyint(4) DEFAULT '0',
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_dealers`
--

LOCK TABLES `tbl_dealers` WRITE;
/*!40000 ALTER TABLE `tbl_dealers` DISABLE KEYS */;
INSERT INTO `tbl_dealers` VALUES (9,'Xfsdf',NULL,NULL,'09177715382',NULL,0,0,'2018-01-22 05:44:52','2018-01-22 05:44:52'),(12,'1801668056570291',NULL,NULL,'09177715380',NULL,0,0,'2018-01-22 07:04:47','2018-01-22 07:04:47');
/*!40000 ALTER TABLE `tbl_dealers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_dealers_type`
--

DROP TABLE IF EXISTS `tbl_dealers_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_dealers_type` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `ontop_percentage` decimal(18,4) DEFAULT '0.0000',
  `discount_percentage` decimal(18,4) DEFAULT '0.0000',
  `price` decimal(18,4) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_dealers_type`
--

LOCK TABLES `tbl_dealers_type` WRITE;
/*!40000 ALTER TABLE `tbl_dealers_type` DISABLE KEYS */;
INSERT INTO `tbl_dealers_type` VALUES (1,'CITY',NULL,0.0700,0.0000,1800.0000,NULL,NULL),(2,'MOBILE',NULL,0.0600,0.0000,1200.0000,NULL,NULL),(3,'DEALER',NULL,0.0500,0.0000,600.0000,NULL,NULL),(4,'RESELLER',NULL,0.0400,0.0000,300.0000,NULL,NULL);
/*!40000 ALTER TABLE `tbl_dealers_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_sms_queue`
--

DROP TABLE IF EXISTS `tbl_sms_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_sms_queue` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `company_uid` int(11) DEFAULT NULL,
  `user_id` varchar(11) DEFAULT NULL,
  `user_ip_address` varchar(20) DEFAULT NULL,
  `mobile` varchar(11) DEFAULT NULL,
  `message` longtext,
  `status` tinyint(4) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_sms_queue`
--

LOCK TABLES `tbl_sms_queue` WRITE;
/*!40000 ALTER TABLE `tbl_sms_queue` DISABLE KEYS */;
INSERT INTO `tbl_sms_queue` VALUES (29,4,'09177715380','0','09177715380','PollyStore verification code: 202375. Please do not share this code with anyone. Thank You!',0,'2018-01-22 06:57:35','2018-01-22 06:57:35'),(30,4,'09177715380','0','09177715380','PollyStore verification code: 333698. Please do not share this code with anyone. Thank You!',0,'2018-01-22 07:04:21','2018-01-22 07:04:21'),(31,4,'09177715380','0','09177715380','Welcome to PollyStore, you are now successfully registered.',0,'2018-01-22 07:04:47','2018-01-22 07:04:47');
/*!40000 ALTER TABLE `tbl_sms_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_wallet`
--

DROP TABLE IF EXISTS `tbl_wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_wallet` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `dealer_id` int(11) DEFAULT NULL,
  `transaction` varchar(60) DEFAULT NULL,
  `description` text,
  `amount` decimal(18,2) DEFAULT NULL,
  `type` tinyint(4) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_wallet`
--

LOCK TABLES `tbl_wallet` WRITE;
/*!40000 ALTER TABLE `tbl_wallet` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_wallet` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-23 21:25:30
