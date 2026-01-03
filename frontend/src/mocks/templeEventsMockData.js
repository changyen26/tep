/**
 * Temple Events Mock Data
 * 廟方活動報名系統 Mock 資料
 */

// 生成隨機 ID
let eventIdCounter = 1;
let registrationIdCounter = 1;

// Mock 活動資料（至少 10 筆，各狀態都有）
export const mockEvents = [
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '新春祈福法會',
    description: '農曆新年期間舉辦的祈福法會，歡迎信眾參加。法會內容包含誦經、祈福儀式等。',
    location: '大殿',
    startAt: '2026-02-01T09:00',
    endAt: '2026-02-01T12:00',
    signupEndAt: '2026-01-25T23:59',
    capacity: 100,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=1',
    status: 'published',
    createdAt: '2025-12-15T10:00:00',
    updatedAt: '2025-12-20T15:30:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '平安符製作體驗活動',
    description: '親手製作專屬平安符，體驗傳統文化。由資深師傅指導，適合親子參加。',
    location: '文化教室',
    startAt: '2026-01-15T14:00',
    endAt: '2026-01-15T17:00',
    signupEndAt: '2026-01-10T23:59',
    capacity: 30,
    fee: 300,
    coverImageUrl: 'https://picsum.photos/800/400?random=2',
    status: 'published',
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '中秋祭月活動',
    description: '傳統中秋祭月儀式，包含祭月、賞月、品茗等活動。',
    location: '廣場',
    startAt: '2025-09-15T18:00',
    endAt: '2025-09-15T21:00',
    signupEndAt: '2025-09-10T23:59',
    capacity: 200,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=3',
    status: 'closed',
    createdAt: '2025-08-01T10:00:00',
    updatedAt: '2025-09-10T18:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '週末禪修課程',
    description: '靜坐禪修課程，適合初學者。課程包含基礎禪修教學、實作練習。',
    location: '禪修室',
    startAt: '2026-02-10T09:00',
    endAt: '2026-02-10T12:00',
    signupEndAt: '2026-02-05T23:59',
    capacity: 25,
    fee: 500,
    coverImageUrl: 'https://picsum.photos/800/400?random=4',
    status: 'draft',
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '端午節包粽子活動',
    description: '端午節應景活動，一起學習包粽子。材料費用已包含在報名費中。',
    location: '活動中心',
    startAt: '2025-06-05T09:00',
    endAt: '2025-06-05T13:00',
    signupEndAt: '2025-05-30T23:59',
    capacity: 50,
    fee: 200,
    coverImageUrl: 'https://picsum.photos/800/400?random=5',
    status: 'canceled',
    createdAt: '2025-05-01T10:00:00',
    updatedAt: '2025-05-25T14:20:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '兒童讀經班',
    description: '專為兒童設計的讀經課程，培養品德與文化素養。需家長陪同。',
    location: '國學教室',
    startAt: '2026-02-20T10:00',
    endAt: '2026-02-20T12:00',
    signupEndAt: '2026-02-15T23:59',
    capacity: 40,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=6',
    status: 'published',
    createdAt: '2026-01-05T10:00:00',
    updatedAt: '2026-01-05T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '年度會員大會',
    description: '一年一度的會員大會，討論廟宇發展事項，歡迎所有會員參加。',
    location: '會議廳',
    startAt: '2026-03-01T14:00',
    endAt: '2026-03-01T17:00',
    signupEndAt: '2026-02-25T23:59',
    capacity: 150,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=7',
    status: 'draft',
    createdAt: '2026-01-02T10:00:00',
    updatedAt: '2026-01-02T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '茶道體驗課程',
    description: '學習傳統茶道文化，包含茶葉知識、泡茶技巧、品茶禮儀等。',
    location: '茶藝室',
    startAt: '2026-01-25T15:00',
    endAt: '2026-01-25T18:00',
    signupEndAt: '2026-01-20T23:59',
    capacity: 20,
    fee: 600,
    coverImageUrl: 'https://picsum.photos/800/400?random=8',
    status: 'published',
    createdAt: '2025-12-20T10:00:00',
    updatedAt: '2025-12-20T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '義工培訓課程',
    description: '針對新進義工的培訓課程，講解廟宇文化、服務禮儀等。',
    location: '會議室',
    startAt: '2026-02-28T09:00',
    endAt: '2026-02-28T16:00',
    signupEndAt: '2026-02-20T23:59',
    capacity: 60,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=9',
    status: 'draft',
    createdAt: '2026-01-10T10:00:00',
    updatedAt: '2026-01-10T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '點燈祈福法會',
    description: '為親友點燈祈福，祈求平安順遂。法會後可領取祝福小禮。',
    location: '大殿',
    startAt: '2025-12-25T19:00',
    endAt: '2025-12-25T21:00',
    signupEndAt: '2025-12-20T23:59',
    capacity: 120,
    fee: 100,
    coverImageUrl: 'https://picsum.photos/800/400?random=10',
    status: 'closed',
    createdAt: '2025-11-01T10:00:00',
    updatedAt: '2025-12-20T18:00:00',
  },
];

// Mock 報名資料（為每個活動生成報名記錄）
export const mockRegistrations = [];

// 為每個活動生成報名資料
mockEvents.forEach((event) => {
  const numRegistrations = Math.floor(Math.random() * 30) + 10; // 每個活動 10-40 筆報名

  for (let i = 0; i < numRegistrations; i++) {
    const statuses = ['registered', 'canceled', 'waitlist'];
    const statusWeights = [0.7, 0.2, 0.1]; // 70% registered, 20% canceled, 10% waitlist

    const random = Math.random();
    let status = 'registered';
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (random < cumulative) {
        status = statuses[j];
        break;
      }
    }

    mockRegistrations.push({
      id: registrationIdCounter++,
      eventId: event.id,
      name: `參加者${i + 1}`,
      phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      email: `user${i + 1}@example.com`,
      status,
      registeredAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      notes: i % 5 === 0 ? '有特殊需求：素食' : '',
    });
  }
});

// 深拷貝函數
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// In-memory data storage (會在頁面重新整理後重置)
let eventsData = deepClone(mockEvents);
let registrationsData = deepClone(mockRegistrations);

/**
 * 模擬 API 延遲
 */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock API Functions
 */
export const mockTempleEventsAPI = {
  /**
   * 獲取活動列表
   */
  listEvents: async ({ status, q, page = 1, pageSize = 20 }) => {
    await delay();

    let filtered = [...eventsData];

    // 狀態篩選
    if (status && status !== 'all') {
      filtered = filtered.filter((e) => e.status === status);
    }

    // 關鍵字搜尋（標題、地點）
    if (q && q.trim()) {
      const keyword = q.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(keyword) ||
          e.location.toLowerCase().includes(keyword)
      );
    }

    // 排序：最新的在前
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分頁
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedEvents = filtered.slice(start, end);

    return {
      success: true,
      data: {
        events: paginatedEvents,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  /**
   * 獲取單一活動
   */
  getEvent: async (id) => {
    await delay();
    const event = eventsData.find((e) => e.id === parseInt(id));
    if (!event) {
      return { success: false, message: '活動不存在' };
    }

    // 計算報名統計
    const regs = registrationsData.filter((r) => r.eventId === event.id);
    const registeredCount = regs.filter((r) => r.status === 'registered').length;

    return {
      success: true,
      data: {
        ...event,
        registeredCount,
      },
    };
  },

  /**
   * 建立活動
   */
  createEvent: async (payload) => {
    await delay();

    const newEvent = {
      id: Math.max(...eventsData.map((e) => e.id), 0) + 1,
      ...payload,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    eventsData.push(newEvent);

    return {
      success: true,
      data: newEvent,
      message: '活動建立成功',
    };
  },

  /**
   * 更新活動
   */
  updateEvent: async (id, payload) => {
    await delay();

    const index = eventsData.findIndex((e) => e.id === parseInt(id));
    if (index === -1) {
      return { success: false, message: '活動不存在' };
    }

    eventsData[index] = {
      ...eventsData[index],
      ...payload,
      id: eventsData[index].id,
      status: eventsData[index].status,
      createdAt: eventsData[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: eventsData[index],
      message: '活動更新成功',
    };
  },

  /**
   * 發布活動
   */
  publishEvent: async (id) => {
    await delay();

    const index = eventsData.findIndex((e) => e.id === parseInt(id));
    if (index === -1) {
      return { success: false, message: '活動不存在' };
    }

    if (eventsData[index].status !== 'draft') {
      return { success: false, message: '只有草稿狀態的活動可以發布' };
    }

    eventsData[index].status = 'published';
    eventsData[index].updatedAt = new Date().toISOString();

    return {
      success: true,
      data: eventsData[index],
      message: '活動已發布',
    };
  },

  /**
   * 提前截止
   */
  closeEvent: async (id) => {
    await delay();

    const index = eventsData.findIndex((e) => e.id === parseInt(id));
    if (index === -1) {
      return { success: false, message: '活動不存在' };
    }

    if (eventsData[index].status !== 'published') {
      return { success: false, message: '只有已發布的活動可以提前截止' };
    }

    eventsData[index].status = 'closed';
    eventsData[index].updatedAt = new Date().toISOString();

    return {
      success: true,
      data: eventsData[index],
      message: '活動已截止報名',
    };
  },

  /**
   * 取消活動
   */
  cancelEvent: async (id) => {
    await delay();

    const index = eventsData.findIndex((e) => e.id === parseInt(id));
    if (index === -1) {
      return { success: false, message: '活動不存在' };
    }

    if (!['published', 'closed'].includes(eventsData[index].status)) {
      return { success: false, message: '只有已發布或已截止的活動可以取消' };
    }

    eventsData[index].status = 'canceled';
    eventsData[index].updatedAt = new Date().toISOString();

    return {
      success: true,
      data: eventsData[index],
      message: '活動已取消',
    };
  },

  /**
   * 獲取報名名單
   */
  listRegistrations: async (eventId, { status, q, page = 1, pageSize = 20 }) => {
    await delay();

    let filtered = registrationsData.filter(
      (r) => r.eventId === parseInt(eventId)
    );

    // 狀態篩選
    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }

    // 關鍵字搜尋（姓名、電話、email）
    if (q && q.trim()) {
      const keyword = q.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(keyword) ||
          r.phone.includes(keyword) ||
          r.email.toLowerCase().includes(keyword)
      );
    }

    // 排序：最新報名在前
    filtered.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    // 分頁
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRegs = filtered.slice(start, end);

    return {
      success: true,
      data: {
        registrations: paginatedRegs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },
};
