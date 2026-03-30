# 資料庫結構（Database Schema）

MySQL 8.0，共 30 張資料表。ORM 使用 Flask-SQLAlchemy。

## 資料表關聯總覽

```
public_users ──┐
               ├──→ amulets ──→ checkins ──→ energy_logs
               ├──→ addresses
               ├──→ redemptions ←── products
               ├──→ notifications
               ├──→ notification_settings
               ├──→ reward_claims ←── checkin_rewards
               └──→ pilgrimage_visits

temple_admin_users ──→ temples

temples ──┬──→ temple_announcements
          ├──→ temple_events ──→ event_registrations
          ├──→ temple_notifications ──→ notification_stats
          ├──→ notification_templates
          ├──→ lamp_types ──→ lamp_applications
          ├──→ checkin_rewards
          └──→ products

super_admin_users (獨立)
system_admins ──→ system_logs
refresh_tokens (獨立，不使用 FK)
line_users (獨立)
```

---

## 帳號相關（5 張）

### public_users（一般信眾）
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | Integer | PK, 自增 | |
| name | String(100) | NOT NULL | 名稱 |
| email | String(120) | UNIQUE, NOT NULL, indexed | Email |
| password_hash | String(255) | NOT NULL | bcrypt 雜湊 |
| blessing_points | Integer | NOT NULL, default=0 | 功德值 |
| is_active | Boolean | NOT NULL, default=True | 帳號啟用 |
| created_at | DateTime | NOT NULL, default=utcnow | |
| last_login_at | DateTime | nullable | |

### temple_admin_users（廟方管理員）
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | Integer | PK, 自增 | |
| name | String(100) | NOT NULL | |
| email | String(120) | UNIQUE, NOT NULL, indexed | |
| password_hash | String(255) | NOT NULL | |
| temple_id | Integer | FK temples.id, NOT NULL | 所屬廟宇（一對一） |
| is_active | Boolean | NOT NULL, default=True | |
| created_at | DateTime | NOT NULL | |
| last_login_at | DateTime | nullable | |

### super_admin_users（系統管理員）
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | Integer | PK, 自增 | |
| name | String(100) | NOT NULL | |
| email | String(120) | UNIQUE, NOT NULL, indexed | |
| password_hash | String(255) | NOT NULL | |
| is_active | Boolean | NOT NULL, default=True | |
| created_at | DateTime | NOT NULL | |
| last_login_at | DateTime | nullable | |

### users（舊版，已棄用但仍保留）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| name | String(100) | |
| email | String(120) | UNIQUE |
| password_hash | String(255) | |
| blessing_points | Integer | default=0 |
| is_active | Boolean | default=True |
| created_at | DateTime | |

> 注意：部分舊路由仍引用 `users` 表，計畫在 v2.0 完全移除。

### system_admins（舊版系統管理員，已棄用）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| username | String(50) | UNIQUE |
| password_hash | String(255) | |
| name | String(100) | |
| email | String(100) | UNIQUE |
| role | String(20) | super_admin/admin/moderator |
| permissions | JSON | |
| is_active | Boolean | |

---

## 認證相關（1 張）

### refresh_tokens
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | Integer | PK, 自增 | |
| jti | String(36) | UNIQUE, NOT NULL, indexed | Token ID (UUID) |
| user_id | Integer | NOT NULL, indexed | 使用者 ID（不使用 FK） |
| account_type | String(20) | NOT NULL | public/temple_admin/super_admin |
| expires_at | DateTime | NOT NULL | 到期時間 |
| revoked_at | DateTime | nullable | 撤銷時間 |
| created_at | DateTime | NOT NULL | |

---

## 廟宇核心（2 張）

### temples（廟宇）
| 欄位 | 型別 | 約束 | 說明 |
|------|------|------|------|
| id | Integer | PK, 自增 | |
| name | String(100) | NOT NULL, indexed | 廟名 |
| address | String(200) | nullable | 地址 |
| latitude | Numeric(10,8) | nullable | 緯度 |
| longitude | Numeric(11,8) | nullable | 經度 |
| main_deity | String(50) | nullable | 主祀神明 |
| description | Text | nullable | 介紹 |
| images | JSON | nullable | 圖片列表 |
| phone | String(20) | nullable | |
| email | String(100) | nullable | |
| website | String(200) | nullable | |
| opening_hours | JSON | nullable | 開放時間 |
| checkin_radius | Integer | NOT NULL, default=100 | 打卡範圍(m) |
| checkin_merit_points | Integer | NOT NULL, default=10 | 打卡功德值 |
| nfc_uid | String(50) | UNIQUE, nullable, indexed | NFC 卡號 |
| is_active | Boolean | NOT NULL, default=True, indexed | |
| created_at | DateTime | NOT NULL | |
| updated_at | DateTime | on update | |

### temple_admins（廟方管理員-廟宇關聯，舊版）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id, UNIQUE(temple_id, user_id) |
| user_id | Integer | FK users.id |
| role | String(20) | owner/manager/staff |
| permissions | JSON | |
| is_active | Boolean | |

---

## 打卡系統（3 張）

### amulets（平安符）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id, indexed |
| energy | Integer | default=0，能量值 |
| status | String(20) | active/inactive/expired |
| created_at | DateTime | |

### checkins（打卡記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id, indexed |
| amulet_id | Integer | FK amulets.id, indexed |
| temple_id | Integer | FK temples.id, nullable, indexed |
| latitude | Numeric(10,8) | |
| longitude | Numeric(11,8) | |
| notes | Text | |
| blessing_points | Integer | default=10 |
| timestamp | DateTime | |

### energy_logs（能量記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id, indexed |
| amulet_id | Integer | FK amulets.id, indexed |
| energy_added | Integer | 可為負數 |
| timestamp | DateTime | |

---

## 商城系統（3 張）

### products（商品）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id, nullable, indexed |
| name | String(100) | NOT NULL |
| description | Text | |
| category | String(50) | indexed (charm/tshirt/sticker...) |
| merit_points | Integer | 兌換所需功德值 |
| stock_quantity | Integer | default=0 |
| low_stock_threshold | Integer | default=5 |
| image_url | String(500) | |
| images | JSON | 多張圖片 |
| is_active | Boolean | indexed |
| is_featured | Boolean | |
| sort_order | Integer | |

### redemptions（兌換記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id, indexed |
| product_id | Integer | FK products.id, indexed |
| temple_id | Integer | FK temples.id, nullable, indexed |
| quantity | Integer | default=1 |
| merit_points_used | Integer | |
| status | String(20) | pending/processing/shipped/completed/cancelled |
| recipient_name | String(50) | 收件人 |
| phone | String(20) | |
| city / district / address | String | 收件地址 |
| tracking_number | String(100) | 物流單號 |
| notes / admin_notes | Text | |
| redeemed_at | DateTime | |
| processed_at / shipped_at / completed_at / cancelled_at | DateTime | 狀態時間戳 |

### addresses（收件地址）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id, indexed |
| recipient_name | String(50) | |
| phone | String(20) | |
| postal_code | String(10) | |
| city | String(20) | |
| district | String(20) | |
| address | String(200) | |
| is_default | Boolean | indexed |

---

## 獎勵系統（2 張）

### checkin_rewards（打卡獎勵規則）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id, nullable |
| name | String(100) | 獎勵名稱 |
| reward_type | String(30) | consecutive_days/total_count/first_time/daily_bonus |
| condition_value | Integer | 觸發條件值 |
| reward_points | Integer | 獎勵功德值 |
| is_repeatable | Boolean | |
| is_active | Boolean | |
| start_date / end_date | DateTime | 有效期 |

### reward_claims（獎勵領取記錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id |
| reward_id | Integer | FK checkin_rewards.id |
| points_received | Integer | |
| claim_type | String(20) | auto/manual |
| related_checkin_id | Integer | FK checkins.id, nullable |
| claimed_at | DateTime | |

---

## 活動系統（2 張）

### temple_events（廟方活動）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id, indexed |
| title | String(200) | |
| description | Text | |
| location | String(200) | |
| start_at / end_at | DateTime | indexed |
| signup_end_at | DateTime | indexed |
| capacity | Integer | 名額 |
| fee | Numeric(10,2) | default=0 |
| cover_image_url | String(500) | |
| status | String(20) | draft/published/closed/canceled |
| created_by | Integer | FK users.id |

### event_registrations（活動報名）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| event_id | Integer | FK temple_events.id, indexed |
| user_id | Integer | FK users.id, nullable |
| line_user_id | String(50) | nullable, indexed |
| name | String(100) | |
| phone | String(20) | |
| email | String(120) | |
| people_count | Integer | default=1 |
| notes | Text | |
| status | String(20) | registered/canceled/waitlist |

---

## 通知系統（4 張）

### notifications（使用者通知）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id, indexed |
| type | String(30) | reward_received/redemption_status/temple_announcement/system_announcement/checkin_milestone |
| title | String(200) | |
| content | Text | |
| related_type | String(30) | |
| related_id | Integer | |
| data | JSON | |
| is_read | Boolean | indexed |

### notification_settings（通知偏好）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| user_id | Integer | FK users.id, UNIQUE |
| reward_received / redemption_status / temple_announcement / system_announcement / checkin_milestone | Boolean | 各類開關 |
| push_enabled / email_enabled | Boolean | 通道開關 |

### temple_notifications（廟方推播通知）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id, indexed |
| title | String(200) | |
| content | Text | |
| channels | JSON | default=['line'] |
| target_audience | String(30) | all/active/dormant/new/lamp_expiring/birthday_month/event_registered/custom |
| target_event_id | Integer | FK temple_events.id, nullable |
| target_count / sent_count | Integer | |
| image_url | String(500) | |
| status | String(20) | draft/scheduled/sending/sent/failed |
| scheduled_at / sent_at | DateTime | |

### notification_stats（通知統計）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| notification_id | Integer | FK temple_notifications.id |
| channel | String(10) | line/app |
| sent / opened / clicked | Integer | |

### notification_templates（通知模板）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id, indexed |
| name | String(100) | |
| category | String(20) | event/reminder/festival/announcement/custom |
| title | String(200) | |
| content | Text | |
| is_default | Boolean | |
| usage_count | Integer | |

---

## 點燈與進香（3 張）

### lamp_types（點燈類型）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id |
| name | String(100) | |
| price | Numeric(10,2) | |
| duration_days | Integer | |
| status | String(20) | active/inactive |

### lamp_applications（點燈申請）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| lamp_type_id | Integer | FK lamp_types.id |
| user_id | Integer | FK users.id, nullable |
| temple_id | Integer | FK temples.id |
| applicant_name / applicant_phone | String | |
| blessing_target | String(200) | 祈福對象 |
| start_date / end_date | Date | |
| status | String(20) | pending/confirmed/... |
| payment_status | String(20) | unpaid/paid/... |

### pilgrimage_visits（進香登記）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id |
| public_user_id | Integer | FK public_users.id, nullable |
| group_name | String(200) | 團體名稱 |
| contact_name / contact_phone | String | |
| people_count | Integer | |
| visit_start_at | DateTime | |
| purpose | String(500) | |
| status | String(20) | pending/confirmed/rejected/completed/canceled |

---

## 系統管理（5 張）

### temple_announcements（廟宇公告）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| temple_id | Integer | FK temples.id |
| title | String(200) | |
| content | Text | |
| type | String(20) | event/festival/maintenance/news/important |
| priority | String(10) | low/normal/high/urgent |
| is_published | Boolean | |
| view_count | Integer | |

### temple_applications（廟宇入駐申請）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| applicant_id | Integer | FK users.id |
| temple_name / address / phone / email | String | |
| status | String(20) | pending/approved/rejected/in_review |
| reviewed_by | Integer | FK system_admins.id |
| temple_id | Integer | FK temples.id（核准後關聯） |

### system_settings（系統設定）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| key | String(100) | UNIQUE |
| value | Text | |
| data_type | String(20) | string/integer/boolean/json |
| category | String(50) | general/payment/notification/security |

### system_logs（操作日誌）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| admin_id | Integer | FK system_admins.id |
| action_type | String(50) | indexed |
| action_category | String(30) | auth/user_mgmt/temple_mgmt/order_mgmt/system |
| target_type / target_id | String/Integer | 操作對象 |
| description | Text | |
| ip_address | String(50) | |
| changes | JSON | 變更前後 |

### user_reports（使用者檢舉）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| reporter_id | Integer | FK users.id |
| report_type | String(30) | user/temple/product/comment |
| reason | String(50) | spam/inappropriate/fraud/violation/other |
| status | String(20) | pending/processing/resolved/rejected |
| handler_id | Integer | FK system_admins.id |

---

## LINE 整合（1 張）

### line_users（LINE 使用者）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | Integer | PK |
| line_user_id | String(50) | UNIQUE, indexed |
| display_name | String(100) | |
| picture_url | String(500) | |
| phone | String(20) | |
| email | String(120) | |
| is_following | Boolean | default=True |
| followed_at / unfollowed_at | DateTime | |
