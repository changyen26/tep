/**
 * Temple Lamps Mock Data
 * 點燈管理系統 Mock 資料
 */

// 生成隨機 ID
let lampTypeIdCounter = 1;
let applicationIdCounter = 1;

// 當前年度
const currentYear = new Date().getFullYear();

// Mock 燈種資料（至少 8 種，包含今年和明年）
export const mockLampTypes = [
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '光明燈',
    description: '祈求平安順遂，光明照耀全家。適合全家人點燈祈福。',
    year: currentYear,
    price: 600,
    capacity: 108,
    isActive: true,
    imageUrl: 'https://picsum.photos/400/300?random=101',
    createdAt: new Date(currentYear - 1, 11, 1).toISOString(),
    updatedAt: new Date(currentYear - 1, 11, 15).toISOString(),
  },
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '太歲燈',
    description: '安太歲，化解流年不利。適合犯太歲者點燈祈福消災。',
    year: currentYear,
    price: 800,
    capacity: 60,
    isActive: true,
    imageUrl: 'https://picsum.photos/400/300?random=102',
    createdAt: new Date(currentYear - 1, 11, 1).toISOString(),
    updatedAt: new Date(currentYear - 1, 11, 15).toISOString(),
  },
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '財神燈',
    description: '祈求財源廣進、生意興隆。適合商家或求財者點燈。',
    year: currentYear,
    price: 1200,
    capacity: 36,
    isActive: true,
    imageUrl: 'https://picsum.photos/400/300?random=103',
    createdAt: new Date(currentYear - 1, 11, 1).toISOString(),
    updatedAt: new Date(currentYear - 1, 11, 15).toISOString(),
  },
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '文昌燈',
    description: '祈求學業進步、考試順利。適合學生或考生點燈。',
    year: currentYear,
    price: 500,
    capacity: 50,
    isActive: true,
    imageUrl: 'https://picsum.photos/400/300?random=104',
    createdAt: new Date(currentYear - 1, 11, 1).toISOString(),
    updatedAt: new Date(currentYear - 1, 11, 15).toISOString(),
  },
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '姻緣燈',
    description: '祈求良緣美滿、夫妻和合。適合單身或新婚者點燈。',
    year: currentYear,
    price: 800,
    capacity: null, // 不限名額
    isActive: true,
    imageUrl: 'https://picsum.photos/400/300?random=105',
    createdAt: new Date(currentYear - 1, 11, 1).toISOString(),
    updatedAt: new Date(currentYear - 1, 11, 15).toISOString(),
  },
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '健康燈',
    description: '祈求身體健康、疾病遠離。適合長者或病患點燈。',
    year: currentYear,
    price: 600,
    capacity: 80,
    isActive: false, // 已關閉
    imageUrl: 'https://picsum.photos/400/300?random=106',
    createdAt: new Date(currentYear - 1, 11, 1).toISOString(),
    updatedAt: new Date(currentYear, 0, 10).toISOString(),
  },
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '光明燈',
    description: '明年度光明燈，祈求平安順遂。',
    year: currentYear + 1,
    price: 650,
    capacity: 108,
    isActive: true,
    imageUrl: 'https://picsum.photos/400/300?random=107',
    createdAt: new Date(currentYear, 10, 1).toISOString(),
    updatedAt: new Date(currentYear, 10, 1).toISOString(),
  },
  {
    id: lampTypeIdCounter++,
    templeId: 1,
    name: '事業燈',
    description: '祈求事業順利、步步高升。適合上班族或創業者。',
    year: currentYear,
    price: 1000,
    capacity: 48,
    isActive: true,
    imageUrl: 'https://picsum.photos/400/300?random=108',
    createdAt: new Date(currentYear - 1, 11, 1).toISOString(),
    updatedAt: new Date(currentYear - 1, 11, 15).toISOString(),
  },
];

// Mock 點燈申請資料（為每個燈種生成申請記錄）
export const mockLampApplications = [];

// 常見姓名
const sampleNames = [
  '王小明', '李美華', '陳建國', '林雅婷', '張文傑',
  '黃志明', '吳佳玲', '蔡依林', '劉建宏', '鄭淑芬',
  '何家豪', '許雅文', '周俊傑', '徐美玲', '孫志強',
  '楊淑惠', '蘇文彬', '謝雅雯', '高明哲', '羅佳玲',
  '曾志豪', '葉美珍', '彭建華', '董雅婷', '韓志偉',
  '馮淑玲', '方文傑', '石雅芳', '白建國', '邱美華',
];

// 生肖
const zodiacs = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

// 為每個燈種生成申請記錄
mockLampTypes.forEach((lampType) => {
  const numApps = Math.floor(Math.random() * 20) + 20; // 每個燈種 20-40 筆

  for (let i = 0; i < numApps; i++) {
    const statuses = ['pending', 'paid', 'completed', 'canceled'];
    const statusWeights = [0.2, 0.3, 0.4, 0.1]; // 20% pending, 30% paid, 40% completed, 10% canceled

    const random = Math.random();
    let status = 'completed';
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (random < cumulative) {
        status = statuses[j];
        break;
      }
    }

    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const birthday = new Date(
      1950 + Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 12),
      1 + Math.floor(Math.random() * 28)
    )
      .toISOString()
      .split('T')[0];

    mockLampApplications.push({
      id: applicationIdCounter++,
      lampTypeId: lampType.id,
      userId: i % 3 === 0 ? i + 1 : null, // 有些有 userId，有些沒有
      applicantName: name,
      phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      email: i % 2 === 0 ? `user${i}@example.com` : null,
      birthday,
      lunarBirthday: i % 4 === 0 ? `農曆${Math.ceil(Math.random() * 12)}月${Math.ceil(Math.random() * 30)}日` : null,
      zodiac: zodiacs[parseInt(birthday.substring(0, 4)) % 12],
      address: i % 3 === 0 ? `台北市信義區信義路${Math.floor(Math.random() * 100) + 1}號` : null,
      wish: i % 5 === 0 ? '祈求平安順遂，闔家安康' : null,
      status,
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: status !== 'pending' ? new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString() : null,
    });
  }
});

// 深拷貝函數
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// In-memory data storage（會在頁面重新整理後重置）
let lampTypesData = deepClone(mockLampTypes);
let applicationsData = deepClone(mockLampApplications);

/**
 * 模擬 API 延遲
 */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 計算燈種統計
 */
const calculateStats = (lampTypeId) => {
  const apps = applicationsData.filter((app) => app.lampTypeId === lampTypeId);
  const totalApplications = apps.length;
  const paidCount = apps.filter((app) => app.status === 'paid').length;
  const completedCount = apps.filter((app) => app.status === 'completed').length;
  const canceledCount = apps.filter((app) => app.status === 'canceled').length;

  const lampType = lampTypesData.find((lt) => lt.id === lampTypeId);
  const remaining = lampType?.capacity
    ? lampType.capacity - (paidCount + completedCount)
    : null;

  return {
    totalApplications,
    paidCount,
    completedCount,
    canceledCount,
    remaining,
  };
};

/**
 * Mock API Functions
 */
export const mockTempleLampsAPI = {
  /**
   * 獲取燈種列表
   */
  listLampTypes: async ({ templeId, year, isActive, q, page = 1, pageSize = 20 }) => {
    await delay();

    let filtered = lampTypesData.filter((lt) => lt.templeId === parseInt(templeId));

    // 年度篩選
    if (year) {
      filtered = filtered.filter((lt) => lt.year === parseInt(year));
    }

    // 開放狀態篩選
    if (isActive !== undefined && isActive !== 'all') {
      const active = isActive === 'true' || isActive === true;
      filtered = filtered.filter((lt) => lt.isActive === active);
    }

    // 關鍵字搜尋（名稱、說明）
    if (q && q.trim()) {
      const keyword = q.trim().toLowerCase();
      filtered = filtered.filter(
        (lt) =>
          lt.name.toLowerCase().includes(keyword) ||
          (lt.description && lt.description.toLowerCase().includes(keyword))
      );
    }

    // 排序：最新的在前
    filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // 加上統計資訊
    const withStats = filtered.map((lt) => ({
      ...lt,
      stats: calculateStats(lt.id),
    }));

    // 分頁
    const total = withStats.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = withStats.slice(start, end);

    return {
      success: true,
      data: {
        lampTypes: paginatedItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  /**
   * 獲取單一燈種
   */
  getLampType: async (templeId, lampTypeId) => {
    await delay();

    const lampType = lampTypesData.find(
      (lt) => lt.id === parseInt(lampTypeId) && lt.templeId === parseInt(templeId)
    );

    if (!lampType) {
      return { success: false, message: '燈種不存在' };
    }

    return {
      success: true,
      data: {
        ...lampType,
        stats: calculateStats(lampType.id),
      },
    };
  },

  /**
   * 建立燈種
   */
  createLampType: async (templeId, payload) => {
    await delay();

    const newLampType = {
      id: Math.max(...lampTypesData.map((lt) => lt.id), 0) + 1,
      templeId: parseInt(templeId),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    lampTypesData.push(newLampType);

    return {
      success: true,
      data: newLampType,
      message: '燈種建立成功',
    };
  },

  /**
   * 更新燈種
   */
  updateLampType: async (templeId, lampTypeId, payload) => {
    await delay();

    const index = lampTypesData.findIndex(
      (lt) => lt.id === parseInt(lampTypeId) && lt.templeId === parseInt(templeId)
    );

    if (index === -1) {
      return { success: false, message: '燈種不存在' };
    }

    lampTypesData[index] = {
      ...lampTypesData[index],
      ...payload,
      id: lampTypesData[index].id,
      templeId: lampTypesData[index].templeId,
      createdAt: lampTypesData[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: lampTypesData[index],
      message: '燈種更新成功',
    };
  },

  /**
   * 切換燈種開放狀態
   */
  toggleLampTypeActive: async (templeId, lampTypeId, isActive) => {
    await delay();

    const index = lampTypesData.findIndex(
      (lt) => lt.id === parseInt(lampTypeId) && lt.templeId === parseInt(templeId)
    );

    if (index === -1) {
      return { success: false, message: '燈種不存在' };
    }

    lampTypesData[index].isActive = isActive;
    lampTypesData[index].updatedAt = new Date().toISOString();

    return {
      success: true,
      data: lampTypesData[index],
      message: `燈種已${isActive ? '開放' : '關閉'}`,
    };
  },

  /**
   * 獲取點燈申請名冊
   */
  listLampApplications: async (templeId, lampTypeId, { status, q, page = 1, pageSize = 20 }) => {
    await delay();

    let filtered = applicationsData.filter(
      (app) => app.lampTypeId === parseInt(lampTypeId)
    );

    // 狀態篩選
    if (status && status !== 'all') {
      filtered = filtered.filter((app) => app.status === status);
    }

    // 關鍵字搜尋（姓名、電話、email）
    if (q && q.trim()) {
      const keyword = q.trim().toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.applicantName.toLowerCase().includes(keyword) ||
          (app.phone && app.phone.includes(keyword)) ||
          (app.email && app.email.toLowerCase().includes(keyword))
      );
    }

    // 排序：最新的在前
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分頁
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = filtered.slice(start, end);

    return {
      success: true,
      data: {
        applications: paginatedItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  /**
   * 更新申請狀態
   */
  updateLampApplicationStatus: async (templeId, lampTypeId, appId, newStatus) => {
    await delay();

    const index = applicationsData.findIndex(
      (app) => app.id === parseInt(appId) && app.lampTypeId === parseInt(lampTypeId)
    );

    if (index === -1) {
      return { success: false, message: '申請記錄不存在' };
    }

    applicationsData[index].status = newStatus;
    applicationsData[index].updatedAt = new Date().toISOString();

    return {
      success: true,
      data: applicationsData[index],
      message: '狀態更新成功',
    };
  },
};
