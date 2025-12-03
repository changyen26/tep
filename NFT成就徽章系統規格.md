# NFT 成就徽章系統 - 規格書

## 系統概述

本系統將使用者的參拜成就鑄造成 NFT (Non-Fungible Token),永久記錄在區塊鏈上,作為數位紀念品。**重點是紀念價值而非交易功能**,NFT 不可轉讓,永久綁定在使用者的錢包地址上。

---

## 核心概念

### 🎖️ **成就徽章類型**

#### 1. **打卡里程碑徽章**
- 首次打卡紀念
- 打卡 10 次
- 打卡 50 次
- 打卡 100 次
- 打卡 365 次(圓滿之年)
- 打卡 1000 次(千里之行)

#### 2. **廟宇收集徽章**
- 參拜 5 座廟宇
- 參拜 10 座廟宇
- 參拜 25 座廟宇(四分之一收集家)
- 參拜 50 座廟宇(半數收集家)
- 參拜全部廟宇(完美收集家)

#### 3. **連續打卡徽章**
- 連續打卡 7 天
- 連續打卡 30 天
- 連續打卡 100 天
- 連續打卡 365 天(年度虔誠信徒)

#### 4. **特殊成就徽章**
- 單一廟宇打卡 50 次(專屬信徒)
- 在同一天打卡 5 座廟宇(朝聖者)
- 凌晨打卡(早課虔誠)
- 農曆初一、十五打卡(雙倍虔誠)
- 神明生日當天打卡(壽星祝福)

#### 5. **廟宇專屬徽章**
- 龍山寺專屬徽章
- 行天宮專屬徽章
- 各廟宇自訂徽章

#### 6. **季節/節慶徽章**
- 新春祈福(農曆新年)
- 清明祭祖
- 端午祈安
- 中元普渡
- 中秋祈福
- 冬至團圓

#### 7. **功德成就徽章**
- 累積 1000 功德值
- 累積 5000 功德值
- 累積 10000 功德值

---

## 技術架構

### 區塊鏈選擇建議

#### 🌟 **推薦方案: Polygon (MATIC)**
**優點**:
- ✅ 低 Gas Fee (幾乎免費)
- ✅ 快速確認 (2秒)
- ✅ EVM 相容(與 Ethereum 生態系統相容)
- ✅ 環保(PoS 機制)
- ✅ 完善的 NFT 生態系統
- ✅ 支援中文社群

**替代方案**:
- **Solana**: 更快更便宜,但生態系統較小
- **BSC (Binance Smart Chain)**: 便宜但較中心化
- **Ethereum Layer 2** (Arbitrum/Optimism): 更去中心化但稍貴

---

### NFT 標準

使用 **ERC-721** 標準:
- 每個徽章都是唯一的 NFT
- 包含完整的成就資訊
- 支援 Metadata 擴充

**智能合約特性**:
- ✅ **Soulbound Token** (靈魂綁定代幣,不可轉讓)
- ✅ 自動鑄造(達成成就時觸發)
- ✅ 永久保留(無法銷毀)
- ✅ 可查詢(公開驗證)

---

## 資料庫設計

### 1. achievement_types (成就類型表)

| 欄位名稱 | 資料型別 | 說明 | 約束 |
|---------|---------|------|------|
| id | VARCHAR(36) | 成就類型 UUID | PRIMARY KEY |
| code | VARCHAR(50) | 成就代碼 | UNIQUE, NOT NULL |
| name | VARCHAR(100) | 成就名稱 | NOT NULL |
| name_en | VARCHAR(100) | 英文名稱 | NULL |
| description | TEXT | 成就描述 | NULL |
| category | ENUM | 成就分類 | NOT NULL |
| icon_url | VARCHAR(500) | 徽章圖示 URL | NULL |
| criteria | JSON | 達成條件 | NOT NULL |
| rarity | ENUM | 稀有度 | DEFAULT 'common' |
| points_reward | INT | 獎勵功德值 | DEFAULT 0 |
| is_active | BOOLEAN | 是否啟用 | DEFAULT TRUE |
| display_order | INT | 顯示順序 | DEFAULT 0 |
| created_at | DATETIME | 建立時間 | DEFAULT CURRENT_TIMESTAMP |

**成就分類 (category)**:
- `checkin_milestone` - 打卡里程碑
- `temple_collection` - 廟宇收集
- `consecutive_checkin` - 連續打卡
- `special_achievement` - 特殊成就
- `temple_exclusive` - 廟宇專屬
- `seasonal` - 季節節慶
- `merit_points` - 功德成就

**稀有度 (rarity)**:
- `common` - 普通 (白色)
- `uncommon` - 少見 (綠色)
- `rare` - 稀有 (藍色)
- `epic` - 史詩 (紫色)
- `legendary` - 傳說 (金色)

**達成條件 (criteria)** JSON 範例:
```json
{
  "type": "checkin_count",
  "value": 100,
  "temple_id": null,  // null = 任何廟宇
  "description": "累積打卡 100 次"
}
```

**索引**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `code`
- INDEX: `category`, `is_active`, `rarity`

---

### 2. user_achievements (使用者成就記錄表)

| 欄位名稱 | 資料型別 | 說明 | 約束 |
|---------|---------|------|------|
| id | VARCHAR(36) | 記錄 UUID | PRIMARY KEY |
| user_id | VARCHAR(36) | 使用者 ID | FOREIGN KEY → users.id |
| achievement_type_id | VARCHAR(36) | 成就類型 ID | FOREIGN KEY → achievement_types.id |
| unlocked_at | DATETIME | 解鎖時間 | DEFAULT CURRENT_TIMESTAMP |
| related_checkin_id | VARCHAR(36) | 相關打卡記錄 | FOREIGN KEY → checkins.id |
| related_temple_id | VARCHAR(36) | 相關廟宇 | FOREIGN KEY → temples.id |
| achievement_data | JSON | 成就數據快照 | NULL |
| is_minted | BOOLEAN | 是否已鑄造 NFT | DEFAULT FALSE |
| nft_id | VARCHAR(36) | NFT 記錄 ID | FOREIGN KEY → nfts.id |

**成就數據快照 (achievement_data)** JSON 範例:
```json
{
  "total_checkins": 100,
  "achievement_date": "2025-01-15",
  "progress": {
    "current": 100,
    "target": 100
  }
}
```

**索引**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `user_id, achievement_type_id` (每個使用者每種成就只能解鎖一次)
- INDEX: `user_id`, `achievement_type_id`, `unlocked_at`, `is_minted`
- FOREIGN KEY:
  - `user_id` REFERENCES `users(id)` ON DELETE CASCADE
  - `achievement_type_id` REFERENCES `achievement_types(id)` ON DELETE CASCADE
  - `related_checkin_id` REFERENCES `checkins(id)` ON DELETE SET NULL
  - `related_temple_id` REFERENCES `temples(id)` ON DELETE SET NULL
  - `nft_id` REFERENCES `nfts(id)` ON DELETE SET NULL

---

### 3. nfts (NFT 記錄表)

| 欄位名稱 | 資料型別 | 說明 | 約束 |
|---------|---------|------|------|
| id | VARCHAR(36) | NFT 記錄 UUID | PRIMARY KEY |
| user_id | VARCHAR(36) | 擁有者 ID | FOREIGN KEY → users.id |
| achievement_id | VARCHAR(36) | 成就記錄 ID | FOREIGN KEY → user_achievements.id |
| token_id | BIGINT | 鏈上 Token ID | NULL |
| contract_address | VARCHAR(42) | 智能合約地址 | NULL |
| wallet_address | VARCHAR(42) | 錢包地址 | NULL |
| blockchain | VARCHAR(20) | 區塊鏈網路 | DEFAULT 'polygon' |
| transaction_hash | VARCHAR(66) | 交易雜湊 | NULL |
| metadata_uri | VARCHAR(500) | Metadata URI | NULL |
| image_url | VARCHAR(500) | NFT 圖片 URL | NULL |
| status | ENUM | 鑄造狀態 | DEFAULT 'pending' |
| minted_at | DATETIME | 鑄造時間 | NULL |
| error_message | TEXT | 錯誤訊息 | NULL |
| created_at | DATETIME | 建立時間 | DEFAULT CURRENT_TIMESTAMP |

**區塊鏈網路 (blockchain)**:
- `polygon` - Polygon (MATIC)
- `ethereum` - Ethereum
- `bsc` - Binance Smart Chain
- `solana` - Solana

**鑄造狀態 (status)**:
- `pending` - 待鑄造
- `minting` - 鑄造中
- `minted` - 已鑄造
- `failed` - 鑄造失敗

**索引**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `achievement_id` (每個成就只能鑄造一次)
- INDEX: `user_id`, `token_id`, `status`, `blockchain`
- INDEX: `transaction_hash`, `wallet_address`
- FOREIGN KEY:
  - `user_id` REFERENCES `users(id)` ON DELETE CASCADE
  - `achievement_id` REFERENCES `user_achievements(id)` ON DELETE CASCADE

---

### 4. nft_metadata (NFT Metadata 表)

| 欄位名稱 | 資料型別 | 說明 | 約束 |
|---------|---------|------|------|
| id | VARCHAR(36) | Metadata UUID | PRIMARY KEY |
| nft_id | VARCHAR(36) | NFT 記錄 ID | FOREIGN KEY → nfts.id |
| name | VARCHAR(200) | NFT 名稱 | NOT NULL |
| description | TEXT | NFT 描述 | NULL |
| image | VARCHAR(500) | 圖片 URL | NOT NULL |
| external_url | VARCHAR(500) | 外部連結 | NULL |
| attributes | JSON | 屬性列表 | NULL |
| created_at | DATETIME | 建立時間 | DEFAULT CURRENT_TIMESTAMP |

**屬性 (attributes)** JSON 範例 (符合 OpenSea 標準):
```json
[
  {
    "trait_type": "成就類型",
    "value": "打卡里程碑"
  },
  {
    "trait_type": "稀有度",
    "value": "稀有"
  },
  {
    "trait_type": "解鎖日期",
    "value": "2025-01-15"
  },
  {
    "trait_type": "廟宇",
    "value": "龍山寺"
  },
  {
    "trait_type": "總打卡次數",
    "value": 100,
    "display_type": "number"
  },
  {
    "trait_type": "年份",
    "value": "2025"
  }
]
```

**索引**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `nft_id`
- FOREIGN KEY: `nft_id` REFERENCES `nfts(id)` ON DELETE CASCADE

---

### 5. wallet_connections (錢包連接記錄表)

| 欄位名稱 | 資料型別 | 說明 | 約束 |
|---------|---------|------|------|
| id | VARCHAR(36) | 記錄 UUID | PRIMARY KEY |
| user_id | VARCHAR(36) | 使用者 ID | FOREIGN KEY → users.id |
| wallet_address | VARCHAR(42) | 錢包地址 | NOT NULL |
| blockchain | VARCHAR(20) | 區塊鏈網路 | NOT NULL |
| is_primary | BOOLEAN | 是否為主要錢包 | DEFAULT FALSE |
| verified_at | DATETIME | 驗證時間 | NULL |
| last_used | DATETIME | 最後使用時間 | NULL |
| created_at | DATETIME | 連接時間 | DEFAULT CURRENT_TIMESTAMP |

**索引**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `wallet_address, blockchain` (同一錢包只能綁定一個帳號)
- INDEX: `user_id`, `is_primary`
- FOREIGN KEY: `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

## API 端點規格

### 🎖️ **成就系統 API**

#### 1. 取得所有成就類型
```
GET /api/achievements/types
```

**認證**: 不需要

**查詢參數**:
- `category`: 篩選成就分類
- `rarity`: 篩選稀有度

**回應範例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "CHECKIN_100",
      "name": "百次參拜",
      "description": "累積打卡 100 次",
      "category": "checkin_milestone",
      "icon_url": "https://cdn.example.com/badges/checkin_100.png",
      "rarity": "rare",
      "points_reward": 100,
      "criteria": {
        "type": "checkin_count",
        "value": 100
      }
    }
  ]
}
```

---

#### 2. 取得使用者已解鎖成就
```
GET /api/achievements/my-achievements
```

**認證**: 需要 (Bearer Token)

**回應範例**:
```json
{
  "success": true,
  "data": {
    "total_unlocked": 15,
    "achievements": [
      {
        "id": "uuid",
        "achievement": {
          "code": "CHECKIN_100",
          "name": "百次參拜",
          "icon_url": "...",
          "rarity": "rare"
        },
        "unlocked_at": "2025-01-15T10:30:00",
        "is_minted": true,
        "nft": {
          "token_id": 12345,
          "blockchain": "polygon",
          "view_url": "https://opensea.io/assets/..."
        }
      }
    ],
    "progress": [
      {
        "achievement": {
          "code": "CHECKIN_1000",
          "name": "千里之行",
          "rarity": "legendary"
        },
        "current": 150,
        "target": 1000,
        "percentage": 15
      }
    ]
  }
}
```

---

#### 3. 取得成就進度
```
GET /api/achievements/progress
```

**認證**: 需要 (Bearer Token)

**說明**: 查看所有未解鎖成就的進度

---

#### 4. 檢查新解鎖的成就
```
POST /api/achievements/check
```

**認證**: 需要 (Bearer Token)

**說明**: 打卡後自動觸發,檢查是否有新成就解鎖

**回應範例**:
```json
{
  "success": true,
  "data": {
    "new_achievements": [
      {
        "achievement": {
          "name": "百次參拜",
          "description": "累積打卡 100 次",
          "icon_url": "...",
          "rarity": "rare"
        },
        "points_reward": 100,
        "can_mint_nft": true
      }
    ]
  }
}
```

---

### 🔗 **錢包連接 API**

#### 5. 連接錢包
```
POST /api/wallet/connect
```

**認證**: 需要 (Bearer Token)

**請求參數**:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "blockchain": "polygon",
  "signature": "0x...",  // 簽名驗證
  "message": "I am connecting my wallet to Temple Checkin App"
}
```

**說明**: 
1. 前端使用 Web3 錢包 (MetaMask) 簽署訊息
2. 後端驗證簽名確認錢包所有權
3. 綁定錢包到使用者帳號

**回應範例**:
```json
{
  "success": true,
  "message": "錢包連接成功",
  "data": {
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "blockchain": "polygon",
    "is_primary": true
  }
}
```

---

#### 6. 取得已連接的錢包
```
GET /api/wallet/my-wallets
```

**認證**: 需要 (Bearer Token)

**回應範例**:
```json
{
  "success": true,
  "data": [
    {
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "blockchain": "polygon",
      "is_primary": true,
      "verified_at": "2025-01-15T10:00:00",
      "nft_count": 5
    }
  ]
}
```

---

#### 7. 設定主要錢包
```
PUT /api/wallet/set-primary
```

**認證**: 需要 (Bearer Token)

**請求參數**:
```json
{
  "wallet_id": "uuid"
}
```

---

#### 8. 移除錢包連接
```
DELETE /api/wallet/<wallet_id>
```

**認證**: 需要 (Bearer Token)

**說明**: 移除錢包綁定,但已鑄造的 NFT 仍保留在區塊鏈上

---

### 🎨 **NFT 鑄造 API**

#### 9. 鑄造成就 NFT
```
POST /api/nft/mint
```

**認證**: 需要 (Bearer Token)

**請求參數**:
```json
{
  "achievement_id": "uuid",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**商業邏輯**:
1. 檢查使用者是否已解鎖該成就
2. 檢查該成就是否已鑄造過
3. 檢查錢包是否已連接
4. 呼叫智能合約鑄造 NFT
5. 記錄交易雜湊和 Token ID
6. 更新成就記錄的 is_minted 狀態

**回應範例**:
```json
{
  "success": true,
  "message": "NFT 鑄造中,請稍候...",
  "data": {
    "nft_id": "uuid",
    "status": "minting",
    "transaction_hash": "0x...",
    "estimated_time": "30 seconds"
  }
}
```

---

#### 10. 批量鑄造 NFT
```
POST /api/nft/batch-mint
```

**認證**: 需要 (Bearer Token)

**請求參數**:
```json
{
  "achievement_ids": ["uuid1", "uuid2", "uuid3"],
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**說明**: 一次鑄造多個成就 NFT,節省 Gas Fee

---

#### 11. 查詢 NFT 鑄造狀態
```
GET /api/nft/<nft_id>/status
```

**認證**: 需要 (Bearer Token)

**回應範例**:
```json
{
  "success": true,
  "data": {
    "nft_id": "uuid",
    "status": "minted",
    "token_id": 12345,
    "blockchain": "polygon",
    "contract_address": "0x...",
    "transaction_hash": "0x...",
    "minted_at": "2025-01-15T10:35:00",
    "view_url": "https://opensea.io/assets/polygon/0x.../12345",
    "metadata": {
      "name": "百次參拜成就",
      "image": "https://cdn.example.com/nft/12345.png"
    }
  }
}
```

---

#### 12. 取得使用者的所有 NFT
```
GET /api/nft/my-nfts
```

**認證**: 需要 (Bearer Token)

**查詢參數**:
- `blockchain`: 篩選區塊鏈
- `status`: 篩選狀態

**回應範例**:
```json
{
  "success": true,
  "data": {
    "total_nfts": 5,
    "nfts": [
      {
        "nft_id": "uuid",
        "achievement": {
          "name": "百次參拜",
          "rarity": "rare"
        },
        "token_id": 12345,
        "blockchain": "polygon",
        "minted_at": "2025-01-15T10:35:00",
        "view_url": "https://opensea.io/assets/...",
        "image_url": "https://cdn.example.com/nft/12345.png"
      }
    ]
  }
}
```

---

#### 13. 取得 NFT Metadata
```
GET /api/nft/metadata/<token_id>
```

**認證**: 不需要 (公開端點,供區塊鏈瀏覽器查詢)

**說明**: 返回符合 ERC-721 標準的 Metadata JSON

**回應範例** (符合 OpenSea 標準):
```json
{
  "name": "百次參拜成就 #12345",
  "description": "恭喜您達成百次參拜的里程碑!這是您虔誠信仰的證明。",
  "image": "https://cdn.example.com/nft/12345.png",
  "external_url": "https://temple-checkin.app/achievements/12345",
  "attributes": [
    {
      "trait_type": "成就類型",
      "value": "打卡里程碑"
    },
    {
      "trait_type": "稀有度",
      "value": "稀有"
    },
    {
      "trait_type": "解鎖日期",
      "value": "2025-01-15"
    },
    {
      "trait_type": "總打卡次數",
      "value": 100,
      "display_type": "number"
    },
    {
      "trait_type": "參拜廟宇數",
      "value": 15,
      "display_type": "number"
    }
  ],
  "background_color": "FFD700"
}
```

---

### 🎁 **管理員 API**

#### 14. 新增成就類型 (系統管理員)
```
POST /api/admin/achievements/types
```

**認證**: 需要 (系統管理員)

**請求參數**:
```json
{
  "code": "TEMPLE_50",
  "name": "五十廟巡禮",
  "description": "參拜 50 座不同的廟宇",
  "category": "temple_collection",
  "rarity": "epic",
  "criteria": {
    "type": "unique_temples",
    "value": 50
  },
  "points_reward": 500,
  "icon_url": "https://..."
}
```

---

#### 15. 手動解鎖成就 (系統管理員)
```
POST /api/admin/achievements/unlock
```

**認證**: 需要 (系統管理員)

**請求參數**:
```json
{
  "user_id": "uuid",
  "achievement_type_id": "uuid",
  "reason": "補發遺失的成就"
}
```

---

#### 16. 查看 NFT 鑄造統計 (系統管理員)
```
GET /api/admin/nft/statistics
```

**認證**: 需要 (系統管理員)

**回應範例**:
```json
{
  "success": true,
  "data": {
    "total_achievements_unlocked": 5000,
    "total_nfts_minted": 3500,
    "minting_rate": 70,
    "by_rarity": {
      "common": 2000,
      "uncommon": 800,
      "rare": 500,
      "epic": 150,
      "legendary": 50
    },
    "by_blockchain": {
      "polygon": 3400,
      "ethereum": 100
    },
    "failed_mints": 25
  }
}
```

---

## 智能合約設計

### Solidity 智能合約範例 (ERC-721 Soulbound)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TempleAchievementNFT
 * @dev Soulbound Token (不可轉讓的成就 NFT)
 */
contract TempleAchievementNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Token ID 對應的 Metadata URI
    mapping(uint256 => string) private _tokenURIs;
    
    // 記錄每個地址擁有的 Token
    mapping(address => uint256[]) private _ownedTokens;
    
    // 事件
    event AchievementMinted(address indexed to, uint256 indexed tokenId, string metadataURI);
    
    constructor() ERC721("Temple Achievement NFT", "ACHIEVE") {}
    
    /**
     * @dev 鑄造新的成就 NFT
     * @param to 接收者地址
     * @param metadataURI Metadata URI
     * @return tokenId 新鑄造的 Token ID
     */
    function mintAchievement(address to, string memory metadataURI) 
        public 
        onlyOwner 
        returns (uint256) 
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        _ownedTokens[to].push(newTokenId);
        
        emit AchievementMinted(to, newTokenId, metadataURI);
        
        return newTokenId;
    }
    
    /**
     * @dev 批量鑄造
     */
    function batchMintAchievements(address to, string[] memory metadataURIs) 
        public 
        onlyOwner 
        returns (uint256[] memory) 
    {
        uint256[] memory tokenIds = new uint256[](metadataURIs.length);
        
        for (uint256 i = 0; i < metadataURIs.length; i++) {
            tokenIds[i] = mintAchievement(to, metadataURIs[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev 設定 Token URI
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(_exists(tokenId), "Token does not exist");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    /**
     * @dev 取得 Token URI
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    /**
     * @dev 取得地址擁有的所有 Token
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }
    
    /**
     * @dev 禁止轉讓 (Soulbound Token)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        // 只允許鑄造 (from == address(0)),禁止轉讓
        require(from == address(0), "Soulbound: Transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId);
    }
    
    /**
     * @dev 取得總供應量
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
```

---

## 前端整合

### React + Web3.js 範例

```javascript
import Web3 from 'web3';
import { useState, useEffect } from 'react';

// 1. 連接 MetaMask 錢包
async function connectWallet() {
  if (window.ethereum) {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];
      
      // 簽署訊息驗證錢包所有權
      const message = "I am connecting my wallet to Temple Checkin App";
      const signature = await web3.eth.personal.sign(message, walletAddress);
      
      // 發送到後端驗證並綁定
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          blockchain: 'polygon',
          signature: signature,
          message: message
        })
      });
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('錢包連接失敗:', error);
    }
  } else {
    alert('請安裝 MetaMask!');
  }
}

// 2. 鑄造 NFT
async function mintNFT(achievementId, walletAddress) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('/api/nft/mint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      achievement_id: achievementId,
      wallet_address: walletAddress
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // 開始輪詢檢查鑄造狀態
    const nftId = data.data.nft_id;
    pollMintStatus(nftId);
  }
  
  return data;
}

// 3. 輪詢鑄造狀態
async function pollMintStatus(nftId) {
  const token = localStorage.getItem('access_token');
  
  const checkStatus = async () => {
    const response = await fetch(`/api/nft/${nftId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.data.status === 'minted') {
      console.log('NFT 鑄造成功!', data.data);
      return data.data;
    } else if (data.data.status === 'failed') {
      console.error('NFT 鑄造失敗:', data.data.error_message);
      return null;
    } else {
      // 繼續輪詢
      setTimeout(checkStatus, 5000); // 每 5 秒檢查一次
    }
  };
  
  return checkStatus();
}

// 4. 顯示成就徽章組件
function AchievementBadge({ achievement }) {
  const [minting, setMinting] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  
  useEffect(() => {
    // 取得已連接的錢包
    fetchWallet();
  }, []);
  
  const fetchWallet = async () => {
    const response = await fetch('/api/wallet/my-wallets', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    const data = await response.json();
    if (data.data.length > 0) {
      setWalletAddress(data.data[0].wallet_address);
    }
  };
  
  const handleMint = async () => {
    if (!walletAddress) {
      const result = await connectWallet();
      if (result.success) {
        setWalletAddress(result.data.wallet_address);
      }
      return;
    }
    
    setMinting(true);
    const result = await mintNFT(achievement.id, walletAddress);
    
    if (result.success) {
      alert('NFT 鑄造中,請稍候...');
    }
    setMinting(false);
  };
  
  return (
    <div className="achievement-badge">
      <img src={achievement.achievement.icon_url} alt={achievement.achievement.name} />
      <h3>{achievement.achievement.name}</h3>
      <p>{achievement.achievement.description}</p>
      <span className={`rarity ${achievement.achievement.rarity}`}>
        {achievement.achievement.rarity}
      </span>
      
      {!achievement.is_minted ? (
        <button onClick={handleMint} disabled={minting}>
          {minting ? '鑄造中...' : '鑄造為 NFT'}
        </button>
      ) : (
        <div className="nft-info">
          <p>✅ 已鑄造為 NFT</p>
          <a href={achievement.nft.view_url} target="_blank" rel="noopener noreferrer">
            在 OpenSea 查看
          </a>
        </div>
      )}
    </div>
  );
}

// 5. 成就展示牆組件
function AchievementWall() {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState([]);
  
  useEffect(() => {
    fetchAchievements();
  }, []);
  
  const fetchAchievements = async () => {
    const response = await fetch('/api/achievements/my-achievements', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    const data = await response.json();
    setAchievements(data.data.achievements);
    setProgress(data.data.progress);
  };
  
  return (
    <div className="achievement-wall">
      <h2>我的成就 ({achievements.length})</h2>
      
      <div className="unlocked-achievements">
        <h3>已解鎖</h3>
        <div className="badge-grid">
          {achievements.map(achievement => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
      
      <div className="achievement-progress">
        <h3>進行中</h3>
        {progress.map(item => (
          <div key={item.achievement.code} className="progress-item">
            <h4>{item.achievement.name}</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span>{item.current} / {item.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 業務流程

### 成就解鎖流程
```
1. 使用者打卡
   ↓
2. 系統檢查是否達成新成就
   ↓
3. 解鎖成就並記錄到 user_achievements
   ↓
4. 發送通知給使用者
   ↓
5. 提示使用者可鑄造 NFT
```

### NFT 鑄造流程
```
1. 使用者點擊「鑄造 NFT」
   ↓
2. 檢查是否已連接錢包 (未連接則引導連接)
   ↓
3. 生成 NFT Metadata 並上傳到 IPFS
   ↓
4. 呼叫智能合約 mintAchievement()
   ↓
5. 等待交易確認 (約 30 秒)
   ↓
6. 記錄 Token ID 和交易雜湊
   ↓
7. 更新成就記錄為已鑄造
   ↓
8. 通知使用者鑄造成功
```

---

## 成本分析

### Polygon 網路 (建議使用)
- **鑄造單個 NFT**: ~$0.01 - $0.05 USD
- **批量鑄造 (10個)**: ~$0.05 - $0.15 USD
- **錢包連接驗證**: 免費 (不上鏈)

### 系統承擔 vs 使用者自付
**建議方案**: 系統承擔鑄造費用
- 提升使用者體驗
- 鼓勵使用者鑄造 NFT
- 成本可控 (每月約 $50-200 USD for 1000-5000 NFTs)

**替代方案**: 使用者自付
- 使用者需要在錢包中有少量 MATIC
- 降低系統成本
- 可能降低鑄造意願

---

## 圖片資源設計

### NFT 徽章設計建議
1. **統一風格**: 使用台灣廟宇元素(燈籠、香爐、神像等)
2. **稀有度區分**: 
   - 普通: 灰白色背景
   - 少見: 綠色光芒
   - 稀有: 藍色光芒 + 花紋
   - 史詩: 紫色光芒 + 動態效果
   - 傳說: 金色光芒 + 特效

3. **圖片規格**:
   - 尺寸: 512x512 px (OpenSea 標準)
   - 格式: PNG (透明背景)
   - 檔案大小: < 1MB

4. **範例元素**:
   - 背景: 廟宇建築輪廓
   - 主體: 成就圖示(數字、神像、香爐等)
   - 裝飾: 祥雲、金邊、光芒效果
   - 文字: 成就名稱(中英文)

---

## 安全性考量

### 1. 錢包驗證
- 簽名驗證確保錢包所有權
- 一個錢包只能綁定一個帳號
- 防止冒用他人錢包

### 2. 防止重複鑄造
- 每個成就只能鑄造一次
- 資料庫唯一索引約束
- 智能合約層面檢查

### 3. Metadata 安全
- 使用 IPFS 儲存,防止竄改
- 備份到中心化伺服器
- 定期檢查 IPFS 節點狀態

### 4. 私鑰管理
- 系統熱錢包管理
- 多重簽名保護
- 定期輪換
- 冷錢包備份

---

## 未來擴充建議

### 1. 社交功能
- 成就展示牆
- 分享到社群媒體
- 成就排行榜
- 好友成就比較

### 2. 進階徽章
- 動態 NFT (可升級)
- 組合徽章 (集滿一套解鎖特殊徽章)
- 隱藏成就

### 3. 實體應用
- NFT 兌換實體徽章
- 參加廟宇活動憑證
- 會員身份識別

### 4. 跨鏈支援
- 支援多個區塊鏈
- 跨鏈橋接
- Layer 2 方案

---

**版本**: 1.0.0  
**最後更新**: 2025-01-15
