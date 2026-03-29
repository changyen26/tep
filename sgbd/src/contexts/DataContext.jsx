import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storage'

const DataContext = createContext(null)

// 初始模擬資料
const initialLightings = [
  {
    id: 1,
    lightType: 'guangming',
    lightName: '光明燈',
    members: [
      { id: 1, name: '王大明', gender: 'male', birthYear: '1985', birthMonth: '3', birthDay: '15', isLunar: true }
    ],
    phone: '0912-345-678',
    email: 'wang@example.com',
    address: '台南市白河區中山路100號',
    prayer: '祈求闔家平安',
    totalAmount: 600,
    status: 'pending',
    createdAt: '2024-01-15T10:30:00',
  },
  {
    id: 2,
    lightType: 'wenchang',
    lightName: '文昌燈',
    members: [
      { id: 1, name: '李小華', gender: 'female', birthYear: '2005', birthMonth: '8', birthDay: '20', isLunar: true }
    ],
    phone: '0923-456-789',
    email: 'lee@example.com',
    address: '台南市新營區中正路50號',
    prayer: '祈求學業進步、金榜題名',
    totalAmount: 800,
    status: 'confirmed',
    createdAt: '2024-01-14T14:20:00',
  },
  {
    id: 3,
    lightType: 'taisui',
    lightName: '安太歲',
    members: [
      { id: 1, name: '張美玲', gender: 'female', birthYear: '1976', birthMonth: '5', birthDay: '10', isLunar: true },
      { id: 2, name: '張志明', gender: 'male', birthYear: '1974', birthMonth: '11', birthDay: '3', isLunar: true }
    ],
    phone: '0934-567-890',
    email: 'chang@example.com',
    address: '台南市白河區外角里20號',
    prayer: '',
    totalAmount: 1000,
    status: 'paid',
    createdAt: '2024-01-13T09:15:00',
  },
  {
    id: 4,
    lightType: 'caishen',
    lightName: '財神燈',
    members: [
      { id: 1, name: '黃先生', gender: 'male', birthYear: '1980', birthMonth: '6', birthDay: '1', isLunar: false }
    ],
    phone: '0955-123-456',
    email: 'huang@example.com',
    address: '台南市東區大學路1號',
    prayer: '生意興隆',
    totalAmount: 800,
    status: 'confirmed',
    createdAt: '2024-01-17T15:00:00',
  },
  {
    id: 5,
    lightType: 'guangming',
    lightName: '光明燈',
    members: [
      { id: 1, name: '吳小姐', gender: 'female', birthYear: '1992', birthMonth: '12', birthDay: '25', isLunar: false }
    ],
    phone: '0966-789-012',
    email: 'wu@example.com',
    address: '',
    prayer: '身體健康',
    totalAmount: 600,
    status: 'pending',
    createdAt: '2024-01-19T08:45:00',
  },
]

const initialPilgrimages = [
  {
    id: 1,
    templeName: '北港朝天宮進香團',
    contactName: '林主委',
    phone: '0912-111-222',
    email: 'lin@example.com',
    peopleCount: 45,
    busCount: 1,
    visitDate: '2024-02-20',
    visitTime: '10:00',
    notes: '預計停留2小時，需要導覽服務',
    status: 'pending',
    createdAt: '2024-01-16T11:00:00',
  },
  {
    id: 2,
    templeName: '新港奉天宮香客團',
    contactName: '陳總幹事',
    phone: '0923-222-333',
    email: 'chen@example.com',
    peopleCount: 80,
    busCount: 2,
    visitDate: '2024-02-25',
    visitTime: '09:30',
    notes: '中午需用餐',
    status: 'confirmed',
    createdAt: '2024-01-15T16:30:00',
  },
]

const initialEvents = [
  {
    id: 1,
    title: '甲辰年上元祈福法會',
    date: '2024-02-24',
    time: '09:00 - 17:00',
    location: '三官寶殿正殿',
    description: '農曆正月十五日天官聖誕，舉辦上元祈福法會。歡迎信眾參加，祈求天官賜福、新年平安。',
    imageUrl: '',
    capacity: 0,
    isActive: true,
    createdAt: '2024-01-10T10:00:00',
  },
  {
    id: 2,
    title: '安太歲點燈法會',
    date: '2024-02-10',
    time: '08:00 - 18:00',
    location: '服務處',
    description: '甲辰年犯太歲生肖：龍、狗、牛、兔。歡迎信眾登記安太歲、點光明燈。',
    imageUrl: '',
    capacity: 0,
    isActive: true,
    createdAt: '2024-01-08T14:00:00',
  },
]

const initialRegistrations = [
  {
    id: 1,
    eventId: 1,
    eventTitle: '甲辰年上元祈福法會',
    eventDate: '2024-02-24',
    name: '陳美玲',
    phone: '0912-123-456',
    email: 'chen@example.com',
    peopleCount: 3,
    notes: '',
    status: 'confirmed',
    createdAt: '2024-01-20T10:00:00',
  },
  {
    id: 2,
    eventId: 1,
    eventTitle: '甲辰年上元祈福法會',
    eventDate: '2024-02-24',
    name: '林志明',
    phone: '0923-234-567',
    email: '',
    peopleCount: 2,
    notes: '需要輪椅通道',
    status: 'pending',
    createdAt: '2024-01-21T14:30:00',
  },
  {
    id: 3,
    eventId: 2,
    eventTitle: '安太歲點燈法會',
    eventDate: '2024-02-10',
    name: '王大明',
    phone: '0912-345-678',
    email: 'wang@example.com',
    peopleCount: 1,
    notes: '',
    status: 'confirmed',
    createdAt: '2024-01-22T09:00:00',
  },
  {
    id: 4,
    eventId: 1,
    eventTitle: '甲辰年上元祈福法會',
    eventDate: '2024-02-24',
    name: '張美玲',
    phone: '0934-567-890',
    email: 'chang@example.com',
    peopleCount: 4,
    notes: '全家出席',
    status: 'confirmed',
    createdAt: '2024-01-23T16:00:00',
  },
]

const initialNews = [
  {
    id: 1,
    title: '上元節天官聖誕祈福法會',
    content: '農曆正月十五日舉辦上元節祈福法會，歡迎信眾參加。當日設有添油香、點光明燈、祈福儀式等活動。',
    date: '2024-01-15',
    imageUrl: '',
    isActive: true,
    createdAt: '2024-01-15T09:00:00',
  },
  {
    id: 2,
    title: '甲辰年安太歲點燈開始登記',
    content: '新年安太歲、點光明燈即日起開始受理登記。犯太歲生肖：龍、狗、牛、兔，歡迎信眾前來登記。',
    date: '2024-01-10',
    imageUrl: '',
    isActive: true,
    createdAt: '2024-01-10T10:00:00',
  },
  {
    id: 3,
    title: '春節期間開放時間公告',
    content: '農曆春節期間（除夕至初五），本宮延長開放時間至晚間十一時，歡迎信眾前來參拜。',
    date: '2024-01-05',
    imageUrl: '',
    isActive: true,
    createdAt: '2024-01-05T11:00:00',
  },
]

const initialContactMessages = [
  {
    id: 1,
    name: '黃先生',
    phone: '0955-123-456',
    email: 'huang@example.com',
    subject: 'service',
    message: '想詢問今年安太歲的費用與流程，謝謝。',
    status: 'unread',
    note: '',
    createdAt: '2024-01-18T09:30:00',
  },
  {
    id: 2,
    name: '吳小姐',
    phone: '0966-789-012',
    email: 'wu@example.com',
    subject: 'other',
    message: '請問過年期間有提供停車位嗎？',
    status: 'replied',
    note: '已回覆有停車場',
    createdAt: '2024-01-19T11:00:00',
  },
]

const initialSiteContent = {
  basicInfo: {
    address: '台南市白河區外角里4鄰外角41號',
    phone: '06-685-2428',
    email: 'sanguan@temple.org.tw',
    openingHours: '每日 05:00 - 21:00',
  },
  history: `白河三官寶殿位於臺南市白河區外角里，是當地最重要的信仰中心之一。本宮主祀三官大帝——天官、地官、水官，護佑地方信眾平安順遂，香火鼎盛已逾百年。

三官大帝又稱「三元大帝」或「三界公」，為道教中掌管天、地、水三界的神明。天官賜福、地官赦罪、水官解厄，三位大帝各司其職，庇佑眾生。每逢三元節——上元（正月十五）、中元（七月十五）、下元（十月十五），本宮皆舉辦盛大祭典，信眾絡繹不絕。

本宮建築融合閩南傳統工藝與現代結構，殿內雕樑畫棟，彩繪精美，屋脊剪黏栩栩如生，石雕木刻皆訴說著先民的故事，展現傳統廟宇之美。座落於蓮田環繞之地，四季流轉間，香煙與荷香交織，不僅是信仰中心，更是心靈沉澱的殿堂。`,
  services: [
    { id: 'guangming', name: '光明燈', price: 600, unit: '每盞/年', description: '點亮心燈，照耀前程，祈求平安順遂' },
    { id: 'taisui', name: '安太歲', price: 500, unit: '每位/年', description: '化解沖犯，趨吉避凶，祈求平安' },
    { id: 'wenchang', name: '文昌燈', price: 800, unit: '每盞/年', description: '開啟智慧，考運亨通，金榜題名' },
    { id: 'caishen', name: '財神燈', price: 800, unit: '每盞/年', description: '招財進寶，生意興隆，財源廣進' },
    { id: 'yinyuan', name: '姻緣燈', price: 800, unit: '每盞/年', description: '良緣天定，感情順遂，婚姻美滿' },
    { id: 'qifu', name: '祈福燈', price: 600, unit: '每盞/年', description: '身體健康，家庭幸福，添丁添福' },
  ],
  serviceNotices: [
    '點燈服務為期一年，每年需重新登記。',
    '安太歲請提供正確生辰八字（農曆），以利廟方進行儀式。',
    '點燈費用依服務項目而定，詳情請洽服務處。',
    '如有特殊祈願需求，可與廟方人員洽詢。',
    '服務時間：每日 08:00 - 18:00',
  ],
  transportGuide: {
    driving: '國道3號白河交流道下，往白河方向約10分鐘車程。廟前設有停車場，可容納約30部車輛。',
    publicTransport: '於新營火車站或白河轉運站搭乘客運，至外角站下車步行約5分鐘。',
  },
}

const initialGalleryCategories = [
  { id: 'temple', name: '廟宇建築' },
  { id: 'deity', name: '神明聖像' },
  { id: 'event', name: '活動照片' },
  { id: 'art', name: '藝術文物' },
]

const initialGalleryPhotos = [
  { id: 1, category: 'temple', title: '三官寶殿正門', description: '廟宇正門巍峨壯觀，金碧輝煌', image: 'https://images.unsplash.com/photo-1599827051921-12792671e353?q=80&w=600&auto=format&fit=crop', visible: true, order: 1 },
  { id: 2, category: 'temple', title: '正殿外觀', description: '傳統閩南式建築，雕樑畫棟', image: 'https://images.unsplash.com/photo-1548625361-12b704c38d39?q=80&w=600&auto=format&fit=crop', visible: true, order: 2 },
  { id: 3, category: 'deity', title: '三官大帝聖像', description: '天官、地官、水官三位大帝金身', image: 'https://images.unsplash.com/photo-1542642838-57d4c82b5352?q=80&w=600&auto=format&fit=crop', visible: true, order: 3 },
  { id: 4, category: 'deity', title: '天官大帝', description: '天官賜福，主管天界', image: 'https://images.unsplash.com/photo-1599827051921-12792671e353?q=80&w=600&auto=format&fit=crop', visible: true, order: 4 },
  { id: 5, category: 'event', title: '上元節祈福法會', description: '正月十五天官聖誕祈福大典', image: 'https://images.unsplash.com/photo-1548625361-12b704c38d39?q=80&w=600&auto=format&fit=crop', visible: true, order: 5 },
  { id: 6, category: 'event', title: '中元普渡法會', description: '七月十五地官聖誕普渡法會', image: 'https://images.unsplash.com/photo-1542642838-57d4c82b5352?q=80&w=600&auto=format&fit=crop', visible: true, order: 6 },
  { id: 7, category: 'art', title: '殿內彩繪', description: '精美的傳統彩繪藝術', image: 'https://images.unsplash.com/photo-1599827051921-12792671e353?q=80&w=600&auto=format&fit=crop', visible: true, order: 7 },
  { id: 8, category: 'art', title: '龍柱雕刻', description: '栩栩如生的石雕龍柱', image: 'https://images.unsplash.com/photo-1548625361-12b704c38d39?q=80&w=600&auto=format&fit=crop', visible: true, order: 8 },
  { id: 9, category: 'temple', title: '廟埕廣場', description: '寬敞的廟埕供信眾參拜', image: 'https://images.unsplash.com/photo-1542642838-57d4c82b5352?q=80&w=600&auto=format&fit=crop', visible: true, order: 9 },
]

// ===== 通知系統預設資料 =====
const initialNotificationTemplates = [
  {
    id: 1,
    name: '點燈確認通知',
    category: 'lighting',
    channel: 'email',
    subject: '【{{templeName}}】您的{{serviceType}}已確認',
    body: '{{recipientName}} 您好：\n\n感謝您在{{templeName}}登記{{serviceType}}服務，您的登記已確認。\n\n金額：{{amount}}\n\n如有任何問題，歡迎來電洽詢：{{templePhone}}\n\n{{templeName}} 敬上',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    name: '進香確認通知',
    category: 'pilgrimage',
    channel: 'email',
    subject: '【{{templeName}}】進香團登記確認',
    body: '{{recipientName}} 您好：\n\n您的進香團「{{groupName}}」登記已確認。\n\n預計到訪日期：{{visitDate}}\n人數：{{peopleCount}} 人\n\n如有異動請提前來電告知：{{templePhone}}\n\n{{templeName}} 敬上',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 3,
    name: '繳費提醒',
    category: 'lighting',
    channel: 'email',
    subject: '【{{templeName}}】{{serviceType}}繳費提醒',
    body: '{{recipientName}} 您好：\n\n您在{{templeName}}登記的{{serviceType}}尚未完成繳費。\n\n應繳金額：{{amount}}\n\n請盡快至服務處繳費，或來電洽詢：{{templePhone}}\n\n{{templeName}} 敬上',
    createdAt: '2024-01-01T00:00:00',
  },
]

const initialNotificationRules = [
  {
    id: 1,
    name: '點燈確認自動通知',
    event: 'lighting_status_confirmed',
    sourceType: 'lighting',
    templateId: 1,
    channel: 'email',
    mode: 'draft_review',
    enabled: false,
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 2,
    name: '進香確認自動通知',
    event: 'pilgrimage_status_confirmed',
    sourceType: 'pilgrimage',
    templateId: 2,
    channel: 'email',
    mode: 'draft_review',
    enabled: false,
    createdAt: '2024-01-01T00:00:00',
  },
]

const initialNotifications = [
  {
    id: 1001,
    type: 'manual',
    channel: 'email',
    subject: '【白河三官寶殿】您的文昌燈已確認',
    body: '李小華 您好：\n\n感謝您在白河三官寶殿登記文昌燈服務，您的登記已確認。\n\n金額：NT$ 800\n\n如有任何問題，歡迎來電洽詢：06-685-2428\n\n白河三官寶殿 敬上',
    recipientMode: 'individual',
    recipientCount: 1,
    recipients: [{ name: '李小華', email: 'lee@example.com', phone: '0923-456-789' }],
    status: 'sent',
    sentAt: '2024-01-20T10:05:00',
    templateId: 1,
    createdAt: '2024-01-20T10:05:00',
  },
  {
    id: 1002,
    type: 'manual',
    channel: 'email',
    subject: '【白河三官寶殿】進香團登記確認',
    body: '陳總幹事 您好：\n\n您的進香團「新港奉天宮香客團」登記已確認。\n\n預計到訪日期：2024-02-25\n人數：80 人\n\n如有異動請提前來電告知：06-685-2428\n\n白河三官寶殿 敬上',
    recipientMode: 'individual',
    recipientCount: 1,
    recipients: [{ name: '陳總幹事', email: 'chen@example.com', phone: '0923-222-333' }],
    status: 'sent',
    sentAt: '2024-01-19T17:00:00',
    templateId: 2,
    createdAt: '2024-01-19T17:00:00',
  },
  {
    id: 1003,
    type: 'auto',
    channel: 'email',
    subject: '【白河三官寶殿】您的光明燈繳費提醒',
    body: '王大明 您好：\n\n您在白河三官寶殿登記的光明燈尚未完成繳費。\n\n應繳金額：NT$ 600\n\n請盡快至服務處繳費，或來電洽詢：06-685-2428\n\n白河三官寶殿 敬上',
    recipientMode: 'individual',
    recipientCount: 1,
    recipients: [{ name: '王大明', email: 'wang@example.com', phone: '0912-345-678' }],
    status: 'draft',
    ruleName: '繳費提醒',
    templateId: 3,
    createdAt: '2024-01-21T08:00:00',
  },
  {
    id: 1004,
    type: 'manual',
    channel: 'both',
    subject: '【白河三官寶殿】春節期間開放時間公告',
    body: '各位信眾您好：\n\n農曆春節期間（除夕至初五），本宮延長開放時間至晚間十一時，歡迎信眾前來參拜。\n\n祝大家新年快樂，萬事如意！\n\n白河三官寶殿 敬上',
    recipientMode: 'group',
    recipientCount: 7,
    recipients: [
      { name: '王大明', email: 'wang@example.com', phone: '0912-345-678' },
      { name: '李小華', email: 'lee@example.com', phone: '0923-456-789' },
      { name: '張美玲', email: 'chang@example.com', phone: '0934-567-890' },
      { name: '林主委', email: 'lin@example.com', phone: '0912-111-222' },
      { name: '陳總幹事', email: 'chen@example.com', phone: '0923-222-333' },
      { name: '黃先生', email: 'huang@example.com', phone: '0955-123-456' },
      { name: '吳小姐', email: 'wu@example.com', phone: '0966-789-012' },
    ],
    status: 'sent',
    sentAt: '2024-01-18T15:30:00',
    createdAt: '2024-01-18T15:30:00',
  },
  {
    id: 1005,
    type: 'manual',
    channel: 'sms',
    subject: '',
    body: '【白河三官寶殿】提醒您，上元祈福法會將於 2/24 舉行，歡迎攜家帶眷參加。',
    recipientMode: 'individual',
    recipientCount: 1,
    recipients: [{ name: '陳美玲', email: 'chen@example.com', phone: '0912-123-456' }],
    status: 'failed',
    createdAt: '2024-01-22T11:00:00',
  },
  {
    id: 1006,
    type: 'auto',
    channel: 'email',
    subject: '【白河三官寶殿】您的財神燈已確認',
    body: '黃先生 您好：\n\n感謝您在白河三官寶殿登記財神燈服務，您的登記已確認。\n\n金額：NT$ 800\n\n如有任何問題，歡迎來電洽詢：06-685-2428\n\n白河三官寶殿 敬上',
    recipientMode: 'individual',
    recipientCount: 1,
    recipients: [{ name: '黃先生', email: 'huang@example.com', phone: '0955-123-456' }],
    status: 'draft',
    ruleName: '點燈確認自動通知',
    templateId: 1,
    createdAt: '2024-01-22T15:30:00',
  },
]

const initialNotificationSettings = {
  autoEnabled: false,
  emailProvider: { apiKey: '', senderEmail: '', senderName: '' },
  smsProvider: { accountSid: '', authToken: '', fromNumber: '' },
}

export function DataProvider({ children }) {
  const [lightings, setLightings] = useState([])
  const [pilgrimages, setPilgrimages] = useState([])
  const [events, setEvents] = useState([])
  const [news, setNews] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [contactMessages, setContactMessages] = useState([])
  const [siteContent, setSiteContent] = useState(initialSiteContent)
  const [galleryPhotos, setGalleryPhotos] = useState([])
  const [galleryCategories, setGalleryCategories] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationTemplates, setNotificationTemplates] = useState([])
  const [notificationRules, setNotificationRules] = useState([])
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings)

  // isLoaded flag to prevent saving empty arrays before data is loaded
  const isLoaded = useRef(false)

  // 載入資料
  useEffect(() => {
    setLightings(loadFromStorage('lightings', initialLightings))
    setPilgrimages(loadFromStorage('pilgrimages', initialPilgrimages))
    setEvents(loadFromStorage('events', initialEvents))
    setNews(loadFromStorage('news', initialNews))
    setRegistrations(loadFromStorage('registrations', initialRegistrations))
    setContactMessages(loadFromStorage('contact_messages', initialContactMessages))
    setSiteContent(loadFromStorage('site_content', initialSiteContent))
    setGalleryPhotos(loadFromStorage('gallery_photos', initialGalleryPhotos))
    setGalleryCategories(loadFromStorage('gallery_categories', initialGalleryCategories))
    setNotifications(loadFromStorage('notifications', initialNotifications))
    setNotificationTemplates(loadFromStorage('notification_templates', initialNotificationTemplates))
    setNotificationRules(loadFromStorage('notification_rules', initialNotificationRules))
    setNotificationSettings(loadFromStorage('notification_settings', initialNotificationSettings))
    isLoaded.current = true
  }, [])

  // 儲存資料 — only after initial load
  useEffect(() => { if (isLoaded.current) saveToStorage('lightings', lightings) }, [lightings])
  useEffect(() => { if (isLoaded.current) saveToStorage('pilgrimages', pilgrimages) }, [pilgrimages])
  useEffect(() => { if (isLoaded.current) saveToStorage('events', events) }, [events])
  useEffect(() => { if (isLoaded.current) saveToStorage('news', news) }, [news])
  useEffect(() => { if (isLoaded.current) saveToStorage('registrations', registrations) }, [registrations])
  useEffect(() => { if (isLoaded.current) saveToStorage('contact_messages', contactMessages) }, [contactMessages])
  useEffect(() => { if (isLoaded.current) saveToStorage('site_content', siteContent) }, [siteContent])
  useEffect(() => { if (isLoaded.current) saveToStorage('gallery_photos', galleryPhotos) }, [galleryPhotos])
  useEffect(() => { if (isLoaded.current) saveToStorage('gallery_categories', galleryCategories) }, [galleryCategories])
  useEffect(() => { if (isLoaded.current) saveToStorage('notifications', notifications) }, [notifications])
  useEffect(() => { if (isLoaded.current) saveToStorage('notification_templates', notificationTemplates) }, [notificationTemplates])
  useEffect(() => { if (isLoaded.current) saveToStorage('notification_rules', notificationRules) }, [notificationRules])
  useEffect(() => { if (isLoaded.current) saveToStorage('notification_settings', notificationSettings) }, [notificationSettings])

  // ===== 點燈操作 =====
  const addLighting = (data) => {
    const newLighting = { ...data, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() }
    setLightings(prev => [newLighting, ...prev])
    return newLighting
  }
  const updateLighting = (id, data) => {
    setLightings(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const updateLightingStatus = (id, status) => {
    setLightings(prev => prev.map(item => item.id === id ? { ...item, status } : item))
  }
  const deleteLighting = (id) => {
    setLightings(prev => prev.filter(item => item.id !== id))
  }

  // ===== 進香操作 =====
  const addPilgrimage = (data) => {
    const newPilgrimage = { ...data, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() }
    setPilgrimages(prev => [newPilgrimage, ...prev])
    return newPilgrimage
  }
  const updatePilgrimageStatus = (id, status) => {
    setPilgrimages(prev => prev.map(item => item.id === id ? { ...item, status } : item))
  }
  const deletePilgrimage = (id) => {
    setPilgrimages(prev => prev.filter(item => item.id !== id))
  }

  // ===== 活動操作 =====
  const addEvent = (data) => {
    const newEvent = { ...data, id: Date.now(), isActive: true, createdAt: new Date().toISOString() }
    setEvents(prev => [newEvent, ...prev])
    return newEvent
  }
  const updateEvent = (id, data) => {
    setEvents(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(item => item.id !== id))
  }

  // ===== 最新消息操作 =====
  const addNews = (data) => {
    const newNews = { ...data, id: Date.now(), isActive: true, createdAt: new Date().toISOString() }
    setNews(prev => [newNews, ...prev])
    return newNews
  }
  const updateNews = (id, data) => {
    setNews(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const deleteNews = (id) => {
    setNews(prev => prev.filter(item => item.id !== id))
  }

  // ===== 活動報名操作 =====
  const addRegistration = (data) => {
    const newRegistration = { ...data, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() }
    setRegistrations(prev => [newRegistration, ...prev])
    return newRegistration
  }
  const updateRegistrationStatus = (id, status) => {
    setRegistrations(prev => prev.map(item => item.id === id ? { ...item, status } : item))
  }
  const deleteRegistration = (id) => {
    setRegistrations(prev => prev.filter(item => item.id !== id))
  }

  // ===== 聯絡留言操作 =====
  const addContactMessage = (data) => {
    const newMsg = { ...data, id: Date.now(), status: 'unread', note: '', createdAt: new Date().toISOString() }
    setContactMessages(prev => [newMsg, ...prev])
    return newMsg
  }
  const updateContactMessage = (id, data) => {
    setContactMessages(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const deleteContactMessage = (id) => {
    setContactMessages(prev => prev.filter(item => item.id !== id))
  }

  // ===== 網站內容操作 =====
  const updateSiteContent = (data) => {
    setSiteContent(prev => ({ ...prev, ...data }))
  }

  // ===== 相簿操作 =====
  const addGalleryPhoto = (data) => {
    const newPhoto = { ...data, id: Date.now(), visible: true, order: galleryPhotos.length + 1 }
    setGalleryPhotos(prev => [...prev, newPhoto])
    return newPhoto
  }
  const updateGalleryPhoto = (id, data) => {
    setGalleryPhotos(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const deleteGalleryPhoto = (id) => {
    setGalleryPhotos(prev => prev.filter(item => item.id !== id))
  }
  const updateGalleryCategories = (categories) => {
    setGalleryCategories(categories)
  }

  // ===== 通知操作 =====
  const addNotification = (data) => {
    const newNotification = { ...data, id: Date.now(), createdAt: new Date().toISOString() }
    setNotifications(prev => [newNotification, ...prev])
    return newNotification
  }
  const addNotifications = (items) => {
    setNotifications(prev => [...items, ...prev])
  }
  const updateNotification = (id, data) => {
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(item => item.id !== id))
  }

  // ===== 通知模板操作 =====
  const addNotificationTemplate = (data) => {
    const newTemplate = { ...data, id: Date.now(), createdAt: new Date().toISOString() }
    setNotificationTemplates(prev => [newTemplate, ...prev])
    return newTemplate
  }
  const updateNotificationTemplate = (id, data) => {
    setNotificationTemplates(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const deleteNotificationTemplate = (id) => {
    setNotificationTemplates(prev => prev.filter(item => item.id !== id))
  }

  // ===== 通知規則操作 =====
  const addNotificationRule = (data) => {
    const newRule = { ...data, id: Date.now(), createdAt: new Date().toISOString() }
    setNotificationRules(prev => [newRule, ...prev])
    return newRule
  }
  const updateNotificationRule = (id, data) => {
    setNotificationRules(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }
  const deleteNotificationRule = (id) => {
    setNotificationRules(prev => prev.filter(item => item.id !== id))
  }

  // ===== 通知設定操作 =====
  const updateNotificationSettings = (data) => {
    setNotificationSettings(prev => ({ ...prev, ...data }))
  }

  return (
    <DataContext.Provider value={{
      lightings, pilgrimages, events, news, registrations, contactMessages, siteContent, galleryPhotos, galleryCategories,
      notifications, notificationTemplates, notificationRules, notificationSettings,
      addLighting, updateLighting, updateLightingStatus, deleteLighting,
      addPilgrimage, updatePilgrimageStatus, deletePilgrimage,
      addEvent, updateEvent, deleteEvent,
      addNews, updateNews, deleteNews,
      addRegistration, updateRegistrationStatus, deleteRegistration,
      addContactMessage, updateContactMessage, deleteContactMessage,
      updateSiteContent,
      addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto, updateGalleryCategories,
      addNotification, addNotifications, updateNotification, deleteNotification,
      addNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate,
      addNotificationRule, updateNotificationRule, deleteNotificationRule,
      updateNotificationSettings,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
