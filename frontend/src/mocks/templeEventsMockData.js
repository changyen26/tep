/**
 * Temple Events Mock Data
 * 廟方活動報名系統 Mock 資料
 */

// 生成隨機 ID
let eventIdCounter = 1;
let registrationIdCounter = 1;

// Mock 活動資料（三官寶殿專屬活動）
export const mockEvents = [
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '上元天官賜福法會',
    description: '農曆正月十五上元節，恭祝天官大帝聖誕，祈求天官賜福、消災解厄。法會內容包含誦經、祈福儀式、過火等。',
    location: '三官寶殿正殿',
    startAt: '2026-02-12T08:00',
    endAt: '2026-02-12T12:00',
    signupEndAt: '2026-02-10T23:59',
    capacity: 150,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=1',
    status: 'published',
    createdAt: '2025-12-15T10:00:00',
    updatedAt: '2025-12-20T15:30:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '白河蓮花季祈福活動',
    description: '結合白河蓮花季，舉辦蓮花供佛祈福活動。參加者可獲得開光蓮花平安符一枚。',
    location: '三官寶殿廣場',
    startAt: '2026-06-20T09:00',
    endAt: '2026-06-20T16:00',
    signupEndAt: '2026-06-15T23:59',
    capacity: 200,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=2',
    status: 'draft',
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '中元地官赦罪法會',
    description: '農曆七月十五中元節，恭祝地官大帝聖誕，超度祖先亡靈、祈求地官赦罪。提供普度法會服務。',
    location: '三官寶殿正殿',
    startAt: '2025-08-29T07:00',
    endAt: '2025-08-29T17:00',
    signupEndAt: '2025-08-25T23:59',
    capacity: 300,
    fee: 500,
    coverImageUrl: 'https://picsum.photos/800/400?random=3',
    status: 'closed',
    createdAt: '2025-07-01T10:00:00',
    updatedAt: '2025-08-25T18:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '三官大帝文化講座',
    description: '邀請專家講解三官大帝信仰由來、祭祀禮儀、道教文化等，適合對傳統文化有興趣的信眾參加。',
    location: '活動中心',
    startAt: '2026-02-22T14:00',
    endAt: '2026-02-22T17:00',
    signupEndAt: '2026-02-18T23:59',
    capacity: 50,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=4',
    status: 'published',
    createdAt: '2026-01-01T10:00:00',
    updatedAt: '2026-01-01T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '親子手作香包活動',
    description: '端午節前夕，帶領親子一同製作傳統香包，內含艾草、菖蒲等避邪植物。材料費已包含。',
    location: '活動中心',
    startAt: '2025-05-28T09:00',
    endAt: '2025-05-28T12:00',
    signupEndAt: '2025-05-25T23:59',
    capacity: 30,
    fee: 150,
    coverImageUrl: 'https://picsum.photos/800/400?random=5',
    status: 'canceled',
    createdAt: '2025-05-01T10:00:00',
    updatedAt: '2025-05-20T14:20:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '下元水官解厄法會',
    description: '農曆十月十五下元節，恭祝水官大帝聖誕，祈求水官解厄、消災祈福。',
    location: '三官寶殿正殿',
    startAt: '2026-11-23T08:00',
    endAt: '2026-11-23T12:00',
    signupEndAt: '2026-11-20T23:59',
    capacity: 120,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=6',
    status: 'draft',
    createdAt: '2026-01-05T10:00:00',
    updatedAt: '2026-01-05T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '白河關子嶺進香團',
    description: '本殿組團前往關子嶺火王爺廟進香，車資、午餐由廟方提供。名額有限，報名從速。',
    location: '三官寶殿集合出發',
    startAt: '2026-03-15T06:30',
    endAt: '2026-03-15T18:00',
    signupEndAt: '2026-03-10T23:59',
    capacity: 45,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=7',
    status: 'published',
    createdAt: '2026-01-02T10:00:00',
    updatedAt: '2026-01-02T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '安太歲點燈法會',
    description: '新年安太歲、點光明燈服務。為信眾祈求新的一年平安順利、事業順遂。',
    location: '三官寶殿太歲殿',
    startAt: '2026-01-30T09:00',
    endAt: '2026-01-30T17:00',
    signupEndAt: '2026-01-28T23:59',
    capacity: 200,
    fee: 600,
    coverImageUrl: 'https://picsum.photos/800/400?random=8',
    status: 'published',
    createdAt: '2025-12-20T10:00:00',
    updatedAt: '2025-12-20T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '廟務義工招募說明會',
    description: '招募熱心信眾加入義工行列，協助廟務運作、活動辦理等。歡迎有志者報名參加。',
    location: '活動中心',
    startAt: '2026-02-08T14:00',
    endAt: '2026-02-08T16:00',
    signupEndAt: '2026-02-05T23:59',
    capacity: 40,
    fee: 0,
    coverImageUrl: 'https://picsum.photos/800/400?random=9',
    status: 'published',
    createdAt: '2026-01-10T10:00:00',
    updatedAt: '2026-01-10T10:00:00',
  },
  {
    id: eventIdCounter++,
    templeId: 1,
    title: '冬至湯圓祈福活動',
    description: '冬至團圓日，廟方準備湯圓與信眾共享，並舉行簡單祈福儀式。免費參加，歡迎闔家蒞臨。',
    location: '三官寶殿廣場',
    startAt: '2025-12-22T10:00',
    endAt: '2025-12-22T14:00',
    signupEndAt: '2025-12-20T23:59',
    capacity: 100,
    fee: 0,
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

    // 隨機決定是否已簽到（已完成活動的報名者有較高簽到率）
    const isClosedEvent = event.status === 'closed';
    const checkedIn = status === 'registered' && (isClosedEvent ? Math.random() < 0.8 : Math.random() < 0.3);

    // 台灣常見姓名
    const surnames = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '郭', '洪'];
    const maleNames = ['建宏', '志豪', '俊傑', '冠宇', '家豪', '宗翰', '承恩', '柏翰', '彥廷', '宥辰'];
    const femaleNames = ['淑芬', '美玲', '雅婷', '怡君', '佳蓉', '詩涵', '宜靜', '惠如', '雅雯', '靜宜'];
    const isFemale = Math.random() > 0.5;
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const givenName = isFemale
      ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
      : maleNames[Math.floor(Math.random() * maleNames.length)];
    const fullName = surname + givenName;

    const notes = ['', '', '', '', '素食', '行動不便需協助', '攜帶長輩參加', '第一次參加'][Math.floor(Math.random() * 8)];

    mockRegistrations.push({
      id: registrationIdCounter++,
      eventId: event.id,
      name: fullName,
      phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      email: `${surname.toLowerCase()}${Math.floor(Math.random() * 1000)}@gmail.com`,
      status,
      registeredAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      notes,
      checkedIn,
      checkedInAt: checkedIn
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
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

    // 為每個活動計算已報名人數
    const eventsWithCount = paginatedEvents.map((event) => {
      const regs = registrationsData.filter(
        (r) => r.eventId === event.id && r.status === 'registered'
      );
      return {
        ...event,
        registeredCount: regs.length,
      };
    });

    return {
      success: true,
      data: {
        events: eventsWithCount,
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
