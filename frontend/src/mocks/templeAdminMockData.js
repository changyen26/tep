/**
 * Temple Admin Mock Data
 * 廟方管理系統完整 Mock 資料
 */

// ==================== Dashboard 統計資料 ====================
export const mockDashboardStats = {
  today: {
    checkins: 45,
    orders: 12,
    revenue: 3500,
    newUsers: 8,
  },
  week: {
    checkins: 320,
    orders: 85,
    revenue: 24500,
    newUsers: 52,
  },
  month: {
    checkins: 1250,
    orders: 340,
    revenue: 98000,
    newUsers: 186,
  },
  recentOrders: [
    { id: 1001, user_name: '王大明', product_name: '三官大帝平安符', merit_points_used: 100, status: 'pending', redeemed_at: '2026-01-26T10:30:00' },
    { id: 1002, user_name: '李淑芬', product_name: '三官寶殿紀念T恤', merit_points_used: 300, status: 'processing', redeemed_at: '2026-01-26T09:15:00' },
    { id: 1003, user_name: '張建國', product_name: '白河蓮花御守', merit_points_used: 150, status: 'completed', redeemed_at: '2026-01-25T16:45:00' },
    { id: 1004, user_name: '陳美珍', product_name: '開運五色線手環', merit_points_used: 80, status: 'shipped', redeemed_at: '2026-01-25T14:20:00' },
    { id: 1005, user_name: '林志成', product_name: '三官經典誦本', merit_points_used: 150, status: 'pending', redeemed_at: '2026-01-25T11:00:00' },
  ],
  topProducts: [
    { id: 1, name: '三官大帝平安符', sold_count: 156, revenue: 15600 },
    { id: 2, name: '白河蓮花御守', sold_count: 120, revenue: 18000 },
    { id: 3, name: '開運五色線手環', sold_count: 234, revenue: 18720 },
    { id: 4, name: '三官寶殿紀念T恤', sold_count: 67, revenue: 20100 },
    { id: 5, name: '三官經典誦本', sold_count: 45, revenue: 6750 },
  ],
  lowStockAlerts: [
    { id: 1, name: '三官大帝平安符', stock_quantity: 5, low_stock_threshold: 10 },
    { id: 6, name: '太歲符', stock_quantity: 3, low_stock_threshold: 5 },
  ],
};

// ==================== 商品資料 ====================
export const mockProducts = [
  {
    id: 1,
    name: '三官大帝平安符',
    description: '三官寶殿開光加持，祈求天官賜福、地官赦罪、水官解厄',
    category: 'charm',
    merit_points: 100,
    stock_quantity: 5,
    low_stock_threshold: 10,
    is_active: true,
    images: ['https://picsum.photos/200/200?random=101'],
    created_at: '2025-06-15T10:00:00',
  },
  {
    id: 2,
    name: '白河蓮花御守',
    description: '結合白河蓮花意象，象徵清淨吉祥',
    category: 'charm',
    merit_points: 150,
    stock_quantity: 50,
    low_stock_threshold: 10,
    is_active: true,
    images: ['https://picsum.photos/200/200?random=102'],
    created_at: '2025-07-20T10:00:00',
  },
  {
    id: 3,
    name: '三官寶殿紀念T恤',
    description: '純棉材質，印有三官寶殿建築圖案',
    category: 'tshirt',
    merit_points: 300,
    stock_quantity: 30,
    low_stock_threshold: 10,
    is_active: true,
    images: ['https://picsum.photos/200/200?random=103'],
    created_at: '2025-08-10T10:00:00',
  },
  {
    id: 4,
    name: '開運五色線手環',
    description: '傳統五色線編織，象徵五行調和',
    category: 'accessory',
    merit_points: 80,
    stock_quantity: 100,
    low_stock_threshold: 20,
    is_active: true,
    images: ['https://picsum.photos/200/200?random=104'],
    created_at: '2025-09-05T10:00:00',
  },
  {
    id: 5,
    name: '三官經典誦本',
    description: '收錄三官經、北斗經等常用經典',
    category: 'book',
    merit_points: 150,
    stock_quantity: 80,
    low_stock_threshold: 15,
    is_active: true,
    images: ['https://picsum.photos/200/200?random=105'],
    created_at: '2025-10-01T10:00:00',
  },
  {
    id: 6,
    name: '金箔御守',
    description: '限量金箔御守，收藏價值高',
    category: 'charm',
    merit_points: 500,
    stock_quantity: 3,
    low_stock_threshold: 5,
    is_active: true,
    images: ['https://picsum.photos/200/200?random=106'],
    created_at: '2025-11-15T10:00:00',
  },
  {
    id: 7,
    name: '香包組合',
    description: '傳統香包，含多種香料',
    category: 'accessory',
    merit_points: 80,
    stock_quantity: 120,
    low_stock_threshold: 20,
    is_active: true,
    images: ['https://picsum.photos/200/200?random=107'],
    created_at: '2025-12-01T10:00:00',
  },
  {
    id: 8,
    name: '祈福蠟燭',
    description: '天然蜂蠟製作，燃燒時間長',
    category: 'other',
    merit_points: 60,
    stock_quantity: 0,
    low_stock_threshold: 10,
    is_active: false,
    images: ['https://picsum.photos/200/200?random=108'],
    created_at: '2025-12-20T10:00:00',
  },
];

// ==================== 訂單資料 ====================
export const mockOrders = [
  {
    id: 1001,
    product_name: '平安符',
    product_id: 1,
    quantity: 1,
    user_name: '王小明',
    user_id: 101,
    recipient_name: '王小明',
    recipient_phone: '0912345678',
    recipient_address: '台北市大安區忠孝東路100號',
    merit_points_used: 100,
    status: 'pending',
    redeemed_at: '2026-01-26T10:30:00',
    temple_note: '',
    tracking_number: '',
  },
  {
    id: 1002,
    product_name: '開運T恤',
    product_id: 2,
    quantity: 1,
    user_name: '李小華',
    user_id: 102,
    recipient_name: '李小華',
    recipient_phone: '0923456789',
    recipient_address: '新北市板橋區文化路200號',
    merit_points_used: 300,
    status: 'processing',
    redeemed_at: '2026-01-26T09:15:00',
    processed_at: '2026-01-26T11:00:00',
    temple_note: '尺寸：L',
    tracking_number: '',
  },
  {
    id: 1003,
    product_name: '福氣貼紙',
    product_id: 3,
    quantity: 2,
    user_name: '張大偉',
    user_id: 103,
    recipient_name: '張大偉',
    recipient_phone: '0934567890',
    recipient_address: '台中市西區民生路300號',
    merit_points_used: 100,
    status: 'completed',
    redeemed_at: '2026-01-25T16:45:00',
    processed_at: '2026-01-25T17:00:00',
    shipped_at: '2026-01-25T18:00:00',
    completed_at: '2026-01-26T10:00:00',
    temple_note: '',
    tracking_number: 'TW123456789',
  },
  {
    id: 1004,
    product_name: '祈福手環',
    product_id: 4,
    quantity: 1,
    user_name: '陳美玲',
    user_id: 104,
    recipient_name: '陳美玲',
    recipient_phone: '0945678901',
    recipient_address: '高雄市前鎮區中山路400號',
    merit_points_used: 200,
    status: 'shipped',
    redeemed_at: '2026-01-25T14:20:00',
    processed_at: '2026-01-25T15:00:00',
    shipped_at: '2026-01-25T16:30:00',
    temple_note: '請小心包裝',
    tracking_number: 'TW987654321',
  },
  {
    id: 1005,
    product_name: '經典書籍',
    product_id: 5,
    quantity: 1,
    user_name: '林志豪',
    user_id: 105,
    recipient_name: '林志豪',
    recipient_phone: '0956789012',
    recipient_address: '台南市東區大學路500號',
    merit_points_used: 150,
    status: 'pending',
    redeemed_at: '2026-01-25T11:00:00',
    temple_note: '',
    tracking_number: '',
  },
  {
    id: 1006,
    product_name: '金箔御守',
    product_id: 6,
    quantity: 1,
    user_name: '黃雅婷',
    user_id: 106,
    recipient_name: '黃雅婷',
    recipient_phone: '0967890123',
    recipient_address: '桃園市中壢區中正路600號',
    merit_points_used: 500,
    status: 'cancelled',
    redeemed_at: '2026-01-24T10:00:00',
    cancelled_at: '2026-01-24T15:00:00',
    temple_note: '客戶要求取消',
    tracking_number: '',
  },
  {
    id: 1007,
    product_name: '香包組合',
    product_id: 7,
    quantity: 3,
    user_name: '吳建宏',
    user_id: 107,
    recipient_name: '吳建宏',
    recipient_phone: '0978901234',
    recipient_address: '新竹市東區光復路700號',
    merit_points_used: 240,
    status: 'completed',
    redeemed_at: '2026-01-23T09:30:00',
    processed_at: '2026-01-23T10:00:00',
    shipped_at: '2026-01-23T14:00:00',
    completed_at: '2026-01-24T16:00:00',
    temple_note: '',
    tracking_number: 'TW111222333',
  },
  {
    id: 1008,
    product_name: '平安符',
    product_id: 1,
    quantity: 5,
    user_name: '許淑芬',
    user_id: 108,
    recipient_name: '許淑芬',
    recipient_phone: '0989012345',
    recipient_address: '彰化市中山路800號',
    merit_points_used: 500,
    status: 'processing',
    redeemed_at: '2026-01-22T14:00:00',
    processed_at: '2026-01-22T16:00:00',
    temple_note: '大量訂購，請確認庫存',
    tracking_number: '',
  },
];

// ==================== 打卡紀錄資料 ====================
export const mockCheckins = [];
const userNames = ['王小明', '李小華', '張大偉', '陳美玲', '林志豪', '黃雅婷', '吳建宏', '許淑芬', '鄭家豪', '蔡宜君'];
const userPhones = ['0912345678', '0923456789', '0934567890', '0945678901', '0956789012', '0967890123', '0978901234', '0989012345', '0990123456', '0901234567'];

// 生成過去 30 天的打卡記錄
for (let i = 0; i < 150; i++) {
  const randomDays = Math.floor(Math.random() * 30);
  const randomHours = Math.floor(Math.random() * 12) + 6; // 6:00 - 18:00
  const randomMinutes = Math.floor(Math.random() * 60);
  const userIndex = Math.floor(Math.random() * 10);

  const date = new Date();
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);

  mockCheckins.push({
    id: i + 1,
    user_id: 100 + userIndex,
    user: {
      name: userNames[userIndex],
      phone: userPhones[userIndex],
      merit_points: Math.floor(Math.random() * 1000) + 100,
    },
    temple_id: 1,
    timestamp: date.toISOString(),
    merit_points_earned: 10,
  });
}

// 按時間排序
mockCheckins.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// ==================== 收入報表資料 ====================
export const generateRevenueReport = (startDate, endDate, groupBy) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const trend = [];

  let current = new Date(start);
  while (current <= end) {
    let period;
    if (groupBy === 'day') {
      period = current.toISOString().split('T')[0];
      current.setDate(current.getDate() + 1);
    } else if (groupBy === 'week') {
      const weekStart = new Date(current);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      period = `${weekStart.toISOString().split('T')[0]} 週`;
      current.setDate(current.getDate() + 7);
    } else {
      period = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      current.setMonth(current.getMonth() + 1);
    }

    trend.push({
      period,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      order_count: Math.floor(Math.random() * 20) + 5,
    });
  }

  const totalRevenue = trend.reduce((sum, t) => sum + t.revenue, 0);
  const totalOrders = trend.reduce((sum, t) => sum + t.order_count, 0);

  return {
    period: { start_date: startDate, end_date: endDate },
    summary: {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      average_order_value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    },
    trend,
    product_sales: [
      { product_id: 1, product_name: '平安符', total_quantity: 156, unit_price: 100, total_revenue: 15600, revenue_percentage: 25.5 },
      { product_id: 2, product_name: '開運T恤', total_quantity: 89, unit_price: 300, total_revenue: 26700, revenue_percentage: 43.7 },
      { product_id: 3, product_name: '福氣貼紙', total_quantity: 234, unit_price: 50, total_revenue: 11700, revenue_percentage: 19.1 },
      { product_id: 4, product_name: '祈福手環', total_quantity: 36, unit_price: 200, total_revenue: 7200, revenue_percentage: 11.7 },
    ],
  };
};

// ==================== 信眾資料 ====================
export const mockDevotees = [
  {
    public_user_id: 'usr_001',
    name: '王小明',
    email: 'wang@example.com',
    phone: '0912345678',
    last_seen_at: '2026-01-26T10:30:00',
    checkins_count: 45,
    orders_count: 8,
    spend_total: 1200,
    created_at: '2025-06-15T10:00:00',
  },
  {
    public_user_id: 'usr_002',
    name: '李小華',
    email: 'li@example.com',
    phone: '0923456789',
    last_seen_at: '2026-01-26T09:15:00',
    checkins_count: 32,
    orders_count: 5,
    spend_total: 850,
    created_at: '2025-07-20T10:00:00',
  },
  {
    public_user_id: 'usr_003',
    name: '張大偉',
    email: 'zhang@example.com',
    phone: '0934567890',
    last_seen_at: '2026-01-25T16:45:00',
    checkins_count: 28,
    orders_count: 12,
    spend_total: 2100,
    created_at: '2025-08-10T10:00:00',
  },
  {
    public_user_id: 'usr_004',
    name: '陳美玲',
    email: 'chen@example.com',
    phone: '0945678901',
    last_seen_at: '2026-01-25T14:20:00',
    checkins_count: 56,
    orders_count: 3,
    spend_total: 600,
    created_at: '2025-05-01T10:00:00',
  },
  {
    public_user_id: 'usr_005',
    name: '林志豪',
    email: 'lin@example.com',
    phone: '0956789012',
    last_seen_at: '2026-01-25T11:00:00',
    checkins_count: 18,
    orders_count: 7,
    spend_total: 950,
    created_at: '2025-09-15T10:00:00',
  },
  {
    public_user_id: 'usr_006',
    name: '黃雅婷',
    email: 'huang@example.com',
    phone: '0967890123',
    last_seen_at: '2026-01-24T10:00:00',
    checkins_count: 22,
    orders_count: 4,
    spend_total: 700,
    created_at: '2025-10-01T10:00:00',
  },
  {
    public_user_id: 'usr_007',
    name: '吳建宏',
    email: 'wu@example.com',
    phone: '0978901234',
    last_seen_at: '2026-01-23T09:30:00',
    checkins_count: 67,
    orders_count: 15,
    spend_total: 3200,
    created_at: '2025-04-20T10:00:00',
  },
  {
    public_user_id: 'usr_008',
    name: '許淑芬',
    email: 'hsu@example.com',
    phone: '0989012345',
    last_seen_at: '2026-01-22T14:00:00',
    checkins_count: 41,
    orders_count: 9,
    spend_total: 1800,
    created_at: '2025-06-01T10:00:00',
  },
  {
    public_user_id: 'usr_009',
    name: '鄭家豪',
    email: 'cheng@example.com',
    phone: '0990123456',
    last_seen_at: '2026-01-21T16:00:00',
    checkins_count: 35,
    orders_count: 6,
    spend_total: 1100,
    created_at: '2025-07-10T10:00:00',
  },
  {
    public_user_id: 'usr_010',
    name: '蔡宜君',
    email: 'tsai@example.com',
    phone: '0901234567',
    last_seen_at: '2026-01-20T10:30:00',
    checkins_count: 29,
    orders_count: 11,
    spend_total: 1650,
    created_at: '2025-08-25T10:00:00',
  },
];

// 信眾詳情
export const getDevoteeDetail = (publicUserId) => {
  const devotee = mockDevotees.find(d => d.public_user_id === publicUserId);
  if (!devotee) return null;

  return {
    profile: {
      ...devotee,
      last_login_at: devotee.last_seen_at,
    },
    summary: {
      checkins_count: devotee.checkins_count,
      events_count: Math.floor(Math.random() * 5),
      lamps_count: Math.floor(Math.random() * 3),
      orders_count: devotee.orders_count,
      spend_total: devotee.spend_total,
    },
    timeline: [
      { type: 'checkin', at: '2026-01-26T10:30:00', meta: { merit_points: 10 } },
      { type: 'order', at: '2026-01-25T14:00:00', meta: { order_id: 1001, product_name: '平安符', amount: 100, status: '已完成' } },
      { type: 'checkin', at: '2026-01-24T09:15:00', meta: { merit_points: 10 } },
      { type: 'event_registration', at: '2026-01-20T11:00:00', meta: { event_id: 1, event_name: '新春祈福法會' } },
      { type: 'lamp_application', at: '2026-01-15T16:30:00', meta: { lamp_type_id: 1, status: '已完成' } },
      { type: 'checkin', at: '2026-01-10T08:45:00', meta: { merit_points: 10 } },
    ],
  };
};

// ==================== 系統設定資料 ====================
export const mockSettings = {
  general: {
    temple_name: '慈恩宮',
    temple_id: 1,
    contact_email: 'admin@temple.com',
    contact_phone: '02-12345678',
    notification_enabled: true,
  },
  shop: {
    shop_enabled: true,
    min_points_for_redemption: 50,
    shipping_fee: 60,
    free_shipping_threshold: 500,
  },
  checkin: {
    daily_limit: 1,
    merit_points_per_checkin: 10,
    checkin_radius: 100,
  },
  notifications: {
    email_notification: true,
    sms_notification: false,
    push_notification: true,
    order_notification: true,
    event_reminder: true,
  },
  admins: [
    { id: 1, username: 'admin1', name: '管理員一', email: 'admin1@temple.com', role: 'admin', created_at: '2025-01-01T00:00:00' },
    { id: 2, username: 'admin2', name: '管理員二', email: 'admin2@temple.com', role: 'editor', created_at: '2025-03-15T00:00:00' },
    { id: 3, username: 'staff1', name: '工作人員', email: 'staff1@temple.com', role: 'viewer', created_at: '2025-06-01T00:00:00' },
  ],
};

// ==================== 進香登記資料 ====================
export const mockPilgrimageVisits = [
  {
    id: 1,
    temple_id: 1,
    organization_name: '大甲鎮瀾宮進香團',
    contact_name: '林主委',
    contact_phone: '0912111222',
    contact_email: 'lin@dajia.org.tw',
    expected_date: '2026-02-15',
    expected_time: '09:00',
    estimated_people: 200,
    transportation: 'bus',
    bus_count: 4,
    notes: '需要安排接待人員，預計停留2小時',
    status: 'confirmed',
    created_at: '2026-01-15T10:00:00',
    updated_at: '2026-01-18T14:30:00',
  },
  {
    id: 2,
    temple_id: 1,
    organization_name: '北港朝天宮友誼團',
    contact_name: '陳理事長',
    contact_phone: '0923222333',
    contact_email: 'chen@beigang.org.tw',
    expected_date: '2026-02-20',
    expected_time: '10:30',
    estimated_people: 150,
    transportation: 'bus',
    bus_count: 3,
    notes: '中午需用餐',
    status: 'pending',
    created_at: '2026-01-20T09:00:00',
    updated_at: '2026-01-20T09:00:00',
  },
  {
    id: 3,
    temple_id: 1,
    organization_name: '彰化天后宮',
    contact_name: '黃總幹事',
    contact_phone: '0934333444',
    contact_email: 'huang@changhua.org.tw',
    expected_date: '2026-01-28',
    expected_time: '14:00',
    estimated_people: 80,
    transportation: 'bus',
    bus_count: 2,
    notes: '',
    status: 'completed',
    created_at: '2026-01-05T11:00:00',
    updated_at: '2026-01-28T16:00:00',
  },
  {
    id: 4,
    temple_id: 1,
    organization_name: '台南大天后宮',
    contact_name: '張董事',
    contact_phone: '0945444555',
    contact_email: 'zhang@tainan.org.tw',
    expected_date: '2026-03-01',
    expected_time: '08:30',
    estimated_people: 300,
    transportation: 'bus',
    bus_count: 6,
    notes: '大型進香團，需提前準備',
    status: 'pending',
    created_at: '2026-01-22T15:00:00',
    updated_at: '2026-01-22T15:00:00',
  },
  {
    id: 5,
    temple_id: 1,
    organization_name: '基隆慶安宮',
    contact_name: '許秘書',
    contact_phone: '0956555666',
    contact_email: 'hsu@keelung.org.tw',
    expected_date: '2026-02-10',
    expected_time: '11:00',
    estimated_people: 50,
    transportation: 'self',
    bus_count: 0,
    notes: '自行開車前往',
    status: 'cancelled',
    created_at: '2026-01-10T08:00:00',
    updated_at: '2026-01-25T10:00:00',
  },
];

// ==================== Mock API 模擬延遲 ====================
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== Mock API Functions ====================
export const mockTempleAdminAPI = {
  // Dashboard
  getDashboardStats: async () => {
    await delay();
    return { success: true, data: mockDashboardStats };
  },

  // Products
  listProducts: async (params = {}) => {
    await delay();
    let filtered = [...mockProducts];

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(kw));
    }

    if (params.category) {
      filtered = filtered.filter(p => p.category === params.category);
    }

    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return {
      success: true,
      data: {
        products: paginated,
        total: filtered.length,
      },
    };
  },

  getProduct: async (productId) => {
    await delay();
    const product = mockProducts.find(p => p.id === parseInt(productId));
    return product ? { success: true, data: product } : { success: false, message: '商品不存在' };
  },

  // Orders
  listOrders: async (params = {}) => {
    await delay();
    let filtered = [...mockOrders];

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(o =>
        o.user_name.toLowerCase().includes(kw) ||
        String(o.id).includes(kw)
      );
    }

    if (params.status) {
      filtered = filtered.filter(o => o.status === params.status);
    }

    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return {
      success: true,
      data: {
        orders: paginated,
        total: filtered.length,
      },
    };
  },

  getOrder: async (orderId) => {
    await delay();
    const order = mockOrders.find(o => o.id === parseInt(orderId));
    return order ? { success: true, data: order } : { success: false, message: '訂單不存在' };
  },

  // Checkins
  listCheckins: async (params = {}) => {
    await delay();
    let filtered = [...mockCheckins];

    if (params.start_date) {
      filtered = filtered.filter(c => new Date(c.timestamp) >= new Date(params.start_date));
    }

    if (params.end_date) {
      filtered = filtered.filter(c => new Date(c.timestamp) <= new Date(params.end_date));
    }

    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return {
      success: true,
      data: {
        checkins: paginated,
        total: filtered.length,
      },
    };
  },

  // Revenue
  getRevenueReport: async (params = {}) => {
    await delay();
    const report = generateRevenueReport(
      params.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      params.end_date || new Date().toISOString().split('T')[0],
      params.group_by || 'day'
    );
    return { success: true, data: report };
  },

  // Devotees
  listDevotees: async (params = {}) => {
    await delay();
    let filtered = [...mockDevotees];

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(kw) ||
        d.email.toLowerCase().includes(kw)
      );
    }

    // 排序
    if (params.sort === 'checkins') {
      filtered.sort((a, b) => b.checkins_count - a.checkins_count);
    } else if (params.sort === 'spend') {
      filtered.sort((a, b) => b.spend_total - a.spend_total);
    } else {
      filtered.sort((a, b) => new Date(b.last_seen_at) - new Date(a.last_seen_at));
    }

    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return {
      success: true,
      data: {
        items: paginated,
        total: filtered.length,
      },
    };
  },

  getDevotee: async (publicUserId) => {
    await delay();
    const detail = getDevoteeDetail(publicUserId);
    return detail ? { success: true, data: detail } : { success: false, message: '信眾不存在' };
  },

  // Settings
  getSettings: async () => {
    await delay();
    return { success: true, data: mockSettings };
  },

  updateSettings: async (section, data) => {
    await delay();
    mockSettings[section] = { ...mockSettings[section], ...data };
    return { success: true, data: mockSettings[section], message: '設定已儲存' };
  },

  // Pilgrimage Visits
  listPilgrimageVisits: async (params = {}) => {
    await delay();
    let filtered = [...mockPilgrimageVisits];

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter(v => v.status === params.status);
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return {
      success: true,
      data: {
        visits: paginated,
        total: filtered.length,
      },
    };
  },

  getPilgrimageVisit: async (visitId) => {
    await delay();
    const visit = mockPilgrimageVisits.find(v => v.id === parseInt(visitId));
    return visit ? { success: true, data: visit } : { success: false, message: '進香登記不存在' };
  },
};

// ==================== 數據分析 Mock 資料 ====================
export const mockAnalyticsData = (period = '30d') => {
  // 根據期間調整數據規模
  const multiplier = {
    '7d': 0.25,
    '30d': 1,
    '90d': 3,
    '365d': 12,
  }[period] || 1;

  const totalMembers = Math.floor(1250 * multiplier);
  const activeMembers = Math.floor(totalMembers * 0.45);
  const newMembers = Math.floor(186 * (period === '7d' ? 0.25 : period === '30d' ? 1 : period === '90d' ? 2.5 : 8));
  const dormantMembers = Math.floor(totalMembers * 0.25);

  // 產生活動趨勢資料
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const activityTrend = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    activityTrend.push({
      date: date.toISOString().split('T')[0],
      checkins: Math.floor(Math.random() * 50) + 20,
      orders: Math.floor(Math.random() * 15) + 3,
      events: Math.floor(Math.random() * 8) + 1,
    });
  }

  return {
    overview: {
      total_members: totalMembers,
      active_members: activeMembers,
      active_rate: Math.round((activeMembers / totalMembers) * 100),
      new_members: newMembers,
      dormant_members: dormantMembers,
      dormant_rate: Math.round((dormantMembers / totalMembers) * 100),
    },
    activity_trend: activityTrend,
    interaction_types: [
      { type: '僅打卡', count: Math.floor(totalMembers * 0.35) },
      { type: '僅下單', count: Math.floor(totalMembers * 0.15) },
      { type: '多元互動', count: Math.floor(totalMembers * 0.50) },
    ],
    checkin_frequency: [
      { range: '1次', count: Math.floor(totalMembers * 0.30), percentage: 30 },
      { range: '2-5次', count: Math.floor(totalMembers * 0.35), percentage: 35 },
      { range: '6-10次', count: Math.floor(totalMembers * 0.20), percentage: 20 },
      { range: '11-20次', count: Math.floor(totalMembers * 0.10), percentage: 10 },
      { range: '20+次', count: Math.floor(totalMembers * 0.05), percentage: 5 },
    ],
    top_devotees: [
      { public_user_id: 'usr_007', name_masked: '吳**', checkins_count: 67, orders_count: 15, spend_total: 3200 },
      { public_user_id: 'usr_004', name_masked: '陳**', checkins_count: 56, orders_count: 3, spend_total: 600 },
      { public_user_id: 'usr_001', name_masked: '王**', checkins_count: 45, orders_count: 8, spend_total: 1200 },
      { public_user_id: 'usr_008', name_masked: '許**', checkins_count: 41, orders_count: 9, spend_total: 1800 },
      { public_user_id: 'usr_009', name_masked: '鄭**', checkins_count: 35, orders_count: 6, spend_total: 1100 },
      { public_user_id: 'usr_002', name_masked: '李**', checkins_count: 32, orders_count: 5, spend_total: 850 },
      { public_user_id: 'usr_010', name_masked: '蔡**', checkins_count: 29, orders_count: 11, spend_total: 1650 },
      { public_user_id: 'usr_003', name_masked: '張**', checkins_count: 28, orders_count: 12, spend_total: 2100 },
      { public_user_id: 'usr_006', name_masked: '黃**', checkins_count: 22, orders_count: 4, spend_total: 700 },
      { public_user_id: 'usr_005', name_masked: '林**', checkins_count: 18, orders_count: 7, spend_total: 950 },
    ],
    spend_distribution: [
      { range: '未消費', count: Math.floor(totalMembers * 0.40), percentage: 40 },
      { range: '1-100', count: Math.floor(totalMembers * 0.25), percentage: 25 },
      { range: '101-500', count: Math.floor(totalMembers * 0.20), percentage: 20 },
      { range: '501-1000', count: Math.floor(totalMembers * 0.10), percentage: 10 },
      { range: '1000+', count: Math.floor(totalMembers * 0.05), percentage: 5 },
    ],
    funnel: {
      all_members: totalMembers,
      active_30d: activeMembers,
      made_order: Math.floor(activeMembers * 0.45),
      repeat_order: Math.floor(activeMembers * 0.18),
    },
    retention: {
      mom_retention_rate: 62,
      weekly_return_rate: 38,
      churned_this_month: Math.floor(activeMembers * 0.08),
      avg_return_days: 12,
    },
    member_tenure: [
      { tenure: 'newcomer', count: Math.floor(totalMembers * 0.15), percentage: 15 },
      { tenure: 'establishing', count: Math.floor(totalMembers * 0.30), percentage: 30 },
      { tenure: 'loyal', count: Math.floor(totalMembers * 0.35), percentage: 35 },
      { tenure: 'veteran', count: Math.floor(totalMembers * 0.20), percentage: 20 },
    ],
    // 香客年齡結構
    age_distribution: [
      { range: '18-24歲', count: Math.floor(totalMembers * 0.12), percentage: 12 },
      { range: '25-34歲', count: Math.floor(totalMembers * 0.28), percentage: 28 },
      { range: '35-49歲', count: Math.floor(totalMembers * 0.25), percentage: 25 },
      { range: '50-64歲', count: Math.floor(totalMembers * 0.22), percentage: 22 },
      { range: '65歲+', count: Math.floor(totalMembers * 0.13), percentage: 13 },
    ],
  };
};

// ==================== 經營診斷儀表板 Mock 資料 ====================
export const mockBusinessDashboardData = (month = '2026-01') => {
  // 模擬根據月份產生不同數據
  const baseScore = 72;
  const variance = Math.floor(Math.random() * 10) - 5;

  return {
    // 健康度評分
    health_score: {
      overall: {
        score: baseScore + variance,
        trend: 3,
        benchmark_comparison: '高於同規模廟宇平均',
      },
      pillars: {
        acquisition: {
          score: 85,
          value: '+156 人',
          change: 12,
          benchmark: '+100 人/月',
        },
        activation: {
          score: 68,
          value: '42%',
          change: -3,
          benchmark: '45%',
        },
        retention: {
          score: 45,
          value: '38%',
          change: -15,
          benchmark: '50%',
        },
        revenue: {
          score: 82,
          value: '$98,500',
          change: 8,
          benchmark: '$80,000/月',
        },
      },
    },

    // 警示
    alerts: [
      {
        severity: 'critical',
        title: '留存率持續下滑',
        description: '連續 3 個月低於警戒線 (50%)，本月僅 38%。90天內有 245 位信眾未回訪。',
        action: '查看流失名單',
      },
      {
        severity: 'warning',
        title: '30-50歲族群活躍度下降',
        description: '此年齡層本月活躍率較上月下降 18%，可能與活動時間安排有關。',
        action: '分析活動時段',
      },
      {
        severity: 'info',
        title: '新會員轉換率有提升空間',
        description: '首次打卡後 7 天內未消費比例達 72%，建議設計新會員禮遇。',
        action: '設計新客方案',
      },
    ],

    // 建議行動
    recommendations: [
      {
        priority: 'high',
        title: '啟動「沉睡信眾喚醒計畫」',
        description: '針對 60-90 天未回訪的 156 位信眾，發送關懷訊息搭配專屬點燈優惠。',
        expected_impact: '預估可喚醒 30% (約47人)',
      },
      {
        priority: 'high',
        title: '增設假日法會場次',
        description: '數據顯示 65% 的 30-50 歲信眾偏好假日參拜，但目前法會多安排於平日。',
        expected_impact: '預估提升此族群活躍度 25%',
      },
      {
        priority: 'medium',
        title: '推出「帶朋友來」推薦活動',
        description: '目前口碑推薦佔新客來源僅 15%，低於業界平均 30%。建議設計推薦獎勵機制。',
        expected_impact: '每月新增 30-50 位推薦會員',
      },
    ],

    // 轉換漏斗
    funnel: {
      visitors: { count: 3250, rate: null },
      members: { count: 1850, rate: 57 },
      active: { count: 780, rate: 42 },
      converted: { count: 285, rate: 37 },
    },

    // 留存同類群
    cohort: [
      { month: '2025-10', new_members: 186, retention: [62, 48, 35, null, null, null] },
      { month: '2025-11', new_members: 142, retention: [58, 42, null, null, null, null] },
      { month: '2025-12', new_members: 168, retention: [65, null, null, null, null, null] },
      { month: '2026-01', new_members: 156, retention: [null, null, null, null, null, null] },
    ],

    // 活動 ROI
    event_roi: [
      {
        name: '新春祈福法會',
        date: '2026-01-29',
        cost: 15000,
        new_members: 89,
        revenue: 52000,
        roi: 2.5,
      },
      {
        name: '元宵點燈活動',
        date: '2026-02-12',
        cost: 8000,
        new_members: 45,
        revenue: 28000,
        roi: 2.5,
      },
      {
        name: '社區健康講座',
        date: '2026-01-15',
        cost: 5000,
        new_members: 12,
        revenue: 3500,
        roi: -0.3,
      },
      {
        name: '年終感恩餐會',
        date: '2025-12-28',
        cost: 25000,
        new_members: 35,
        revenue: 65000,
        roi: 1.6,
      },
    ],

    // 會議討論要點
    meeting_points: {
      wins: [
        '新春法會創下單日最高營收 $52,000',
        '社群媒體觸及率提升 45%',
        '新會員數較去年同期成長 23%',
      ],
      concerns: [
        '會員留存率連續下滑，需立即處理',
        '中壯年族群參與度明顯下降',
        '庫存商品週轉率偏低 (平安符庫存已 6 個月)',
      ],
      next_month_goals: [
        '留存率提升至 45% 以上',
        '完成沉睡會員喚醒計畫第一階段',
        '規劃假日法會測試場次',
      ],
    },
  };
};

export default mockTempleAdminAPI;
