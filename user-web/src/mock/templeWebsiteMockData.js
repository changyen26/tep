/**
 * 廟宇網站模板模擬資料
 * 以松柏嶺受天宮為參考範例
 */

export const templeWebsiteMockData = {
  // 廟宇基本資訊
  temple: {
    id: 'demo',
    name: '松柏嶺受天宮',
    subtitle: '北極玄天上帝祖廟',
    logo: '/images/temple-logo.png',
    description: '松柏嶺受天宮為台灣北極玄天上帝信仰的重要聖地，創建於清乾隆年間，迄今已有兩百餘年歷史。本宮供奉玄天上帝，香火鼎盛，信眾遍布全台。',
    history: `松柏嶺受天宮創建於清乾隆十年（西元1745年），為台灣最早供奉北極玄天上帝之廟宇之一。

本宮坐落於南投縣名間鄉松柏嶺，地處八卦山脈最高點，海拔約500公尺，風景秀麗，氣候宜人。

兩百多年來，本宮歷經多次整修擴建，如今廟宇金碧輝煌，殿堂莊嚴，為台灣著名的宗教聖地。每年農曆三月初三玄天上帝聖誕，進香團絡繹不絕，盛況空前。`,
    address: '南投縣名間鄉松山村松山街118號',
    phone: '049-258-1008',
    fax: '049-258-1009',
    email: 'service@songbailing.org.tw',
    openingHours: '每日 06:00 - 21:00',
    socialMedia: {
      facebook: 'https://www.facebook.com/songbailing',
      instagram: 'https://www.instagram.com/songbailing',
      youtube: 'https://www.youtube.com/songbailing',
      line: 'https://line.me/songbailing'
    }
  },

  // 導航選單
  navigation: [
    { key: 'home', label: '首頁', path: '' },
    { key: 'about', label: '關於本宮', path: 'about' },
    { key: 'news', label: '最新消息', path: 'news' },
    { key: 'events', label: '活動一覽', path: 'events' },
    { key: 'services', label: '服務項目', path: 'services' },
    { key: 'lighting', label: '點燈祈福', path: 'lighting' },
    { key: 'gallery', label: '相簿', path: 'gallery' },
    { key: 'contact', label: '聯絡我們', path: 'contact' }
  ],

  // 輪播圖
  carousel: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1600&h=600&fit=crop',
      title: '歡迎蒞臨松柏嶺受天宮',
      subtitle: '北極玄天上帝祖廟 · 靈驗護佑',
      link: '/about'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=1600&h=600&fit=crop',
      title: '玄天上帝聖誕祈福法會',
      subtitle: '農曆三月初三 · 誠邀十方善信參與',
      link: '/events'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=600&fit=crop',
      title: '光明燈祈福 · 平安圓滿',
      subtitle: '點燈祈福，護佑闔家平安',
      link: '/lighting'
    }
  ],

  // 最新消息
  news: [
    {
      id: 1,
      title: '114年新春團拜暨祈福法會',
      date: '2025-01-15',
      category: '活動公告',
      summary: '本宮將於農曆正月初一至初五舉辦新春團拜暨祈福法會，歡迎信眾踴躍參與。',
      content: '本宮將於農曆正月初一至初五舉辦新春團拜暨祈福法會，届時將有誦經祈福、發放福袋等活動，歡迎十方善信踴躍參與，共沐神恩。',
      image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: '光明燈及太歲燈開放登記',
      date: '2025-01-10',
      category: '服務公告',
      summary: '114年度光明燈、太歲燈、文昌燈即日起開放登記，敬請把握機會。',
      content: '114年度光明燈、太歲燈、文昌燈即日起開放登記，每盞燈油資新台幣600元整，信眾可親至本宮服務台或線上登記。',
      image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: '玄天上帝聖誕進香活動公告',
      date: '2025-01-05',
      category: '活動公告',
      summary: '農曆三月初三玄天上帝聖誕，本宮將舉辦盛大進香活動。',
      content: '農曆三月初三為玄天上帝聖誕千秋，本宮將舉辦為期三天之進香祈福活動，届時將有過火儀式、文化表演等精彩節目。',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: '本宮榮獲績優宗教團體表揚',
      date: '2024-12-20',
      category: '宮務公告',
      summary: '本宮榮獲內政部113年度績優宗教團體表揚，感謝各界支持。',
      content: '本宮長期致力於宗教文化傳承、社會公益及環境保護，榮獲內政部113年度績優宗教團體表揚，感謝十方善信長期支持與政府肯定。',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: '冬令救濟物資發放',
      date: '2024-12-15',
      category: '公益活動',
      summary: '本宮於歲末舉辦冬令救濟，發放物資予弱勢家庭。',
      content: '秉持玄天上帝慈悲濟世精神，本宮於每年歲末舉辦冬令救濟活動，發放白米、食用油等民生物資予轄區弱勢家庭。',
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'
    }
  ],

  // 活動資訊
  events: [
    {
      id: 1,
      title: '新春團拜祈福法會',
      startDate: '2025-02-10',
      endDate: '2025-02-14',
      location: '本宮正殿',
      description: '農曆新年期間舉辦之祈福法會，為信眾消災解厄、祈求新年平安順遂。',
      image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&h=300&fit=crop',
      status: 'upcoming'
    },
    {
      id: 2,
      title: '玄天上帝聖誕千秋',
      startDate: '2025-04-01',
      endDate: '2025-04-03',
      location: '本宮全區',
      description: '農曆三月初三玄天上帝聖誕，舉辦三天進香祈福活動，含過火儀式、陣頭表演。',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
      status: 'upcoming'
    },
    {
      id: 3,
      title: '中元普渡法會',
      startDate: '2025-08-20',
      endDate: '2025-08-22',
      location: '本宮正殿',
      description: '農曆七月中元普渡，超薦祖先、普施孤魂，廣結善緣。',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      status: 'upcoming'
    }
  ],

  // 服務項目
  services: [
    {
      id: 1,
      title: '光明燈',
      icon: 'bulb',
      description: '點燃光明，照耀前程，祈求事業順利、學業進步。',
      price: '600元/年',
      image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: '太歲燈',
      icon: 'star',
      description: '化解太歲沖煞，保佑流年平安，運勢亨通。',
      price: '600元/年',
      image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: '文昌燈',
      icon: 'book',
      description: '祈求考運亨通、學業進步，莘莘學子必點。',
      price: '600元/年',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      title: '安太歲',
      icon: 'safety',
      description: '為當年沖犯太歲者祈福消災，化解流年不利。',
      price: '300元/年',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
    },
    {
      id: 5,
      title: '祈福法會',
      icon: 'fire',
      description: '定期舉辦各類祈福法會，消災解厄、增福添壽。',
      price: '依法會而定',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop'
    },
    {
      id: 6,
      title: '點香祈願',
      icon: 'heart',
      description: '虔誠上香，祈求玄天上帝護佑，心想事成。',
      price: '隨喜功德',
      image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=300&h=200&fit=crop'
    },
    {
      id: 7,
      title: '求籤問事',
      icon: 'question',
      description: '玄天上帝靈籤，指點迷津，解惑答疑。',
      price: '免費',
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=300&h=200&fit=crop'
    },
    {
      id: 8,
      title: '平安符',
      icon: 'shield',
      description: '經過開光加持之平安符，隨身攜帶，護身保平安。',
      price: '隨喜功德',
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&h=200&fit=crop'
    }
  ],

  // 點燈項目
  lightingServices: [
    {
      id: 1,
      name: '光明燈',
      description: '點燃光明，照耀前程。祈求事業順利、學業進步、身體健康、闔家平安。',
      price: 600,
      duration: '全年',
      benefits: ['事業順利', '學業進步', '身體健康', '闘家平安'],
      popular: true
    },
    {
      id: 2,
      name: '太歲燈',
      description: '化解太歲沖煞，保佑流年平安順遂，諸事大吉。',
      price: 600,
      duration: '全年',
      benefits: ['化解沖煞', '流年平安', '諸事順遂', '逢凶化吉'],
      popular: true
    },
    {
      id: 3,
      name: '文昌燈',
      description: '祈求考運亨通、學業進步、金榜題名。莘莘學子、考生必點。',
      price: 600,
      duration: '全年',
      benefits: ['考運亨通', '金榜題名', '智慧開啟', '學業進步'],
      popular: false
    },
    {
      id: 4,
      name: '財神燈',
      description: '祈求財運亨通、生意興隆、財源廣進。',
      price: 800,
      duration: '全年',
      benefits: ['財運亨通', '生意興隆', '財源廣進', '招財進寶'],
      popular: false
    },
    {
      id: 5,
      name: '姻緣燈',
      description: '祈求姻緣美滿、桃花朵朵、早日覓得良緣。',
      price: 600,
      duration: '全年',
      benefits: ['姻緣美滿', '桃花朵朵', '良緣早至', '婚姻幸福'],
      popular: false
    }
  ],

  // 進香資訊
  pilgrimage: {
    lunarDate: '正月十五',
    solarDate: '2025-02-12',
    todayGroups: [
      { name: '台中市北區天上聖母會', members: 45, time: '09:00' },
      { name: '彰化縣和美鎮受天宮', members: 120, time: '10:30' },
      { name: '雲林縣斗六市玄天宮', members: 80, time: '14:00' }
    ],
    upcomingEvents: [
      { date: '正月十六', event: '新春祈安法會' },
      { date: '正月二十', event: '上元天官聖誕' },
      { date: '二月初二', event: '土地公聖誕' }
    ]
  },

  // 相簿
  gallery: [
    {
      id: 1,
      category: '廟宇建築',
      title: '本宮正殿',
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop',
      description: '本宮正殿供奉北極玄天上帝，金碧輝煌，莊嚴肅穆。'
    },
    {
      id: 2,
      category: '廟宇建築',
      title: '廟前廣場',
      image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=600&h=400&fit=crop',
      description: '廟前廣場寬敞，可容納大型活動及進香團。'
    },
    {
      id: 3,
      category: '祭典活動',
      title: '進香盛況',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
      description: '每年農曆三月，各地進香團絡繹不絕。'
    },
    {
      id: 4,
      category: '祭典活動',
      title: '過火儀式',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      description: '傳統過火儀式，象徵淨化與祈福。'
    },
    {
      id: 5,
      category: '文化活動',
      title: '陣頭表演',
      image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600&h=400&fit=crop',
      description: '精彩的傳統陣頭表演，傳承民俗文化。'
    },
    {
      id: 6,
      category: '文化活動',
      title: '誦經法會',
      image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=600&h=400&fit=crop',
      description: '莊嚴肅穆的誦經法會，為信眾祈福。'
    }
  ],

  // 頁尾連結
  footerLinks: [
    {
      title: '關於我們',
      links: [
        { label: '本宮介紹', path: 'about' },
        { label: '玄天上帝', path: 'about#deity' },
        { label: '歷史沿革', path: 'about#history' },
        { label: '建築導覽', path: 'about#architecture' }
      ]
    },
    {
      title: '信眾服務',
      links: [
        { label: '點燈祈福', path: 'lighting' },
        { label: '安太歲', path: 'services#taisui' },
        { label: '法會活動', path: 'events' },
        { label: '求籤問事', path: 'services#fortune' }
      ]
    },
    {
      title: '最新資訊',
      links: [
        { label: '最新消息', path: 'news' },
        { label: '活動一覽', path: 'events' },
        { label: '相簿', path: 'gallery' },
        { label: '交通指南', path: 'contact#traffic' }
      ]
    }
  ]
};

export default templeWebsiteMockData;
