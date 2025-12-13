/**
 * 主題配色常數
 * 參考：平安符打卡系統設計文件
 */

// 主要配色
export const COLORS = {
  // 富貴金 - 象徵神聖、光明、財富
  GOLD: '#BDA138',
  GOLD_RGB: '189, 161, 56',

  // 玄帝黑（藍）- 象徵北方、水、玄天上帝
  DARK: '#242428',
  DARK_RGB: '36, 36, 40',

  // 輔助色
  WHITE: '#FFFFFF',
  LIGHT_BG: '#F5F5F5',
  BORDER: '#E0E0E0',

  // 功能色
  SUCCESS: '#52C41A',
  WARNING: '#FAAD14',
  ERROR: '#F5222D',
  INFO: '#1890FF',
};

// Ant Design 主題配置
export const THEME_CONFIG = {
  token: {
    colorPrimary: COLORS.GOLD,
    colorBgContainer: COLORS.WHITE,
    colorText: COLORS.DARK,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
  components: {
    Button: {
      primaryColor: COLORS.DARK,
      defaultBg: COLORS.GOLD,
      defaultBorderColor: COLORS.GOLD,
      borderRadius: 8,
      controlHeight: 44,
      fontSize: 16,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 44,
    },
  },
};

// 漸層色
export const GRADIENTS = {
  GOLD: `linear-gradient(135deg, ${COLORS.GOLD} 0%, #D4B756 100%)`,
  DARK: `linear-gradient(135deg, ${COLORS.DARK} 0%, #3A3A3E 100%)`,
  GOLD_SHINE: `linear-gradient(135deg, ${COLORS.GOLD} 0%, #F0D98E 50%, ${COLORS.GOLD} 100%)`,
};

// 陰影效果
export const SHADOWS = {
  SMALL: '0 2px 8px rgba(0, 0, 0, 0.08)',
  MEDIUM: '0 4px 16px rgba(0, 0, 0, 0.12)',
  LARGE: '0 8px 24px rgba(0, 0, 0, 0.16)',
  GOLD: `0 4px 16px rgba(${COLORS.GOLD_RGB}, 0.3)`,
};

// 斷點
export const BREAKPOINTS = {
  MOBILE: '480px',
  TABLET: '768px',
  DESKTOP: '1024px',
  WIDE: '1280px',
};

// Z-Index 層級
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};
