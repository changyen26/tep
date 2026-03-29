/**
 * 推播通知管理 - 建立新推播
 * 包含客群篩選、範本選擇、AI 文案助手、訊息預覽
 */
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/templeAdminApi';
import './Notifications.css';

// AI 文案助手選項
const aiNotificationTypes = [
  { id: 'event', name: '活動通知' },
  { id: 'reminder', name: '點燈提醒' },
  { id: 'festival', name: '節慶祝福' },
  { id: 'announcement', name: '一般公告' },
  { id: 'promotion', name: '促銷優惠' },
];

const aiCopyStyles = [
  { id: 'formal', name: '正式莊重' },
  { id: 'warm', name: '親切溫馨' },
  { id: 'concise', name: '簡潔明瞭' },
  { id: 'enthusiastic', name: '熱情活潑' },
];

const aiCopyLengths = [
  { id: 'short', name: '簡短（約50字）', chars: 50 },
  { id: 'medium', name: '中等（約100字）', chars: 100 },
  { id: 'detailed', name: '詳細（約200字）', chars: 200 },
];

// AI 圖片助手選項
const aiImageSizes = [
  { id: '1:1', name: '1:1 正方形（1024x1024）', width: 1024, height: 1024 },
  { id: '16:9', name: '16:9 橫幅（1920x1080）', width: 1920, height: 1080 },
  { id: '9:16', name: '9:16 直幅（1080x1920）', width: 1080, height: 1920 },
  { id: '4:3', name: '4:3 標準（1200x900）', width: 1200, height: 900 },
  { id: '3:4', name: '3:4 直式（900x1200）', width: 900, height: 1200 },
];

const aiSceneDescriptions = [
  { id: 'temple_front', name: '廟宇正殿前' },
  { id: 'altar', name: '神桌/供桌旁' },
  { id: 'incense', name: '香爐煙霧中' },
  { id: 'lantern', name: '燈籠環繞' },
  { id: 'cloud', name: '祥雲繚繞' },
  { id: 'lotus', name: '蓮花池畔' },
  { id: 'garden', name: '廟宇花園' },
  { id: 'night', name: '夜間燈火通明' },
  { id: 'sunrise', name: '日出晨曦' },
  { id: 'festival', name: '節慶熱鬧氛圍' },
];

const aiSceneElements = [
  { id: 'incense_smoke', name: '裊裊香煙' },
  { id: 'red_lanterns', name: '紅色燈籠' },
  { id: 'candles', name: '燭光搖曳' },
  { id: 'flowers', name: '鮮花供品' },
  { id: 'golden_light', name: '金色光芒' },
  { id: 'clouds', name: '祥雲瑞氣' },
  { id: 'lotus_flowers', name: '蓮花' },
  { id: 'bamboo', name: '翠竹' },
  { id: 'traditional_patterns', name: '傳統紋飾' },
  { id: 'believers', name: '虔誠信眾' },
];

// 模擬 AI 文案模板庫
const aiCopyTemplates = {
  event: {
    formal: {
      titles: [
        '【誠摯邀請】{keyword}法會通知',
        '【恭請蒞臨】{keyword}活動公告',
        '【敬邀參與】本殿{keyword}盛事',
      ],
      contents: {
        short: [
          '謹訂於近日舉辦「{keyword}」，誠摯邀請各位信眾蒞臨參與，共沐神恩。',
          '本殿將舉行「{keyword}」，敬請撥冗出席，同霑法喜。',
        ],
        medium: [
          '謹訂於近日舉辦「{keyword}」，誠摯邀請各位信眾蒞臨參與。\n\n屆時將有誦經祈福、法師開示等殊勝法緣，機會難得，敬請撥冗出席，共沐神恩，同霑法喜。',
          '本殿將隆重舉行「{keyword}」，此乃年度重要法會活動。\n\n誠摯邀請十方信眾蒞臨參與，祈願 神明庇佑，闔家平安吉祥，事業順遂亨通。',
        ],
        detailed: [
          '各位虔誠的信眾您好：\n\n本殿謹訂於近日隆重舉辦「{keyword}」，此乃年度重要法會活動。\n\n屆時將恭請法師主持誦經祈福，並有開示講座、點燈祈願、擲筊問事等多項活動。機會殊勝難得，誠摯邀請十方信眾撥冗蒞臨，共同參與這場莊嚴殊勝的法會。\n\n祈願 神明庇佑眾信眾身體健康、闔家平安、事業順遂！',
          '恭敬的各位信眾：\n\n本殿將於近期舉辦「{keyword}」，特此敬邀各位蒞臨參與。\n\n本次活動內容豐富，包含誦經祈福、法師開示、點燈祈願等殊勝法緣。藉此盛會，祈求 神明慈悲加被，護佑十方信眾消災解厄、福慧增長。\n\n歡迎攜家帶眷同來參拜，共沐神恩。如有任何詢問，歡迎來電洽詢。',
        ],
      },
    },
    warm: {
      titles: [
        '【溫馨邀約】一起來參加{keyword}吧！',
        '【好消息】{keyword}活動即將開始',
        '【歡迎參加】{keyword}與您相約',
      ],
      contents: {
        short: [
          '親愛的信眾朋友，我們即將舉辦「{keyword}」，歡迎大家一起來參加！',
          '期待已久的「{keyword}」就要開始囉！歡迎大家攜家帶眷同來參與。',
        ],
        medium: [
          '親愛的信眾朋友您好：\n\n好消息！我們即將舉辦「{keyword}」，誠摯邀請您與家人一同參與。\n\n這是一個凝聚信眾情誼、祈求平安福氣的好機會，讓我們一起感受神明的庇佑與溫暖！',
          '親愛的信眾家人：\n\n「{keyword}」即將溫馨登場！這是屬於我們大家的活動。\n\n歡迎帶著家人朋友一起來，感受廟裡的溫暖氛圍，一同祈福、交流，讓這份溫馨傳遞給更多人。',
        ],
        detailed: [
          '親愛的信眾朋友們：\n\n好消息要與您分享！我們精心籌備的「{keyword}」即將溫馨登場。\n\n這是一個難得的好機會，讓我們齊聚一堂，共同感受神明的慈悲與庇佑。活動中不僅有莊嚴的祈福儀式，更有豐富的互動環節，讓大家能彼此認識、交流分享。\n\n歡迎您攜帶家人、邀約朋友一同參與，讓我們在神明的見證下，共同祈願平安幸福，也讓這份溫暖傳遞給更多需要的人。期待在活動中與您相見！',
          '親愛的信眾家人們，大家好：\n\n令人期待的「{keyword}」就要開始囉！我們用心籌備了這場活動，就是希望能與大家歡聚一堂。\n\n當天會有精彩的活動內容，還有機會與其他信眾朋友交流互動。最重要的是，讓我們一起在神明面前許下心願，祈求來年平安順遂。\n\n無論您是常來的老朋友，還是第一次參加的新朋友，我們都熱烈歡迎！記得帶上您的家人，一起來感受這份溫馨與喜悅。',
        ],
      },
    },
    concise: {
      titles: [
        '【{keyword}】活動通知',
        '【公告】{keyword}即將舉辦',
        '{keyword} - 敬邀參加',
      ],
      contents: {
        short: [
          '「{keyword}」即將舉辦，歡迎參加。詳情請洽本殿服務處。',
          '本殿將辦理「{keyword}」，敬請踴躍參與。',
        ],
        medium: [
          '本殿即將舉辦「{keyword}」。\n\n活動內容：誦經祈福、點燈祈願\n歡迎信眾報名參加，詳情請洽服務處。',
          '「{keyword}」公告\n\n時間：近日\n地點：本殿\n內容：法會祈福\n\n歡迎信眾踴躍參加。',
        ],
        detailed: [
          '【{keyword}】活動公告\n\n一、活動時間：近日\n二、活動地點：本殿正殿\n三、活動內容：\n    1. 誦經祈福\n    2. 法師開示\n    3. 點燈祈願\n\n四、報名方式：本殿服務處或線上報名\n五、洽詢電話：請洽本殿\n\n歡迎十方信眾踴躍參加。',
          '公告事項：「{keyword}」\n\n主旨：舉辦{keyword}活動\n時間：近日（詳細時間另行公告）\n地點：本殿\n對象：全體信眾\n\n活動說明：\n本次活動將進行誦經祈福、法師開示等儀式，祈願信眾平安吉祥。\n\n報名方式：\n即日起至本殿服務處登記，或透過線上系統報名。\n\n備註：歡迎攜眷參加。',
        ],
      },
    },
    enthusiastic: {
      titles: [
        '【熱烈邀請】{keyword}盛大舉辦！',
        '【不容錯過】{keyword}精彩登場！',
        '【好康報報】{keyword}等你來！',
      ],
      contents: {
        short: [
          '「{keyword}」即將盛大舉辦！精彩活動不容錯過，快來參加吧！',
          '超讚的「{keyword}」要開始了！趕快揪家人朋友一起來！',
        ],
        medium: [
          '信眾朋友們注意啦！\n\n超讚的「{keyword}」即將盛大登場！這是今年度最不能錯過的活動！\n\n精彩內容、溫馨氛圍，保證讓您滿載而歸。快揪家人朋友一起來，我們不見不散！',
          '好消息好消息！\n\n「{keyword}」要開始囉！這絕對是今年最值得期待的活動！\n\n不管是祈福許願、結交朋友、還是感受廟會氛圍，通通一次滿足。千萬別錯過，趕快報名吧！',
        ],
        detailed: [
          '各位親愛的信眾朋友們，振奮人心的消息來啦！\n\n「{keyword}」即將盛大舉辦！這可是我們精心籌備、誠意滿滿的年度盛事！\n\n活動亮點搶先看：\n★ 莊嚴隆重的祈福法會\n★ 法師親臨開示指點\n★ 點燈祈願福氣滿滿\n★ 還有更多驚喜等著你！\n\n這麼棒的活動，怎麼能錯過呢？快快揪起家人朋友，一起來感受滿滿的正能量和幸福感！\n\n我們熱烈歡迎您的到來，不見不散喔！',
          '哇哇哇！超級大消息！\n\n眾所期待的「{keyword}」終於要來啦！這是今年度最盛大、最精彩、最不能錯過的活動！\n\n想知道有多精彩嗎？\n🔥 超殊勝的祈福儀式\n🔥 難得一見的法師開示\n🔥 滿滿福氣的點燈祈願\n🔥 溫馨熱鬧的信眾交流\n\n無論你是虔誠的老信眾，還是第一次來的新朋友，保證讓你感受到滿滿的溫暖和感動！\n\n趕快標記行事曆、通知親朋好友，我們一起嗨起來！期待在活動現場看到你！',
        ],
      },
    },
  },
  reminder: {
    formal: {
      titles: [
        '【溫馨提醒】您的{keyword}服務通知',
        '【敬請留意】{keyword}相關事宜',
        '【貼心叮嚀】關於您的{keyword}',
      ],
      contents: {
        short: [
          '敬啟者：您於本殿之「{keyword}」即將到期，敬請留意並妥善安排。',
          '謹此通知，您的「{keyword}」服務期限將屆，請洽本殿辦理相關事宜。',
        ],
        medium: [
          '敬愛的信眾您好：\n\n茲通知您於本殿登記之「{keyword}」即將到期。\n\n如欲續期，敬請於到期前蒞臨本殿服務處辦理，或透過線上系統申請。感謝您長期護持，敬祝平安吉祥。',
          '尊敬的信眾：\n\n您好，謹此提醒您於本殿之「{keyword}」服務即將屆滿。\n\n為確保服務不中斷，請於期限前完成續期手續。如有任何疑問，歡迎來電或親臨服務處洽詢。',
        ],
        detailed: [
          '敬愛的信眾您好：\n\n首先感謝您長期以來對本殿的護持與支持。\n\n茲通知您於本殿登記之「{keyword}」即將到期。為確保您的祈福服務延續不中斷，謹此提醒您於到期前辦理續期事宜。\n\n續期方式如下：\n一、親臨本殿服務處辦理\n二、透過線上系統申請\n三、電話預約後到殿完成手續\n\n如有任何疑問，歡迎隨時與我們聯繫。敬祝 神明庇佑，闔家平安順遂。',
          '尊敬的信眾大德：\n\n感謝您一直以來對本殿的信任與護持。\n\n經系統查詢，您於本殿之「{keyword}」服務期限即將届滿。為使您能持續獲得神明庇佑，特此發函提醒。\n\n辦理續期事項：\n• 受理時間：每日上午九時至下午五時\n• 受理地點：本殿服務處\n• 所需文件：原收據或身份證明\n• 亦可透過本殿線上系統辦理\n\n若您已完成續期或有其他安排，請忽略此通知。如需協助，歡迎來電洽詢。',
        ],
      },
    },
    warm: {
      titles: [
        '【貼心提醒】{keyword}快到期囉',
        '【小叮嚀】關於您的{keyword}',
        '【溫馨通知】{keyword}服務提醒',
      ],
      contents: {
        short: [
          '親愛的信眾，您的「{keyword}」快到期囉，記得來續期讓福氣延續喔！',
          '溫馨提醒：您的「{keyword}」即將到期，歡迎回來讓祝福繼續陪伴您。',
        ],
        medium: [
          '親愛的信眾您好：\n\n時間過得好快，您的「{keyword}」又快到期了呢！\n\n這段時間希望神明的庇佑都有陪伴著您。如果想讓這份祝福延續下去，記得來續期喔！我們隨時歡迎您回來。',
          '親愛的朋友：\n\n小小提醒一下，您之前在本殿點的「{keyword}」就快到期囉！\n\n感謝您的信任與護持，希望這段時間一切都順心如意。歡迎您再度回來，讓我們繼續為您祈福。',
        ],
        detailed: [
          '親愛的信眾朋友您好：\n\n不知不覺，您的「{keyword}」又快到期了呢！時間真的過得好快。\n\n這段日子以來，希望神明的庇佑都有好好陪伴著您，讓您的生活平安順遂。\n\n如果您覺得這份祝福有帶給您力量和安心，歡迎回來續期，讓這份守護繼續延續下去。當然，不管您的決定是什麼，我們都祝福您一切順心。\n\n想續期的話，可以親自來一趟，或者用線上系統也很方便喔！有任何問題都歡迎詢問，我們很樂意為您服務。',
          '親愛的朋友，您好：\n\n首先要謝謝您一直以來對本殿的信任！真的很開心能為您服務。\n\n這封信是想溫馨提醒您，之前在本殿登記的「{keyword}」快到期囉！\n\n這段時間，希望神明的保佑都有好好守護著您和家人。如果您感受到了這份祝福的力量，想要讓它繼續陪伴您的話，隨時歡迎回來續期。\n\n續期的方式很簡單：\n• 直接來殿裡走走（順便拜拜聊聊天）\n• 用手機線上辦理也OK\n\n不管怎樣，都祝福您和家人一切平安幸福喔！',
        ],
      },
    },
    concise: {
      titles: [
        '【到期通知】{keyword}',
        '【提醒】{keyword}服務即將届期',
        '{keyword}到期提醒',
      ],
      contents: {
        short: [
          '您的「{keyword}」將於近日到期，請洽本殿服務處辦理續期。',
          '提醒：「{keyword}」即將到期。續期請洽服務處。',
        ],
        medium: [
          '【{keyword}到期通知】\n\n您的服務即將到期。\n續期方式：本殿服務處或線上系統\n洽詢電話：請洽本殿\n\n感謝您的護持。',
          '{keyword}服務提醒\n\n狀態：即將到期\n處理方式：請於到期前辦理續期\n辦理地點：本殿服務處\n\n如已處理請忽略此通知。',
        ],
        detailed: [
          '【{keyword}】服務到期通知\n\n一、服務項目：{keyword}\n二、狀態：即將到期\n三、處理期限：請於到期前辦理\n\n四、續期方式：\n    1. 親臨本殿服務處\n    2. 線上系統申請\n    3. 電話預約\n\n五、服務時間：每日 09:00-17:00\n六、洽詢電話：請洽本殿\n\n請於期限內完成續期手續。',
          '通知事項：{keyword}服務到期\n\n致：信眾\n事由：服務到期提醒\n\n說明：\n1. 您於本殿登記之{keyword}服務即將届期\n2. 如欲續期，請依下列方式辦理：\n   - 臨櫃辦理：本殿服務處\n   - 線上辦理：本殿官方網站/APP\n3. 服務時間：每日上午九時至下午五時\n\n備註：如已完成續期或另有安排，請忽略此通知。',
        ],
      },
    },
    enthusiastic: {
      titles: [
        '【好康提醒】{keyword}要記得續喔！',
        '【別忘了】您的{keyword}快到期啦！',
        '【重要通知】{keyword}續期時間到！',
      ],
      contents: {
        short: [
          '親愛的，您的「{keyword}」快到期了！快來續期，讓好運繼續罩著您！',
          '叮咚！「{keyword}」到期提醒！別讓福氣斷掉，趕快來續期吧！',
        ],
        medium: [
          '親愛的信眾朋友！\n\n叮咚叮咚～您的「{keyword}」快到期囉！\n\n這段時間有沒有感受到滿滿的好運呢？想要讓福氣繼續罩著您的話，趕快來續期吧！我們超歡迎您回來的！',
          'Hi～親愛的朋友！\n\n提醒您一下，「{keyword}」的期限快到囉！\n\n趕快安排時間來續期，讓神明的保佑繼續陪伴您！不管是來殿裡走走，還是線上辦理都超方便的喔！',
        ],
        detailed: [
          '親愛的信眾朋友，您好您好！\n\n緊急通知！您的「{keyword}」就快到期啦！\n\n哎呀，時間過得好快，轉眼間又要續期了呢！這段時間，希望神明的庇佑有好好保護著您，讓您事事順心、天天開心！\n\n如果您也覺得這份祝福很讚，想要讓它繼續發威的話，快快行動起來吧！\n\n續期超簡單：\n★ 來殿裡走走（順便拜拜充充電）\n★ 線上動動手指就搞定\n\n別讓福氣的保護罩消失啦～我們超級期待再見到您！',
          'Hello～親愛的朋友！\n\n重要通知重要通知！您的「{keyword}」倒數計時中！\n\n不知道您有沒有注意到，這段時間是不是特別順利呢？嘿嘿，那可能就是神明默默在保佑您喔！\n\n眼看期限就要到了，如果您想讓這份好運繼續延續下去，千萬記得來續期！\n\n怎麼續期最方便？\n🌟 親自來～順便參拜充個電\n🌟 線上辦理～躺在沙發上就能搞定\n🌟 打電話預約～我們幫您準備好\n\n不管用哪種方式，我們都超歡迎！快來讓福氣繼續陪伴您吧！',
        ],
      },
    },
  },
  festival: {
    formal: {
      titles: [
        '【{keyword}】敬祝闔府安康',
        '【恭賀{keyword}】敬頌 時祺',
        '【{keyword}佳節】謹致祝福',
      ],
      contents: {
        short: [
          '值此{keyword}佳節，本殿敬祝闔府平安，萬事如意。',
          '{keyword}將至，謹代表本殿全體同仁，敬祝 福慧增長，吉祥如意。',
        ],
        medium: [
          '敬愛的信眾大德：\n\n值此{keyword}佳節來臨之際，本殿全體同仁謹致最誠摯的祝福。\n\n祈願 神明庇佑，闔府平安順遂，身體健康，萬事如意。',
          '各位信眾：\n\n{keyword}將至，謹代表本殿向各位致上最深的祝福。\n\n願 神明護佑眾位信眾福慧雙修、家庭和樂、事業順遂、心想事成。',
        ],
        detailed: [
          '敬愛的信眾大德鈞鑒：\n\n時序更迭，{keyword}佳節將至。藉此良辰美景，本殿全體同仁謹向各位信眾致上最誠摯的祝福與感謝。\n\n感謝各位長期以來對本殿的護持與支持，讓我們能持續弘揚善法、服務大眾。\n\n祈願 神明慈悲加被，庇佑十方信眾：\n身體康泰、闔家平安\n事業順遂、財源廣進\n福慧增長、心想事成\n\n敬祝 {keyword}吉祥 闔府安康',
          '各位尊敬的信眾大德：\n\n欣逢{keyword}佳節，本殿謹代表全體同仁，向各位致上最崇高的敬意與祝福。\n\n回首過去，感謝各位信眾的虔誠護持，讓本殿能持續服務大眾、傳承信仰。展望未來，我們將秉持初心，為十方信眾提供更好的服務。\n\n值此佳節，祈願 神明聖恩浩蕩，護佑眾位信眾：\n• 闔家平安，身心康泰\n• 福祿雙全，財源茂盛\n• 貴人相助，事事順遂\n\n謹此恭祝 {keyword}愉快 萬事如意',
        ],
      },
    },
    warm: {
      titles: [
        '【{keyword}快樂】滿滿祝福送給您',
        '【{keyword}祝福】願您幸福美滿',
        '【溫馨{keyword}】與您分享喜悅',
      ],
      contents: {
        short: [
          '{keyword}到了！祝福您和家人幸福滿滿、快樂每一天！',
          '親愛的朋友，{keyword}快樂！願神明保佑您一切順心！',
        ],
        medium: [
          '親愛的信眾朋友：\n\n{keyword}到了！在這個特別的日子，我們想送上滿滿的祝福給您。\n\n願您和家人在神明的庇佑下，幸福美滿、平安喜樂。{keyword}快樂！',
          '親愛的朋友您好：\n\n又到了{keyword}這個溫馨的節日！\n\n我們衷心祝福您和您所愛的人，都能感受到滿滿的幸福與溫暖。願神明保佑您，一切順心如意。',
        ],
        detailed: [
          '親愛的信眾朋友們：\n\n{keyword}到囉！在這個充滿喜悅的日子裡，我們要把最溫暖的祝福送給您。\n\n過去這段時間，謝謝您對本殿的支持與信任，讓我們感到好溫暖。現在換我們來祝福您！\n\n願您在這個{keyword}：\n💝 和家人歡聚，感受滿滿的愛\n💝 心情愉快，每天都有好事發生\n💝 身體健康，精神飽滿\n💝 神明保佑，一切順遂\n\n{keyword}快樂！我們也期待在殿裡看到您喔！',
          '親愛的朋友，{keyword}快樂！\n\n在這個溫馨的節日，我們想跟您說：謝謝您一直以來的陪伴與信任！\n\n{keyword}是團聚的日子，也是感恩的時刻。希望您能和家人朋友歡聚一堂，分享彼此的喜悅與幸福。\n\n我們衷心祝福您：\n🌸 家庭和樂，幸福美滿\n🌸 身體健康，心情愉快\n🌸 好運連連，心想事成\n🌸 神明庇佑，萬事如意\n\n願這份祝福陪伴您度過美好的{keyword}！有空也歡迎回來走走，我們永遠歡迎您！',
        ],
      },
    },
    concise: {
      titles: [
        '【{keyword}】敬祝平安',
        '{keyword}祝福',
        '【賀】{keyword}吉祥',
      ],
      contents: {
        short: [
          '{keyword}吉祥！敬祝 平安順遂。',
          '恭賀{keyword}！祝福您闔家安康。',
        ],
        medium: [
          '【{keyword}祝福】\n\n敬祝各位信眾：\n• 闔家平安\n• 身體健康\n• 萬事如意\n\n本殿全體同仁 敬賀',
          '{keyword}到來\n\n祝福您：\n身體健康、家庭美滿\n事業順遂、心想事成\n\n{keyword}吉祥！',
        ],
        detailed: [
          '【{keyword}祝賀】\n\n致各位信眾：\n\n值{keyword}佳節，謹致祝福。\n\n祝願項目：\n一、身體健康，精神愉快\n二、闔家平安，家庭和樂\n三、事業順遂，財源廣進\n四、心想事成，萬事如意\n\n祈神明庇佑，福壽雙全。\n\n本殿 敬賀\n{keyword}吉祥',
          '賀詞\n\n事由：{keyword}祝福\n\n各位信眾鈞鑒：\n\n時逢{keyword}佳節，謹代表本殿致上祝福。\n\n祝願事項：\n1. 身心康泰\n2. 闔家平安\n3. 諸事順遂\n4. 福慧增長\n\n特此恭賀\n\n{keyword}吉祥如意\n本殿全體同仁 敬上',
        ],
      },
    },
    enthusiastic: {
      titles: [
        '【{keyword}快樂】幸福滿滿送給您！',
        '【狂賀{keyword}】祝福大放送！',
        '【{keyword}到】好運福氣通通來！',
      ],
      contents: {
        short: [
          '{keyword}到！滿滿的祝福送給您！祝您超級快樂、超級幸福！',
          '耶～{keyword}快樂！願您福氣滿滿、好運旺旺！',
        ],
        medium: [
          '親愛的朋友們！\n\n{keyword}快樂！！！🎉\n\n在這個超棒的日子，我們要把滿滿滿滿的祝福都送給您！\n\n祝您和家人幸福100分、快樂100分、好運100分！{keyword}一起開心過！',
          'Hi～各位親愛的信眾！\n\n{keyword}來啦！好興奮啊！\n\n我們迫不及待要跟您說：{keyword}快樂！願您在這個超讚的日子，感受到滿滿的幸福和喜悅！福氣旺旺來！',
        ],
        detailed: [
          '親愛的信眾朋友們！！！\n\n{keyword}快樂快樂快樂！🎊🎉🎊\n\n終於等到這個超級棒的日子啦！我們要把最最最滿的祝福通通送給您！\n\n祝福大禮包內容：\n🌟 幸福指數破表！\n🌟 快樂程度爆棚！\n🌟 好運福氣連連來！\n🌟 心想事成不用等！\n🌟 闔家平安每一天！\n\n這個{keyword}，希望您跟家人朋友玩得超開心、吃得超滿足、幸福感滿滿滿！\n\n我們也超期待在殿裡看到您！{keyword}快樂～愛您喔！💕',
          '哇嗚～各位超棒的信眾朋友們！\n\n{keyword}終於到啦！！！好開心好開心！🎉\n\n趁這個大好日子，我們要大聲跟您說：\n\n🎊 {keyword}超級無敵快樂！🎊\n\n我們準備了一大堆祝福要送給您：\n\n✨ 祝您笑口常開，天天好心情\n✨ 祝您身體健康，精神百倍\n✨ 祝您家庭美滿，幸福滿分\n✨ 祝您財運亨通，荷包滿滿\n✨ 祝您心想事成，願望實現\n✨ 祝您好運連連，貴人相助\n\n{keyword}就是要開開心心過！趕快跟家人朋友團聚，一起歡樂一起嗨！\n\n我們也超歡迎您來殿裡走走，一起感受{keyword}的熱鬧氣氛！期待見到您～{keyword}快樂喔！🥳',
        ],
      },
    },
  },
  announcement: {
    formal: {
      titles: [
        '【公告】{keyword}',
        '【重要通知】{keyword}事宜',
        '【敬告信眾】關於{keyword}',
      ],
      contents: {
        short: [
          '茲公告本殿「{keyword}」相關事宜，詳情請洽服務處。',
          '敬告各位信眾：關於「{keyword}」，請參閱本殿公告。',
        ],
        medium: [
          '各位信眾：\n\n茲公告本殿「{keyword}」相關事宜。\n\n詳細內容請至本殿服務處查詢，或參閱官方網站公告。如有任何疑問，歡迎來電洽詢。',
          '敬告各位信眾：\n\n本殿特此公告「{keyword}」相關訊息。\n\n請各位信眾留意並配合相關事項。如需進一步了解，歡迎蒞臨本殿服務處洽詢。',
        ],
        detailed: [
          '公告\n\n主旨：{keyword}\n\n說明：\n一、本殿為服務廣大信眾，特此公告相關事項。\n二、請各位信眾詳閱公告內容，並配合相關規定。\n三、如有任何疑問，歡迎於服務時間內來電或親臨本殿服務處洽詢。\n\n服務時間：每日上午九時至下午五時\n\n特此公告，敬請 查照。\n\n本殿 啟',
          '敬告信眾\n\n事由：{keyword}\n\n各位信眾大德鈞鑒：\n\n本殿謹就「{keyword}」乙事，公告周知：\n\n一、相關事項說明如上述主旨\n二、實施日期：即日起\n三、適用對象：全體信眾\n四、洽詢方式：本殿服務處\n\n懇請各位信眾配合辦理，如有不便之處，敬請見諒。\n\n特此公告\n本殿 謹啟',
        ],
      },
    },
    warm: {
      titles: [
        '【通知】{keyword}小提醒',
        '【分享】關於{keyword}',
        '【告知】{keyword}訊息',
      ],
      contents: {
        short: [
          '親愛的信眾，跟您分享「{keyword}」的消息，歡迎了解詳情。',
          '大家好！關於「{keyword}」的事情想讓您知道，有問題隨時問我們喔！',
        ],
        medium: [
          '親愛的信眾朋友們：\n\n今天想跟大家分享「{keyword}」這件事。\n\n我們希望讓大家都能了解相關的訊息。如果有任何問題或想法，都很歡迎您跟我們聊聊！',
          '大家好：\n\n有件事情想讓大家知道一下，就是關於「{keyword}」。\n\n希望這個訊息對您有幫助。有任何問題的話，我們都很樂意為您解答喔！',
        ],
        detailed: [
          '親愛的信眾朋友們，大家好：\n\n今天想花一點時間跟大家聊聊「{keyword}」這件事。\n\n我們一直希望能讓大家獲得最新、最完整的訊息，所以特別發這封通知讓大家了解。\n\n這件事情的重點是：\n• 讓大家都能知道最新狀況\n• 希望大家配合相關的安排\n• 有任何問題我們都會盡力協助\n\n如果您看完之後有任何疑問或想法，非常歡迎來找我們聊聊！我們的服務處隨時為您開放。\n\n謝謝大家的配合，也謝謝您一直以來的支持！',
          '親愛的朋友們：\n\n有個消息想跟大家說一下，就是關於「{keyword}」的事情。\n\n我們知道大家可能會有些疑問，所以想在這裡好好跟大家說明。\n\n這件事情是這樣的：\n💡 我們想讓大家都了解目前的狀況\n💡 希望大家能配合我們的安排\n💡 如果造成任何不便，真的很抱歉\n\n我們會盡最大的努力，讓一切都順利進行。\n\n有任何問題嗎？隨時歡迎來問我們！不管是打電話、來殿裡聊聊，我們都很樂意為您服務。\n\n謝謝大家的體諒和支持！',
        ],
      },
    },
    concise: {
      titles: [
        '【公告】{keyword}',
        '【通知】{keyword}',
        '{keyword}公告',
      ],
      contents: {
        short: [
          '公告：{keyword}。詳情請洽服務處。',
          '通知事項：{keyword}。請信眾留意。',
        ],
        medium: [
          '【公告事項】\n\n主旨：{keyword}\n\n說明：相關事項請洽本殿服務處\n時間：服務時間內\n\n特此公告。',
          '通知\n\n事由：{keyword}\n處理：請依公告內容配合辦理\n洽詢：本殿服務處\n\n以上公告周知。',
        ],
        detailed: [
          '公告\n\n一、主旨：{keyword}\n\n二、說明：\n    1. 本公告即日起生效\n    2. 請信眾配合相關規定\n    3. 詳細內容請洽服務處\n\n三、洽詢方式：\n    • 地點：本殿服務處\n    • 時間：每日 09:00-17:00\n\n四、備註：如有疑問歡迎洽詢\n\n特此公告\n本殿 啟',
          '通知事項\n\n主旨：{keyword}\n生效：即日起\n對象：全體信眾\n\n說明事項：\n1. 請信眾詳閱公告內容\n2. 配合相關規定辦理\n3. 如有疑問請洽服務處\n\n服務時間：\n週一至週日 09:00-17:00\n\n聯絡方式：\n本殿服務處\n\n特此通知',
        ],
      },
    },
    enthusiastic: {
      titles: [
        '【重要消息】{keyword}快來看！',
        '【好消息】{keyword}公告！',
        '【快訊】{keyword}要告訴您！',
      ],
      contents: {
        short: [
          '有重要消息要告訴大家！「{keyword}」快來了解一下！',
          '叮叮叮！「{keyword}」的消息來囉！趕快來看看吧！',
        ],
        medium: [
          '各位親愛的信眾朋友！\n\n有重要消息要跟大家分享！就是關於「{keyword}」！\n\n這個消息超重要的，請大家一定要看一下喔！有問題的話隨時來找我們聊聊！',
          'Hi～大家好！\n\n快訊快訊！「{keyword}」的消息來囉！\n\n趕快來了解一下吧！我們會努力讓一切順利進行，有任何問題都歡迎問我們喔！',
        ],
        detailed: [
          '各位超棒的信眾朋友們！\n\n重要消息來囉！請大家注意注意！\n\n就是關於「{keyword}」這件事！\n\n我們想讓大家都知道這個消息，所以特別發通知給大家！\n\n這件事情很重要喔：\n⭐ 請大家務必了解相關內容\n⭐ 有任何問題我們都會解答\n⭐ 配合我們一起讓事情順利進行\n\n如果看完之後有任何疑問，超歡迎來找我們！不管是打電話、傳訊息、還是直接來殿裡，我們都很樂意為您服務！\n\n謝謝大家的支持！你們是最棒的！',
          'Hello～各位親愛的朋友們！\n\n重大消息重大消息！快來看快來看！\n\n「{keyword}」的最新訊息來囉！這可是超重要的消息，請大家一定要仔細看一下！\n\n我們想跟大家說的是：\n🔔 這件事情很重要，請大家留意\n🔔 我們會盡全力讓一切順利\n🔔 有任何問題隨時歡迎詢問\n\n不管您有什麼疑問、想法、或建議，我們都超級歡迎！\n\n可以這樣聯絡我們：\n📞 打電話來聊聊\n🏃 直接來殿裡找我們\n💬 線上留言也OK\n\n謝謝大家的配合！有你們真好！我們會繼續努力的！💪',
        ],
      },
    },
  },
  promotion: {
    formal: {
      titles: [
        '【優惠通知】{keyword}',
        '【特別企劃】{keyword}優惠方案',
        '【回饋信眾】{keyword}',
      ],
      contents: {
        short: [
          '本殿特推「{keyword}」優惠方案，敬請把握機會。詳情請洽服務處。',
          '感謝信眾支持，特推出「{keyword}」回饋活動，歡迎參與。',
        ],
        medium: [
          '各位信眾：\n\n為感謝各位長期護持，本殿特推出「{keyword}」優惠方案。\n\n歡迎信眾把握難得機會，詳細辦法請洽本殿服務處或參閱官方公告。',
          '敬愛的信眾：\n\n本殿為回饋廣大信眾，特舉辦「{keyword}」活動。\n\n誠摯邀請各位信眾踴躍參與，詳情請洽服務處。機會難得，敬請把握。',
        ],
        detailed: [
          '優惠公告\n\n主旨：{keyword}\n\n各位信眾大德：\n\n感謝各位長期以來對本殿的護持與支持。為回饋眾位信眾，本殿特推出「{keyword}」優惠方案。\n\n活動說明：\n一、活動期間：即日起至額滿為止\n二、適用對象：全體信眾\n三、優惠內容：詳見本殿公告\n四、辦理方式：請至本殿服務處洽詢\n\n機會難得，敬請把握。如有任何疑問，歡迎來電或親臨服務處洽詢。',
          '回饋活動公告\n\n事由：{keyword}\n\n各位尊敬的信眾：\n\n本殿秉持服務信眾之宗旨，特舉辦「{keyword}」回饋活動，以答謝各位長期以來的支持與愛護。\n\n活動詳情：\n• 活動期間：即日起\n• 參加資格：本殿信眾\n• 優惠方式：請洽服務處說明\n• 注意事項：數量有限，額滿為止\n\n歡迎各位信眾踴躍參與，共享此殊勝因緣。\n\n特此公告\n本殿 謹啟',
        ],
      },
    },
    warm: {
      titles: [
        '【好康分享】{keyword}來囉！',
        '【溫馨回饋】{keyword}送給您',
        '【限定優惠】{keyword}別錯過',
      ],
      contents: {
        short: [
          '親愛的信眾，好康來囉！「{keyword}」優惠等您來！',
          '想跟您分享一個好消息～「{keyword}」活動開跑了！歡迎參加！',
        ],
        medium: [
          '親愛的信眾朋友：\n\n好消息要告訴您！我們準備了「{keyword}」的優惠活動，想送給一直支持我們的您。\n\n這是我們的一點心意，希望您會喜歡。詳細內容歡迎來服務處了解喔！',
          '親愛的朋友：\n\n感謝您一直以來的支持，我們準備了「{keyword}」想回饋給您！\n\n希望這個優惠能帶給您一點小小的驚喜。有興趣的話，歡迎來了解詳情喔！',
        ],
        detailed: [
          '親愛的信眾朋友們：\n\n想跟您分享一個好消息！為了感謝大家一直以來的支持，我們特別準備了「{keyword}」優惠活動！\n\n這是我們的一點心意，希望能回饋給一直陪伴我們的您。\n\n活動內容很棒喔：\n💝 優惠內容豐富\n💝 參加方式簡單\n💝 適合所有信眾\n\n如果您有興趣，歡迎來服務處了解詳情！我們很樂意為您解說。這個優惠是限定的，希望您能把握機會喔！\n\n再次感謝您的支持，有您真好！',
          '親愛的朋友，您好：\n\n有個好消息想趕快告訴您！\n\n為了感謝您一直以來對我們的信任和支持，我們精心準備了「{keyword}」活動，想送給您作為感謝！\n\n這個優惠是這樣的：\n🎁 我們準備了很棒的回饋內容\n🎁 參加方式很簡單\n🎁 希望能讓您感到開心\n\n這個活動是限定的喔，所以如果您有興趣，建議可以早點來了解。我們的服務處隨時歡迎您，會很仔細地為您說明所有細節。\n\n感謝您一直以來的陪伴，我們會繼續努力，提供更好的服務給您！',
        ],
      },
    },
    concise: {
      titles: [
        '【優惠】{keyword}',
        '【限定】{keyword}活動',
        '{keyword}優惠公告',
      ],
      contents: {
        short: [
          '「{keyword}」優惠活動進行中。詳情洽服務處。',
          '限定優惠：{keyword}。額滿為止。',
        ],
        medium: [
          '【{keyword}】優惠公告\n\n活動期間：即日起\n適用對象：全體信眾\n辦理方式：服務處洽詢\n\n額滿為止，請把握機會。',
          '優惠活動：{keyword}\n\n內容：詳洽服務處\n期限：額滿為止\n對象：信眾\n\n歡迎參與。',
        ],
        detailed: [
          '優惠公告\n\n一、活動名稱：{keyword}\n\n二、活動內容：\n    1. 期間：即日起至額滿\n    2. 對象：全體信眾\n    3. 優惠：詳見服務處公告\n\n三、辦理方式：\n    • 地點：本殿服務處\n    • 時間：09:00-17:00\n\n四、備註：\n    • 數量有限\n    • 額滿為止\n\n特此公告',
          '活動公告\n\n主旨：{keyword}\n\n一、活動說明\n    - 類型：優惠活動\n    - 期間：即日起\n    - 對象：本殿信眾\n\n二、參加方式\n    - 地點：服務處\n    - 時間：服務時間內\n\n三、注意事項\n    - 額滿即止\n    - 以現場公告為準\n\n詳情請洽服務處',
        ],
      },
    },
    enthusiastic: {
      titles: [
        '【超級優惠】{keyword}不要錯過！',
        '【限時好康】{keyword}快來搶！',
        '【驚喜放送】{keyword}等你來！',
      ],
      contents: {
        short: [
          '超讚的「{keyword}」優惠來啦！趕快來搶，錯過可惜！',
          '好康報報！「{keyword}」優惠超划算！快來了解！',
        ],
        medium: [
          '親愛的朋友們！\n\n超級好康來啦！「{keyword}」優惠活動開跑！\n\n這麼棒的機會可不是天天有喔！趕快來服務處了解詳情，手腳要快！額滿就沒有囉！',
          'Hi～各位！\n\n重大好消息！「{keyword}」超值優惠登場！\n\n我們準備了超棒的內容要回饋給大家！機會難得，趕快來搶！早來早享受喔！',
        ],
        detailed: [
          '各位親愛的信眾朋友們！\n\n超級大好康來啦！請注意請注意！\n\n「{keyword}」優惠活動正式開跑！這可是我們精心準備的超值回饋！\n\n為什麼一定要參加？\n🔥 優惠內容超級棒！\n🔥 機會真的很難得！\n🔥 數量有限要把握！\n🔥 錯過絕對會後悔！\n\n還等什麼呢？趕快來服務處了解詳情！\n\n記住喔～\n⏰ 額滿就截止！\n⏰ 手腳要快！\n⏰ 早來早享受！\n\n我們超期待看到您！快來快來！',
          'Hello～各位最棒的信眾朋友們！\n\n天大的好消息！必看必看！\n\n「{keyword}」超級無敵優惠活動來啦！這絕對是您不能錯過的好康！\n\n我們準備了什麼？\n💎 超值優惠內容\n💎 回饋誠意滿滿\n💎 限定限量供應\n💎 先搶先贏喔\n\n為什麼要趕快行動？\n👉 因為數量有限！\n👉 因為額滿就沒了！\n👉 因為這麼划算很少見！\n\n所以所以所以～\n趕快放下手邊的事情，直奔服務處！讓我們告訴您所有的優惠細節！\n\n機會稍縱即逝，動作要快喔！\n我們準備好了，就等您來！衝衝衝！🏃‍♂️🏃‍♀️',
        ],
      },
    },
  },
};

// 預設範本
const defaultTemplates = [
  {
    id: 'event',
    name: '活動通知',
    title: '【活動通知】{eventName}',
    content: '親愛的信眾您好：\n\n本殿將於 {eventDate} 舉辦「{eventName}」，誠摯邀請您蒞臨參與。\n\n活動地點：{location}\n活動時間：{eventTime}\n\n歡迎攜家帶眷同來參拜，三官大帝庇佑闔家平安！\n\n{templeName} 敬上',
  },
  {
    id: 'reminder',
    name: '點燈提醒',
    title: '【溫馨提醒】您的{lampType}即將到期',
    content: '親愛的 {userName} 信眾您好：\n\n您於本殿點的「{lampType}」將於 {expireDate} 到期。\n\n如欲續點，請於到期前至本殿服務處辦理，或透過線上系統申請。\n\n感謝您長期護持，三官大帝保佑您平安順遂！\n\n{templeName} 敬上',
  },
  {
    id: 'festival',
    name: '節慶祝福',
    title: '【{festivalName}】{templeName}祝您{greeting}',
    content: '親愛的信眾：\n\n值此{festivalName}佳節，{templeName}全體同仁敬祝您：\n\n{greeting}\n闔家平安、事業順遂、福慧增長！\n\n{templeName} 敬上',
  },
  {
    id: 'announcement',
    name: '一般公告',
    title: '【公告】{subject}',
    content: '各位信眾您好：\n\n{content}\n\n如有任何疑問，歡迎來電或親臨本殿服務處洽詢。\n\n{templeName} 敬上',
  },
  {
    id: 'custom',
    name: '自訂訊息',
    title: '',
    content: '',
  },
];

// 客群選項
const audienceOptions = [
  { id: 'all', name: '全部信眾', description: '所有已註冊的信眾', count: 1250 },
  { id: 'active', name: '活躍信眾', description: '30天內有互動（打卡/訂單/報名）', count: 420 },
  { id: 'dormant', name: '休眠信眾', description: '超過90天無互動', count: 380 },
  { id: 'new', name: '新信眾', description: '30天內新註冊', count: 65 },
  { id: 'has_order', name: '有訂單記錄', description: '曾經下單的信眾', count: 280 },
  { id: 'lamp_expiring', name: '點燈即將到期', description: '30天內點燈到期', count: 85 },
  { id: 'birthday_month', name: '本月壽星', description: '本月生日的信眾', count: 42 },
  { id: 'event_registered', name: '特定活動報名者', description: '選擇特定活動的報名者', count: 0 },
  { id: 'custom', name: '自訂條件', description: '依打卡次數、消費金額等篩選', count: 0 },
];

// 活動列表（用於篩選特定活動報名者）
const eventOptions = [
  { id: 1, name: '上元天官賜福法會', registrations: 156 },
  { id: 2, name: '白河蓮花季祈福活動', registrations: 89 },
  { id: 3, name: '中元地官赦罪法會', registrations: 120 },
];

const NotificationNew = () => {
  const { templeId } = useParams();
  const navigate = useNavigate();

  // 廟宇資訊
  const templeInfo = {
    name: '三官寶殿',
  };

  // 表單狀態
  const [step, setStep] = useState(1); // 1: 客群, 2: 內容, 3: 預覽
  const [channels, setChannels] = useState(['line', 'app']);
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [customFilters, setCustomFilters] = useState({
    minCheckins: '',
    maxCheckins: '',
    minSpend: '',
    maxSpend: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduleType, setScheduleType] = useState('now'); // now, scheduled
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI 文案助手狀態
  const [aiAssistantExpanded, setAiAssistantExpanded] = useState(false);
  const [aiNotificationType, setAiNotificationType] = useState('event');
  const [aiCopyStyle, setAiCopyStyle] = useState('formal');
  const [aiCopyLength, setAiCopyLength] = useState('medium');
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [aiTargetAudience, setAiTargetAudience] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState('');
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');

  // AI 圖片助手狀態
  const [aiImageExpanded, setAiImageExpanded] = useState(false);
  const [aiImageFile, setAiImageFile] = useState(null);
  const [aiImagePreview, setAiImagePreview] = useState('');
  const [aiImageSize, setAiImageSize] = useState('');
  const [aiBackgroundMode, setAiBackgroundMode] = useState('scene'); // 'solid' or 'scene'
  const [aiSolidColor, setAiSolidColor] = useState('#ffffff');
  const [aiSceneDescription, setAiSceneDescription] = useState([]);
  const [aiSceneElement, setAiSceneElement] = useState([]);
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState('');
  const [notificationImage, setNotificationImage] = useState(''); // 最終選用的推播圖片

  // 點數相關（模擬）
  const [userPoints, setUserPoints] = useState(100);
  const imageGenerationCost = 30;

  // 計算目標人數（從 API 取得）
  const [targetCount, setTargetCount] = useState(0);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.notifications.audienceCount(
          templeId,
          selectedAudience,
          selectedAudience === 'event_registered' ? selectedEvent || null : null
        );
        if (res.data?.success) setTargetCount(res.data.data.count || 0);
      } catch {
        setTargetCount(0);
      }
    };
    fetch();
  }, [templeId, selectedAudience, selectedEvent]);

  // 套用範本
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const template = defaultTemplates.find((t) => t.id === templateId);
    if (template && templateId !== 'custom') {
      // 替換變數
      let newTitle = template.title
        .replace('{templeName}', templeInfo.name)
        .replace('{eventName}', '法會活動')
        .replace('{lampType}', '光明燈')
        .replace('{festivalName}', '新春')
        .replace('{greeting}', '新年快樂')
        .replace('{subject}', '');
      let newContent = template.content
        .replace(/{templeName}/g, templeInfo.name)
        .replace('{eventName}', '法會活動')
        .replace('{eventDate}', '農曆正月十五')
        .replace('{eventTime}', '上午9:00')
        .replace('{location}', '本殿正殿')
        .replace('{userName}', '○○○')
        .replace('{lampType}', '光明燈')
        .replace('{expireDate}', '○月○日')
        .replace('{festivalName}', '新春')
        .replace('{greeting}', '新年快樂')
        .replace('{subject}', '')
        .replace('{content}', '');
      setTitle(newTitle);
      setContent(newContent);
    }
  };

  // 切換發送管道
  const toggleChannel = (channel) => {
    if (channels.includes(channel)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== channel));
      }
    } else {
      setChannels([...channels, channel]);
    }
  };

  // 下一步
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  // 上一步
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // 送出
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('請填寫標題與內容');
      return;
    }
    setSubmitting(true);
    try {
      // 1. 建立通知草稿
      const payload = {
        templeId: Number(templeId),
        title: title.trim(),
        content: content.trim(),
        channels,
        targetAudience: selectedAudience,
        targetEventId: selectedAudience === 'event_registered' ? Number(selectedEvent) || null : null,
        targetFilters: selectedAudience === 'custom' ? customFilters : null,
        imageUrl: notificationImage || null,
      };
      const createRes = await api.notifications.create(payload);
      if (!createRes.data?.success) {
        throw new Error(createRes.data?.message || '建立失敗');
      }
      const notifId = createRes.data.data.id;

      // 2. 立即發送 or 排程
      if (scheduleType === 'now') {
        await api.notifications.send(notifId);
        alert('推播已發送！');
      } else {
        if (!scheduledAt) {
          alert('請選擇排程時間');
          setSubmitting(false);
          return;
        }
        await api.notifications.schedule(notifId, scheduledAt);
        alert('推播已排程！');
      }
      navigate(`/temple-admin/${templeId}/notifications`);
    } catch (err) {
      alert('操作失敗：' + (err.message || '請稍後再試'));
    } finally {
      setSubmitting(false);
    }
  };

  // AI 生成文案
  const handleAiGenerate = async () => {
    if (!aiKeyword.trim()) {
      alert('請輸入關鍵字或主題');
      return;
    }

    setAiGenerating(true);

    try {
      // 模擬 API 延遲
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 從模板庫取得對應的文案
      const typeTemplates = aiCopyTemplates[aiNotificationType];
      if (!typeTemplates) {
        throw new Error('找不到對應的通知類型模板');
      }

      const styleTemplates = typeTemplates[aiCopyStyle];
      if (!styleTemplates) {
        throw new Error('找不到對應的風格模板');
      }

      // 隨機選擇標題
      const titles = styleTemplates.titles;
      const randomTitleIndex = Math.floor(Math.random() * titles.length);
      let generatedTitle = titles[randomTitleIndex].replace(/{keyword}/g, aiKeyword);

      // 選擇對應長度的內容
      const contents = styleTemplates.contents[aiCopyLength];
      const randomContentIndex = Math.floor(Math.random() * contents.length);
      let generatedContent = contents[randomContentIndex].replace(/{keyword}/g, aiKeyword);

      // 加入額外描述（如果有的話）
      if (aiDescription.trim()) {
        generatedContent = generatedContent.replace(
          /\n\n/,
          `\n\n${aiDescription}\n\n`
        );
      }

      setAiGeneratedTitle(generatedTitle);
      setAiGeneratedContent(generatedContent);
    } catch (err) {
      alert('生成失敗：' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // 應用 AI 生成的文案
  const handleApplyAiCopy = () => {
    if (aiGeneratedTitle) {
      setTitle(aiGeneratedTitle);
    }
    if (aiGeneratedContent) {
      setContent(aiGeneratedContent);
    }
    setAiAssistantExpanded(false);
  };

  // 重新生成 AI 文案
  const handleRegenerateAi = () => {
    handleAiGenerate();
  };

  // AI 圖片助手 - 處理圖片上傳
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 檢查檔案類型
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('請上傳 jpg、jpeg、png 或 webp 格式的圖片');
        return;
      }
      // 檢查檔案大小（最大 10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('圖片大小不能超過 10MB');
        return;
      }
      setAiImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAiImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      // 清除之前生成的圖片
      setAiGeneratedImage('');
    }
  };

  // AI 圖片助手 - 移除上傳的圖片
  const handleRemoveImage = () => {
    setAiImageFile(null);
    setAiImagePreview('');
    setAiGeneratedImage('');
  };

  // AI 圖片助手 - 切換場景描述選項
  const toggleSceneDescription = (id) => {
    if (aiSceneDescription.includes(id)) {
      setAiSceneDescription(aiSceneDescription.filter((item) => item !== id));
    } else {
      setAiSceneDescription([...aiSceneDescription, id]);
    }
  };

  // AI 圖片助手 - 切換場景元素選項
  const toggleSceneElement = (id) => {
    if (aiSceneElement.includes(id)) {
      setAiSceneElement(aiSceneElement.filter((item) => item !== id));
    } else {
      setAiSceneElement([...aiSceneElement, id]);
    }
  };

  // AI 圖片助手 - 生成圖片
  const handleAiImageGenerate = async () => {
    if (!aiImageFile) {
      alert('請先上傳圖片');
      return;
    }
    if (!aiImageSize) {
      alert('請選擇生成尺寸');
      return;
    }
    if (aiBackgroundMode === 'scene' && aiSceneDescription.length === 0) {
      alert('請至少選擇一項場景描述');
      return;
    }
    if (userPoints < imageGenerationCost) {
      alert('點數不足，請先儲值');
      return;
    }

    setAiImageGenerating(true);

    try {
      // 模擬 API 延遲
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // 模擬生成結果（實際應該呼叫 AI 圖片生成 API）
      // 這裡使用原圖作為模擬結果
      setAiGeneratedImage(aiImagePreview);

      // 扣除點數
      setUserPoints(userPoints - imageGenerationCost);

    } catch (err) {
      alert('圖片生成失敗：' + err.message);
    } finally {
      setAiImageGenerating(false);
    }
  };

  // AI 圖片助手 - 應用生成的圖片
  const handleApplyAiImage = () => {
    if (aiGeneratedImage) {
      setNotificationImage(aiGeneratedImage);
      setAiImageExpanded(false);
    }
  };

  // AI 圖片助手 - 重新生成圖片
  const handleRegenerateAiImage = () => {
    handleAiImageGenerate();
  };

  // 移除推播圖片
  const handleRemoveNotificationImage = () => {
    setNotificationImage('');
  };

  // 儲存草稿
  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('已儲存草稿');
      navigate(`/temple-admin/${templeId}/notifications`);
    } catch (err) {
      alert('儲存失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>建立推播通知</h2>
        <button
          className="btn-secondary"
          onClick={() => navigate(`/temple-admin/${templeId}/notifications`)}
        >
          取消
        </button>
      </div>

      {/* 步驟指示 */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">選擇客群</div>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">編輯內容</div>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">預覽發送</div>
        </div>
      </div>

      {/* Step 1: 選擇客群 */}
      {step === 1 && (
        <div className="notification-form">
          <div className="form-section">
            <h3>發送管道</h3>
            <div className="channel-selector">
              <label className={`channel-option ${channels.includes('line') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={channels.includes('line')}
                  onChange={() => toggleChannel('line')}
                />
                <span className="channel-icon line-icon">LINE</span>
                <span className="channel-name">LINE 推播</span>
              </label>
              <label className={`channel-option ${channels.includes('app') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={channels.includes('app')}
                  onChange={() => toggleChannel('app')}
                />
                <span className="channel-icon app-icon">APP</span>
                <span className="channel-name">APP 推播</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>選擇發送客群</h3>
            <div className="audience-grid">
              {audienceOptions.map((audience) => (
                <label
                  key={audience.id}
                  className={`audience-option ${selectedAudience === audience.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={audience.id}
                    checked={selectedAudience === audience.id}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                  />
                  <div className="audience-info">
                    <div className="audience-name">{audience.name}</div>
                    <div className="audience-desc">{audience.description}</div>
                    {audience.id !== 'event_registered' && audience.id !== 'custom' && (
                      <div className="audience-count">{audience.count} 人</div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* 特定活動選擇 */}
            {selectedAudience === 'event_registered' && (
              <div className="sub-filter">
                <label className="form-label">選擇活動</label>
                <select
                  className="form-select"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  <option value="">請選擇活動</option>
                  {eventOptions.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.registrations} 人報名)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 自訂條件 */}
            {selectedAudience === 'custom' && (
              <div className="sub-filter custom-filter">
                <div className="filter-row">
                  <label className="form-label">打卡次數</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="最少"
                      value={customFilters.minCheckins}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, minCheckins: e.target.value })
                      }
                    />
                    <span>~</span>
                    <input
                      type="number"
                      placeholder="最多"
                      value={customFilters.maxCheckins}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, maxCheckins: e.target.value })
                      }
                    />
                    <span>次</span>
                  </div>
                </div>
                <div className="filter-row">
                  <label className="form-label">累計消費</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      placeholder="最少"
                      value={customFilters.minSpend}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, minSpend: e.target.value })
                      }
                    />
                    <span>~</span>
                    <input
                      type="number"
                      placeholder="最多"
                      value={customFilters.maxSpend}
                      onChange={(e) =>
                        setCustomFilters({ ...customFilters, maxSpend: e.target.value })
                      }
                    />
                    <span>元</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="target-summary">
            <span className="target-label">預估發送人數：</span>
            <span className="target-count">{targetCount.toLocaleString()} 人</span>
          </div>

          {targetCount === 0 && (
            <div className="warning-banner" style={{ color: '#b45309', background: '#fef3c7', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
              目前尚無符合條件的 LINE 追蹤者，仍可繼續建立推播草稿。
            </div>
          )}

          <div className="form-actions">
            <button className="btn-primary" onClick={handleNext}>
              下一步：編輯內容
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 編輯內容 */}
      {step === 2 && (
        <div className="notification-form">
          <div className="form-section">
            <h3>選擇範本</h3>
            <div className="template-selector">
              {defaultTemplates.map((template) => (
                <button
                  key={template.id}
                  className={`template-btn ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI 文案助手 */}
          <div className="form-section ai-assistant-section">
            <div
              className="ai-assistant-header"
              onClick={() => setAiAssistantExpanded(!aiAssistantExpanded)}
            >
              <h3>
                <span className="ai-icon">✨</span>
                AI 文案助手
              </h3>
              <span className={`expand-icon ${aiAssistantExpanded ? 'expanded' : ''}`}>
                {aiAssistantExpanded ? '收起' : '展開'}
              </span>
            </div>

            {aiAssistantExpanded && (
              <div className="ai-assistant-content">
                <div className="ai-form-row">
                  <div className="form-group">
                    <label className="form-label">通知類型</label>
                    <select
                      className="form-select"
                      value={aiNotificationType}
                      onChange={(e) => setAiNotificationType(e.target.value)}
                    >
                      {aiNotificationTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">文案風格</label>
                    <select
                      className="form-select"
                      value={aiCopyStyle}
                      onChange={(e) => setAiCopyStyle(e.target.value)}
                    >
                      {aiCopyStyles.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">文案長度</label>
                    <select
                      className="form-select"
                      value={aiCopyLength}
                      onChange={(e) => setAiCopyLength(e.target.value)}
                    >
                      {aiCopyLengths.map((length) => (
                        <option key={length.id} value={length.id}>
                          {length.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">關鍵字/主題</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aiKeyword}
                    onChange={(e) => setAiKeyword(e.target.value)}
                    placeholder="例如：元宵法會、光明燈、中秋節"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">補充描述（選填）</label>
                  <textarea
                    className="form-textarea"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="可補充活動詳情、特殊說明等，AI 會將這些內容融入文案"
                    rows={3}
                  />
                </div>

                <div className="ai-actions">
                  <button
                    className="btn-primary ai-generate-btn"
                    onClick={handleAiGenerate}
                    disabled={aiGenerating || !aiKeyword.trim()}
                  >
                    {aiGenerating ? (
                      <>
                        <span className="loading-spinner"></span>
                        AI 生成中...
                      </>
                    ) : (
                      <>
                        <span className="ai-icon">✨</span>
                        生成文案
                      </>
                    )}
                  </button>
                </div>

                {/* AI 生成結果 */}
                {(aiGeneratedTitle || aiGeneratedContent) && (
                  <div className="ai-result">
                    <div className="ai-result-header">
                      <h4>生成結果</h4>
                      <div className="ai-result-actions">
                        <button
                          className="btn-ghost btn-sm"
                          onClick={handleRegenerateAi}
                          disabled={aiGenerating}
                        >
                          重新生成
                        </button>
                        <button
                          className="btn-primary btn-sm"
                          onClick={handleApplyAiCopy}
                        >
                          套用此文案
                        </button>
                      </div>
                    </div>
                    <div className="ai-result-preview">
                      <div className="ai-preview-title">
                        <label>標題</label>
                        <div className="preview-text">{aiGeneratedTitle}</div>
                      </div>
                      <div className="ai-preview-content">
                        <label>內容</label>
                        <div className="preview-text">{aiGeneratedContent}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI 圖片助手 */}
          <div className="form-section ai-image-section">
            <div
              className="ai-assistant-header"
              onClick={() => setAiImageExpanded(!aiImageExpanded)}
            >
              <h3>
                <span className="ai-icon">🎨</span>
                AI 圖片助手
              </h3>
              <span className={`expand-icon ${aiImageExpanded ? 'expanded' : ''}`}>
                {aiImageExpanded ? '收起' : '展開'}
              </span>
            </div>

            {aiImageExpanded && (
              <div className="ai-image-content">
                {/* 點數資訊 */}
                <div className="points-info">
                  <div className="points-row">
                    <div className="points-item">
                      <span className="points-label">目前點數</span>
                      <span className="points-value">{userPoints} 點</span>
                    </div>
                    <div className="points-item">
                      <span className="points-label">所需點數</span>
                      <span className="points-cost">{imageGenerationCost} 點</span>
                    </div>
                  </div>
                </div>

                <div className="ai-image-layout">
                  {/* 左側：設定區 */}
                  <div className="ai-image-settings">
                    {/* 上傳圖片 */}
                    <div className="form-group">
                      <label className="form-label required">上傳圖片</label>
                      <div className="image-upload-area">
                        {aiImagePreview ? (
                          <div className="uploaded-preview">
                            <img src={aiImagePreview} alt="上傳預覽" />
                            <button
                              className="remove-image-btn"
                              onClick={handleRemoveImage}
                              type="button"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="upload-placeholder">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              onChange={handleImageUpload}
                              style={{ display: 'none' }}
                            />
                            <span className="upload-icon">📷</span>
                            <span className="upload-text">點擊上傳圖片</span>
                            <span className="upload-hint">支援 jpg、jpeg、png、webp 格式</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* 生成尺寸 */}
                    <div className="form-group">
                      <label className="form-label required">生成尺寸</label>
                      <select
                        className="form-select"
                        value={aiImageSize}
                        onChange={(e) => setAiImageSize(e.target.value)}
                      >
                        <option value="">- 請選擇生成尺寸大小 -</option>
                        {aiImageSizes.map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 背景模式 */}
                    <div className="form-group">
                      <label className="form-label">背景模式</label>
                      <div className="background-mode-options">
                        <label className={`mode-option ${aiBackgroundMode === 'solid' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="bgMode"
                            value="solid"
                            checked={aiBackgroundMode === 'solid'}
                            onChange={() => setAiBackgroundMode('solid')}
                          />
                          <span>純色背景</span>
                        </label>
                        <label className={`mode-option ${aiBackgroundMode === 'scene' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="bgMode"
                            value="scene"
                            checked={aiBackgroundMode === 'scene'}
                            onChange={() => setAiBackgroundMode('scene')}
                          />
                          <span>生成場景背景</span>
                        </label>
                      </div>
                    </div>

                    {/* 純色背景選擇器 */}
                    {aiBackgroundMode === 'solid' && (
                      <div className="form-group">
                        <label className="form-label">選擇背景顏色</label>
                        <div className="color-picker-row">
                          <input
                            type="color"
                            value={aiSolidColor}
                            onChange={(e) => setAiSolidColor(e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={aiSolidColor}
                            onChange={(e) => setAiSolidColor(e.target.value)}
                            className="color-input"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    )}

                    {/* 場景設定 */}
                    {aiBackgroundMode === 'scene' && (
                      <>
                        {/* 場景描述 */}
                        <div className="form-group">
                          <label className="form-label required">
                            場景描述
                            <span className="select-count">（已選 {aiSceneDescription.length} 項）</span>
                          </label>
                          <p className="form-hint-small">至少選擇一項場景描述</p>
                          <div className="tag-selector">
                            {aiSceneDescriptions.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className={`tag-btn ${aiSceneDescription.includes(item.id) ? 'selected' : ''}`}
                                onClick={() => toggleSceneDescription(item.id)}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 場景元素 */}
                        <div className="form-group">
                          <label className="form-label">
                            場景元素
                            <span className="select-count">（已選 {aiSceneElement.length} 項）</span>
                          </label>
                          <p className="form-hint-small">選擇要出現在背景中的元素</p>
                          <div className="tag-selector">
                            {aiSceneElements.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className={`tag-btn ${aiSceneElement.includes(item.id) ? 'selected' : ''}`}
                                onClick={() => toggleSceneElement(item.id)}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* 生成按鈕 */}
                    <div className="ai-image-actions">
                      <button
                        className="btn-primary ai-generate-btn"
                        onClick={handleAiImageGenerate}
                        disabled={
                          aiImageGenerating ||
                          !aiImageFile ||
                          !aiImageSize ||
                          (aiBackgroundMode === 'scene' && aiSceneDescription.length === 0) ||
                          userPoints < imageGenerationCost
                        }
                      >
                        {aiImageGenerating ? (
                          <>
                            <span className="loading-spinner"></span>
                            AI 生成中...
                          </>
                        ) : (
                          <>
                            <span className="ai-icon">🎨</span>
                            生成圖片（{imageGenerationCost} 點）
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 右側：結果區 */}
                  <div className="ai-image-result">
                    <div className="result-header">生成結果</div>
                    <div className="result-preview-area">
                      {aiGeneratedImage ? (
                        <div className="generated-image-container">
                          <img src={aiGeneratedImage} alt="AI 生成結果" />
                          <div className="generated-image-actions">
                            <button
                              className="btn-ghost btn-sm"
                              onClick={handleRegenerateAiImage}
                              disabled={aiImageGenerating || userPoints < imageGenerationCost}
                            >
                              重新生成
                            </button>
                            <button
                              className="btn-primary btn-sm"
                              onClick={handleApplyAiImage}
                            >
                              使用此圖片
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="result-placeholder">
                          <span className="placeholder-icon">🖼️</span>
                          <span className="placeholder-text">
                            {aiImageFile ? '設定完成後點擊生成按鈕' : '請先上傳圖片，以利後續操作'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>訊息內容</h3>

            {/* 推播圖片預覽 */}
            {notificationImage && (
              <div className="notification-image-preview">
                <label className="form-label">推播圖片</label>
                <div className="image-preview-container">
                  <img src={notificationImage} alt="推播圖片" />
                  <button
                    className="remove-image-btn"
                    onClick={handleRemoveNotificationImage}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label required">標題</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="輸入推播標題，或使用 AI 文案助手生成"
              />
            </div>
            <div className="form-group">
              <label className="form-label required">內容</label>
              <textarea
                className="form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="輸入推播內容，或使用 AI 文案助手生成"
                rows={8}
              />
            </div>
            <div className="form-hint">
              可用變數：{'{userName}'} 信眾姓名、{'{templeName}'} 廟宇名稱
            </div>
          </div>

          <div className="form-section">
            <h3>發送時間</h3>
            <div className="schedule-options">
              <label className={`schedule-option ${scheduleType === 'now' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="schedule"
                  value="now"
                  checked={scheduleType === 'now'}
                  onChange={() => setScheduleType('now')}
                />
                <span>立即發送</span>
              </label>
              <label className={`schedule-option ${scheduleType === 'scheduled' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="schedule"
                  value="scheduled"
                  checked={scheduleType === 'scheduled'}
                  onChange={() => setScheduleType('scheduled')}
                />
                <span>排程發送</span>
              </label>
            </div>
            {scheduleType === 'scheduled' && (
              <div className="form-group">
                <input
                  type="datetime-local"
                  className="form-input"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handleBack}>
              上一步
            </button>
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!title.trim() || !content.trim()}
            >
              下一步：預覽
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 預覽發送 */}
      {step === 3 && (
        <div className="notification-form">
          <div className="preview-section">
            <div className="preview-column">
              <h3>LINE 訊息預覽</h3>
              <div className="line-preview">
                <div className="line-chat-bubble">
                  <div className="line-sender">
                    <div className="line-avatar">{templeInfo.name.charAt(0)}</div>
                    <span className="line-name">{templeInfo.name}</span>
                  </div>
                  <div className="line-message">
                    <div className="line-title">{title}</div>
                    <div className="line-content">{content}</div>
                  </div>
                  <div className="line-time">現在</div>
                </div>
              </div>
            </div>
            <div className="preview-column">
              <h3>APP 推播預覽</h3>
              <div className="app-preview">
                <div className="app-notification">
                  <div className="app-notif-header">
                    <div className="app-icon">{templeInfo.name.charAt(0)}</div>
                    <div className="app-notif-meta">
                      <span className="app-name">{templeInfo.name}</span>
                      <span className="app-time">現在</span>
                    </div>
                  </div>
                  <div className="app-notif-title">{title}</div>
                  <div className="app-notif-content">
                    {content.length > 100 ? content.substring(0, 100) + '...' : content}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="send-summary">
            <h3>發送摘要</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">發送管道</span>
                <span className="summary-value">
                  {channels.map((ch) => (ch === 'line' ? 'LINE' : 'APP')).join('、')}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">目標客群</span>
                <span className="summary-value">
                  {audienceOptions.find((a) => a.id === selectedAudience)?.name}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">預估人數</span>
                <span className="summary-value">{targetCount.toLocaleString()} 人</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">發送時間</span>
                <span className="summary-value">
                  {scheduleType === 'now' ? '立即發送' : scheduledAt || '未設定'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={handleBack}>
              上一步
            </button>
            <button className="btn-ghost" onClick={handleSaveDraft} disabled={submitting}>
              儲存草稿
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? '處理中...'
                : scheduleType === 'now'
                ? '確認發送'
                : '確認排程'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationNew;
