/**
 * 常數定義
 */

// 使用者角色
export const USER_ROLES = {
  USER: 'user',
  TEMPLE_ADMIN: 'temple_admin'
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.USER]: '一般使用者',
  [USER_ROLES.TEMPLE_ADMIN]: '廟宇管理員'
};

// 廟宇申請狀態
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]: '待審核',
  [APPLICATION_STATUS.IN_REVIEW]: '審核中',
  [APPLICATION_STATUS.APPROVED]: '已通過',
  [APPLICATION_STATUS.REJECTED]: '已拒絕'
};

export const APPLICATION_STATUS_COLORS = {
  [APPLICATION_STATUS.PENDING]: 'orange',
  [APPLICATION_STATUS.IN_REVIEW]: 'blue',
  [APPLICATION_STATUS.APPROVED]: 'green',
  [APPLICATION_STATUS.REJECTED]: 'red'
};

// 商品審核狀態
export const PRODUCT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.PENDING]: '待審核',
  [PRODUCT_STATUS.APPROVED]: '已通過',
  [PRODUCT_STATUS.REJECTED]: '已拒絕'
};

export const PRODUCT_STATUS_COLORS = {
  [PRODUCT_STATUS.PENDING]: 'orange',
  [PRODUCT_STATUS.APPROVED]: 'green',
  [PRODUCT_STATUS.REJECTED]: 'red'
};

// 兌換訂單狀態
export const REDEMPTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const REDEMPTION_STATUS_LABELS = {
  [REDEMPTION_STATUS.PENDING]: '待處理',
  [REDEMPTION_STATUS.PROCESSING]: '處理中',
  [REDEMPTION_STATUS.SHIPPED]: '已出貨',
  [REDEMPTION_STATUS.COMPLETED]: '已完成',
  [REDEMPTION_STATUS.CANCELLED]: '已取消'
};

export const REDEMPTION_STATUS_COLORS = {
  [REDEMPTION_STATUS.PENDING]: 'orange',
  [REDEMPTION_STATUS.PROCESSING]: 'blue',
  [REDEMPTION_STATUS.SHIPPED]: 'cyan',
  [REDEMPTION_STATUS.COMPLETED]: 'green',
  [REDEMPTION_STATUS.CANCELLED]: 'red'
};

// 檢舉狀態
export const REPORT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
};

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: '待處理',
  [REPORT_STATUS.PROCESSING]: '處理中',
  [REPORT_STATUS.RESOLVED]: '已解決',
  [REPORT_STATUS.REJECTED]: '已拒絕'
};

export const REPORT_STATUS_COLORS = {
  [REPORT_STATUS.PENDING]: 'orange',
  [REPORT_STATUS.PROCESSING]: 'blue',
  [REPORT_STATUS.RESOLVED]: 'green',
  [REPORT_STATUS.REJECTED]: 'red'
};

// 檢舉類型
export const REPORT_TYPES = {
  USER: 'user',
  TEMPLE: 'temple',
  PRODUCT: 'product',
  OTHER: 'other'
};

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.USER]: '使用者',
  [REPORT_TYPES.TEMPLE]: '廟宇',
  [REPORT_TYPES.PRODUCT]: '商品',
  [REPORT_TYPES.OTHER]: '其他'
};

// 管理員角色
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

export const ADMIN_ROLE_LABELS = {
  [ADMIN_ROLES.SUPER_ADMIN]: '超級管理員',
  [ADMIN_ROLES.ADMIN]: '管理員',
  [ADMIN_ROLES.MODERATOR]: '協管員'
};

// 日誌類型
export const LOG_CATEGORIES = {
  USER: 'user',
  TEMPLE: 'temple',
  PRODUCT: 'product',
  REDEMPTION: 'redemption',
  SYSTEM: 'system',
  AUTH: 'auth'
};

export const LOG_CATEGORY_LABELS = {
  [LOG_CATEGORIES.USER]: '使用者',
  [LOG_CATEGORIES.TEMPLE]: '廟宇',
  [LOG_CATEGORIES.PRODUCT]: '商品',
  [LOG_CATEGORIES.REDEMPTION]: '兌換',
  [LOG_CATEGORIES.SYSTEM]: '系統',
  [LOG_CATEGORIES.AUTH]: '認證'
};
