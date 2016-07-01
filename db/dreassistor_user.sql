-- MySQL dump 10.13  Distrib 5.7.9, for osx10.9 (x86_64)
--
-- Host: localhost    Database: dreassistor
-- ------------------------------------------------------
-- Server version	5.7.12

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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(100) DEFAULT NULL,
  `email` varchar(300) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0:normal; -1:deleted;',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (2,'a','2016-06-28 19:54:51','a','a@a.com',0),(3,'b','2016-06-28 20:04:57','b','b@b.com',0),(4,'c','2016-06-28 20:06:46','c','c@c.com',0),(16,'d','2016-06-28 21:52:37','d','d@d.com',0),(18,'e','2016-06-28 21:56:01','e','e@e.com',0),(21,'f','2016-06-29 22:54:01','f','f@f.com',0),(23,'g','2016-06-29 22:54:48','g','g@g.com',0),(24,'h','2016-06-29 23:05:23','h','h@h.com',0),(25,'i','2016-06-30 11:29:57','i','i@i.com',0),(29,'j','2016-06-30 12:42:51','j','j@j.com',0),(34,'k','2016-06-30 13:11:36','k','k@k.com',0),(35,'l','2016-06-30 13:12:03','l','l@l.com',0),(36,'m','2016-06-30 13:12:44','m','m@m.com',0),(37,'n','2016-06-30 13:13:45','n','n@n.com',0),(38,'o','2016-06-30 13:15:25','o','o@o.com',0),(39,'p','2016-06-30 13:17:59','p','p@p.com',0),(40,'q','2016-06-30 13:23:54','q','q@q.com',0),(41,'r','2016-06-30 13:26:12','r','r@r.com',0),(42,'s','2016-06-30 13:39:23','s','s@s.com',0),(46,'t','2016-06-30 13:45:19','t','t@t.com',0),(47,'u','2016-06-30 13:47:50','u','u@u.com',0),(49,'v','2016-06-30 13:53:01','v','v@v.com',0),(70,'w','2016-06-30 21:38:00','w','w@w.com',0),(71,'x','2016-06-30 21:49:06','x','x@x.com',0),(72,'y','2016-06-30 21:53:31','y','y@y.com',0),(73,'z','2016-06-30 21:55:45','z','z@z.com',0),(75,'aa','2016-06-30 22:01:17','aa','aa@aa.com',0),(78,'bb','2016-07-01 09:36:31','bb','bb@bb.com',0),(81,'cc','2016-07-01 12:08:35','cc','cc@cc.com',0),(83,'dd','2016-07-01 12:12:17','dd','dd@dd.com',0),(88,'ee','2016-07-01 13:55:55','ee','ee@ee.com',0),(98,'ff','2016-07-01 14:27:38','ff','ff@ff.com',0),(100,'gg','2016-07-01 14:28:33','gg','gg@gg.com',0),(101,'hh','2016-07-01 15:33:47','hh','hh@hh.com',0),(105,'ii','2016-07-01 16:12:08','ii','ii@ii.com',0),(108,'jj','2016-07-01 16:12:58','jj','jj@jj.com',0);
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

-- Dump completed on 2016-07-01 16:49:40