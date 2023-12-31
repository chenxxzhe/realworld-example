DROP DATABASE IF EXISTS `realworld`;

CREATE DATABASE IF NOT EXISTS `realworld` DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `realworld`;

DROP TABLE IF EXISTS `user`;

CREATE TABLE
  `user` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deleted` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '删除标记 0: 未删除; 1: 已删除',
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(20) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `bio` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '简介',
    `image` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '头像',
    PRIMARY KEY `pk_id` (`id`),
    UNIQUE INDEX `u_username` (`username`),
    UNIQUE INDEX `u_email` (`email`)
  ) ENGINE = InnoDB;

DROP TABLE IF EXISTS `article`;

CREATE TABLE
  `article` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deleted` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '删除标记 0: 未删除; 1: 已删除',
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '文章简介',
    `body` VARCHAR(8000) NOT NULL DEFAULT '' COMMENT '正文',
    `authorId` INT UNSIGNED NOT NULL,
    PRIMARY KEY `pk_id` (`id`),
    UNIQUE INDEX `u_slug` (`slug`),
    CONSTRAINT `fk_article_user` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
  ) ENGINE = InnoDB;

DROP TABLE IF EXISTS `comment`;

CREATE TABLE
  `comment` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deleted` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '删除标记 0: 未删除; 1: 已删除',
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `body` VARCHAR(800) NOT NULL DEFAULT '' COMMENT '正文',
    `articleId` INT UNSIGNED NOT NULL,
    `authorId` INT UNSIGNED NOT NULL,
    PRIMARY KEY `pk_id` (`id`),
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT `fk_comment_article` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
  ) ENGINE = InnoDB;

DROP TABLE IF EXISTS `tag`;

CREATE TABLE
  `tag` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deleted` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '删除标记 0: 未删除; 1: 已删除',
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `title` VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY `pk_id` (`id`),
    UNIQUE INDEX `u_title` (`title`)
  ) ENGINE = InnoDB;

-- 用户 关注 用户
DROP TABLE IF EXISTS `ref_follow`;

CREATE TABLE
  `ref_follow` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deleted` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '删除标记 0: 未删除; 1: 已删除',
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `target` INT UNSIGNED NOT NULL,
    `follower` INT UNSIGNED NOT NULL,
    `status` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '关注标记 0: 未关注; 1: 已关注',
    PRIMARY KEY `pk_id` (`id`),
    UNIQUE INDEX `u_follow_user_user` (`target`, `follower`),
    CONSTRAINT `fk_follow_target` FOREIGN KEY (`target`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT `fk_follow_follower` FOREIGN KEY (`follower`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 用户 收藏 文章
DROP TABLE IF EXISTS `ref_favorite`;

CREATE TABLE
  `ref_favorite` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deleted` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '删除标记 0: 未删除; 1: 已删除',
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `userId` INT UNSIGNED NOT NULL,
    `articleId` INT UNSIGNED NOT NULL,
    `status` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '收藏标记 0: 未收藏; 1: 已收藏',
    PRIMARY KEY `pk_id` (`id`),
    UNIQUE INDEX `u_favorite_user_article` (`userId`, `articleId`),
    CONSTRAINT `fk_favorite_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT `fk_favorite_article` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
  ) ENGINE = InnoDB;

-- 文章 - 标签
DROP TABLE IF EXISTS `ref_tag_article`;

CREATE TABLE
  `ref_tag_article` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `deleted` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '删除标记 0: 未删除; 1: 已删除',
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `tagId` INT UNSIGNED NOT NULL,
    `articleId` INT UNSIGNED NOT NULL,
    `status` TINYINT (4) NOT NULL DEFAULT 0 COMMENT '标签关联标记 0: 未关联; 1: 已关联',
    PRIMARY KEY `pk_id` (`id`),
    UNIQUE INDEX `u_tag_article` (`tagId`, `articleId`),
    CONSTRAINT `fk_tag_article_article` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT `fk_tag_article_tag` FOREIGN KEY (`tagId`) REFERENCES `tag` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
  ) ENGINE = InnoDB;