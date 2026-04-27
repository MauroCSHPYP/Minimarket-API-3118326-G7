-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: minimarket_db
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '9e59ef94-f164-11f0-98b0-9c6b000c5d73:1-169';

--
-- Table structure for table `detalle_ticket`
--

DROP TABLE IF EXISTS `detalle_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ticket` (
  `ID_DETALLE_TICKET` int NOT NULL AUTO_INCREMENT,
  `ID_TICKET` int DEFAULT NULL,
  `ID_ITEM` int DEFAULT NULL,
  `CANTIDAD` int DEFAULT NULL,
  PRIMARY KEY (`ID_DETALLE_TICKET`),
  KEY `FK_ID_TICKET_idx` (`ID_TICKET`),
  KEY `FK_CANTIDAD_INVENTARIO_idx` (`ID_ITEM`),
  CONSTRAINT `FK_ID_TICKET` FOREIGN KEY (`ID_TICKET`) REFERENCES `ticket` (`ID_TICKET`),
  CONSTRAINT `FK_PRODUCTO_INVENTARIO` FOREIGN KEY (`ID_ITEM`) REFERENCES `producto` (`ID_PRODUCTO`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ticket`
--

LOCK TABLES `detalle_ticket` WRITE;
/*!40000 ALTER TABLE `detalle_ticket` DISABLE KEYS */;
INSERT INTO `detalle_ticket` VALUES (6,6,1,4),(7,7,1,4),(8,7,2,2),(9,8,1,4),(10,8,2,2),(11,9,1,4),(12,9,2,2),(13,10,1,4),(14,10,2,2),(15,11,1,4),(16,11,2,2),(17,12,1,4),(18,12,2,2),(19,13,2,4),(20,14,2,4),(21,15,2,4),(22,16,2,4);
/*!40000 ALTER TABLE `detalle_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `ID_INVENTARIO` int NOT NULL AUTO_INCREMENT,
  `ID_PRODUCTO` int DEFAULT NULL,
  `CANTIDAD` int NOT NULL,
  PRIMARY KEY (`ID_INVENTARIO`),
  KEY `FK_PRODUCTO_idx` (`ID_PRODUCTO`),
  CONSTRAINT `FK_PRODUCTO` FOREIGN KEY (`ID_PRODUCTO`) REFERENCES `producto` (`ID_PRODUCTO`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,2,27),(2,1,72);
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `ID_MARCA` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_MARCA` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID_MARCA`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES (1,'Colgate'),(2,'Guadalupe'),(4,'Aromatel'),(5,'Head & Shoulders'),(6,'Noel'),(7,'Bombril'),(8,'Doritos');
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `ID_PRODUCTO` int NOT NULL AUTO_INCREMENT,
  `ID_TIPO_PRODUCTO` int DEFAULT NULL,
  `ID_MARCA` int DEFAULT NULL,
  `NOMBRE_PRODUCTO` varchar(255) DEFAULT NULL,
  `DESCRIPCION_PRODUCTO` varchar(255) DEFAULT NULL,
  `VALOR` float DEFAULT NULL,
  PRIMARY KEY (`ID_PRODUCTO`),
  KEY `FK_TIPO_PRODUCTO_idx` (`ID_TIPO_PRODUCTO`),
  KEY `FK_MARCA_idx` (`ID_MARCA`),
  CONSTRAINT `FK_MARCA` FOREIGN KEY (`ID_MARCA`) REFERENCES `marca` (`ID_MARCA`),
  CONSTRAINT `FK_TIPO_PRODUCTO` FOREIGN KEY (`ID_TIPO_PRODUCTO`) REFERENCES `tipo_producto` (`ID_TIPO_PRODUCTO`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,1,4,'Postobón tamaño familiar','Postobón 2 litros - sabor manzana.',3000),(2,2,7,'Esponja de brillo','Esponja de brillo - bombril - promoción 2x1',400);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `ID_ROL` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_ROL` varchar(45) DEFAULT NULL,
  `DESCRIPCION_ROL` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID_ROL`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador','Administrador del sistema'),(2,'Cajero','Empleado que usa el cajero');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `ID_TICKET` int NOT NULL AUTO_INCREMENT,
  `ID_USUARIO` int DEFAULT NULL,
  `NO_TICKET` varchar(255) DEFAULT NULL,
  `FECHA_COMPRA` datetime DEFAULT CURRENT_TIMESTAMP,
  `TOTAL` float DEFAULT NULL,
  PRIMARY KEY (`ID_TICKET`),
  KEY `FK_ID_USUARIO_idx` (`ID_USUARIO`),
  CONSTRAINT `FK_ID_USUARIO` FOREIGN KEY (`ID_USUARIO`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES (6,1,'1771862731631','2026-02-23 11:05:35',12000),(7,1,'1771862731631','2026-02-23 11:06:57',24800),(8,2,'1771862914783','2026-02-23 11:08:37',12800),(9,2,'1771862914783','2026-02-23 11:08:42',25600),(10,1,'1771863829063','2026-02-23 11:23:54',12800),(11,2,'1771863829063','2026-02-23 11:23:59',25600),(12,2,'1771863829063','2026-02-23 11:24:12',38400),(13,1,'1771865350731','2026-02-23 11:49:11',1600),(14,1,'1771865355338','2026-02-23 11:49:15',1600),(15,1,'1771865359719','2026-02-23 11:49:20',1600),(16,1,'1771865360307','2026-02-23 11:49:20',1600);
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_documento`
--

DROP TABLE IF EXISTS `tipo_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_documento` (
  `ID_TIPO_DOCUMENTO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_DOCUMENTO` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID_TIPO_DOCUMENTO`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_documento`
--

LOCK TABLES `tipo_documento` WRITE;
/*!40000 ALTER TABLE `tipo_documento` DISABLE KEYS */;
INSERT INTO `tipo_documento` VALUES (1,'Cédula de ciudadanía'),(2,'Cédula de extranjería'),(3,'Pasaporte'),(4,'PPT (Permiso temporal de trabajo)');
/*!40000 ALTER TABLE `tipo_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_producto`
--

DROP TABLE IF EXISTS `tipo_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_producto` (
  `ID_TIPO_PRODUCTO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_TIPO_PRODUCTO` varchar(255) DEFAULT NULL,
  `DESCRIPCION_TIPO_PRODUCTO` varchar(255) DEFAULT NULL,
  `ID_TIPO_UNIDAD` int DEFAULT NULL,
  PRIMARY KEY (`ID_TIPO_PRODUCTO`),
  KEY `FK_TIPO_UNIDAD_idx` (`ID_TIPO_UNIDAD`),
  CONSTRAINT `FK_TIPO_UNIDAD` FOREIGN KEY (`ID_TIPO_UNIDAD`) REFERENCES `tipo_unidad` (`ID_TIPO_UNIDAD`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_producto`
--

LOCK TABLES `tipo_producto` WRITE;
/*!40000 ALTER TABLE `tipo_producto` DISABLE KEYS */;
INSERT INTO `tipo_producto` VALUES (1,'Gaseosas','Bebidas gaseosas',2),(2,'Aseo','Todo tipo de productos de aseo.',1);
/*!40000 ALTER TABLE `tipo_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_unidad`
--

DROP TABLE IF EXISTS `tipo_unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_unidad` (
  `ID_TIPO_UNIDAD` int NOT NULL AUTO_INCREMENT,
  `NOMBRE_UNIDAD` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID_TIPO_UNIDAD`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_unidad`
--

LOCK TABLES `tipo_unidad` WRITE;
/*!40000 ALTER TABLE `tipo_unidad` DISABLE KEYS */;
INSERT INTO `tipo_unidad` VALUES (1,'Gramos'),(2,'Litros'),(3,'Kilogramos');
/*!40000 ALTER TABLE `tipo_unidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `ID_USUARIO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(255) DEFAULT NULL,
  `APELLIDOS` varchar(255) DEFAULT NULL,
  `FECHA_NACIMIENTO` date DEFAULT NULL,
  `ID_TIPO_DOCUMENTO` int DEFAULT NULL,
  `ID_ROL` int DEFAULT NULL,
  `NUMERO_IDENTIFICACION` varchar(255) DEFAULT NULL,
  `ALIAS` varchar(45) NOT NULL,
  `CONTRASENA` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID_USUARIO`),
  KEY `FK_TIPO_DOC_idx` (`ID_TIPO_DOCUMENTO`),
  KEY `FK_ROL_idx` (`ID_ROL`),
  CONSTRAINT `FK_ROL` FOREIGN KEY (`ID_ROL`) REFERENCES `rol` (`ID_ROL`),
  CONSTRAINT `FK_TIPO_DOC` FOREIGN KEY (`ID_TIPO_DOCUMENTO`) REFERENCES `tipo_documento` (`ID_TIPO_DOCUMENTO`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Mauricio','Arias Olave','1992-03-10',1,1,'1022980373','admin','admin'),(2,'Javier Arturo','Contreras Jimenez','1999-01-10',1,2,'40548971','jav035','jacobo21');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-27 10:02:48
