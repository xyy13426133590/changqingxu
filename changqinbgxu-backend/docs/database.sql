-- ============================================
-- 长情许交友小程序数据库初始化脚本
-- MySQL 8.0+
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS changqingxu
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE changqingxu;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  wechat_openid VARCHAR(100) UNIQUE,
  wechat_unionid VARCHAR(100),
  nickname VARCHAR(50) DEFAULT '',
  avatar VARCHAR(500) DEFAULT '',
  gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
  birthday DATE,
  age INT,
  height INT,
  weight INT,
  hometown VARCHAR(100) DEFAULT '',
  location VARCHAR(100) DEFAULT '',
  zodiac VARCHAR(10) DEFAULT '',
  zodiac_sign VARCHAR(20) DEFAULT '',
  mbti VARCHAR(10) DEFAULT '',
  riyuan VARCHAR(10) DEFAULT '',
  education VARCHAR(20) DEFAULT '',
  school VARCHAR(100) DEFAULT '',
  school_tier ENUM('985', '211') NULL,
  occupation VARCHAR(50) DEFAULT '',
  job_level VARCHAR(20) DEFAULT '',
  company VARCHAR(100) DEFAULT '',
  income VARCHAR(50) DEFAULT '',
  bio TEXT,
  hobbies JSON,
  is_real_name BOOLEAN DEFAULT FALSE,
  is_face_verified BOOLEAN DEFAULT FALSE,
  legal_name VARCHAR(50) DEFAULT '',
  id_card_masked VARCHAR(50) DEFAULT '',
  is_vip BOOLEAN DEFAULT FALSE,
  vip_expiry DATETIME,
  filter_settings JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  INDEX idx_phone (phone),
  INDEX idx_wechat_openid (wechat_openid),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. 匹配记录表
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  target_user_id VARCHAR(36) NOT NULL,
  action ENUM('like', 'dislike', 'super_like') NOT NULL,
  is_mutual BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_target_user_id (target_user_id),
  UNIQUE KEY uk_user_target (user_id, target_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. 会话表
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id_1 VARCHAR(36) NOT NULL,
  user_id_2 VARCHAR(36) NOT NULL,
  last_message_id VARCHAR(36),
  last_message_at DATETIME,
  unread_count_1 INT DEFAULT 0,
  unread_count_2 INT DEFAULT 0,
  is_pinned_1 BOOLEAN DEFAULT FALSE,
  is_pinned_2 BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users (user_id_1, user_id_2),
  INDEX idx_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. 消息表
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  type ENUM('text', 'image', 'voice', 'emoji', 'system') DEFAULT 'text',
  content TEXT,
  media_url VARCHAR(500),
  media_duration INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation (conversation_id, created_at DESC),
  INDEX idx_sender (sender_id),
  INDEX idx_receiver (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. VIP 套餐表
-- ============================================
CREATE TABLE IF NOT EXISTS vip_plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  duration_months INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  features JSON,
  tag VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. VIP 订单表
-- ============================================
CREATE TABLE IF NOT EXISTS vip_orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
  pay_method VARCHAR(20),
  pay_time DATETIME,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. 短信验证码表
-- ============================================
CREATE TABLE IF NOT EXISTS sms_codes (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type ENUM('login', 'register', 'reset') DEFAULT 'login',
  expires_at DATETIME NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone_code (phone, code),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 初始化 VIP 套餐数据
-- ============================================
INSERT INTO vip_plans (id, name, duration_months, price, original_price, features, tag, sort_order) VALUES
('plan-1-month', '月度会员', 1, 68.00, 98.00, '["无限打招呼", "查看谁喜欢我", "优先推荐", "隐身模式"]', '热销', 1),
('plan-3-month', '季度会员', 3, 168.00, 294.00, '["无限打招呼", "查看谁喜欢我", "优先推荐", "隐身模式", "专属客服"]', '超值', 2),
('plan-12-month', '年度会员', 12, 498.00, 1176.00, '["无限打招呼", "查看谁喜欢我", "优先推荐", "隐身模式", "专属客服", "身份标识"]', '特惠', 3);
