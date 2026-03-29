// 通知服務層 — stub 模式，未來替換 API 時只改這裡

/**
 * Email 發送 stub（console.log + 模擬延遲）
 */
export const sendEmail = async ({ to, subject, body }) => {
  console.log(`[Email Stub] To: ${to}, Subject: ${subject}`)
  console.log(`[Email Stub] Body: ${body}`)
  await new Promise(r => setTimeout(r, 500 + Math.random() * 500))
  // 模擬 5% 失敗率
  if (Math.random() < 0.05) {
    throw new Error('Email 發送失敗（模擬）')
  }
  return { success: true, messageId: `email_${Date.now()}` }
}

/**
 * SMS 發送 stub
 */
export const sendSMS = async ({ to, body }) => {
  console.log(`[SMS Stub] To: ${to}, Body: ${body}`)
  await new Promise(r => setTimeout(r, 300 + Math.random() * 300))
  if (Math.random() < 0.05) {
    throw new Error('SMS 發送失敗（模擬）')
  }
  return { success: true, messageId: `sms_${Date.now()}` }
}

/**
 * 替換 {{variable}} 樣板變數
 */
export const resolveTemplate = (templateStr, variables) => {
  if (!templateStr) return ''
  return templateStr.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}

/**
 * 從訂單資料組合樣板變數
 */
export const buildVariables = (sourceType, sourceData, siteContent) => {
  const base = {
    templeName: siteContent?.basicInfo?.name || '白河三官寶殿',
    templePhone: siteContent?.basicInfo?.phone || '06-685-2428',
    date: new Date().toLocaleDateString('zh-TW'),
  }

  if (sourceType === 'lighting' && sourceData) {
    return {
      ...base,
      recipientName: sourceData.members?.map(m => m.name).join('、') || '',
      serviceType: sourceData.lightName || '點燈',
      amount: sourceData.totalAmount ? `NT$ ${sourceData.totalAmount.toLocaleString()}` : '',
      phone: sourceData.phone || '',
      email: sourceData.email || '',
    }
  }

  if (sourceType === 'pilgrimage' && sourceData) {
    return {
      ...base,
      recipientName: sourceData.contactName || '',
      serviceType: '進香',
      groupName: sourceData.templeName || '',
      visitDate: sourceData.visitDate || '',
      peopleCount: sourceData.peopleCount || '',
      phone: sourceData.phone || '',
      email: sourceData.email || '',
    }
  }

  if (sourceType === 'registration' && sourceData) {
    return {
      ...base,
      recipientName: sourceData.name || '',
      serviceType: '活動報名',
      eventTitle: sourceData.eventTitle || '',
      eventDate: sourceData.eventDate || '',
      phone: sourceData.phone || '',
      email: sourceData.email || '',
    }
  }

  return base
}

/**
 * 核心發送：遍歷收件人、呼叫 channel adapter、更新狀態、存入歷史
 */
export const processNotification = async (notification) => {
  const results = []
  const recipients = notification.recipients || []

  for (const recipient of recipients) {
    const result = { recipient, channels: {} }

    if (notification.channel === 'email' || notification.channel === 'both') {
      if (recipient.email) {
        try {
          const res = await sendEmail({
            to: recipient.email,
            subject: notification.subject || '',
            body: notification.body || '',
          })
          result.channels.email = { status: 'sent', ...res }
        } catch (err) {
          result.channels.email = { status: 'failed', error: err.message }
        }
      }
    }

    if (notification.channel === 'sms' || notification.channel === 'both') {
      if (recipient.phone) {
        try {
          const res = await sendSMS({
            to: recipient.phone,
            body: notification.body || '',
          })
          result.channels.sms = { status: 'sent', ...res }
        } catch (err) {
          result.channels.sms = { status: 'failed', error: err.message }
        }
      }
    }

    results.push(result)
  }

  // 判斷整體狀態
  const allChannels = results.flatMap(r => Object.values(r.channels))
  const hasFailed = allChannels.some(c => c.status === 'failed')
  const hasSent = allChannels.some(c => c.status === 'sent')

  let overallStatus = 'sent'
  if (hasFailed && !hasSent) overallStatus = 'failed'
  else if (hasFailed && hasSent) overallStatus = 'sent' // 部分成功仍算已發送

  return {
    status: overallStatus,
    results,
    sentAt: new Date().toISOString(),
    recipientCount: recipients.length,
  }
}

/**
 * 檢查自動規則 → 建草稿或直接發送
 */
export const evaluateAutoTrigger = (event, sourceType, sourceId, sourceData, siteContent, rules, templates) => {
  if (!rules || !Array.isArray(rules)) return null

  const activeRules = rules.filter(r => r.enabled && r.event === event)
  if (activeRules.length === 0) return null

  const drafts = []

  for (const rule of activeRules) {
    const template = templates?.find(t => t.id === rule.templateId)
    const variables = buildVariables(sourceType, sourceData, siteContent)

    // 收集收件人
    const recipients = []
    if (sourceData?.email) {
      recipients.push({
        name: sourceData.contactName || sourceData.name || sourceData.members?.map(m => m.name).join('、') || '',
        email: sourceData.email,
        phone: sourceData.phone || '',
      })
    } else if (sourceData?.phone) {
      recipients.push({
        name: sourceData.contactName || sourceData.name || sourceData.members?.map(m => m.name).join('、') || '',
        email: '',
        phone: sourceData.phone,
      })
    }

    if (recipients.length === 0) continue

    const draft = {
      id: Date.now() + Math.random(),
      type: 'auto',
      sourceType,
      sourceId,
      channel: rule.channel || 'email',
      subject: template ? resolveTemplate(template.subject, variables) : `${variables.serviceType}通知`,
      body: template ? resolveTemplate(template.body, variables) : '',
      recipients,
      status: rule.mode === 'auto_send' ? 'queued' : 'draft',
      ruleId: rule.id,
      ruleName: rule.name,
      createdAt: new Date().toISOString(),
    }

    drafts.push(draft)
  }

  return drafts.length > 0 ? drafts : null
}

/**
 * 收集所有不重複聯絡人（群發用）
 */
export const collectAllContacts = (lightings, pilgrimages, registrations, contactMessages) => {
  const contactMap = new Map()

  const addContact = (name, email, phone) => {
    const key = email || phone
    if (!key) return
    if (!contactMap.has(key)) {
      contactMap.set(key, { name: name || '', email: email || '', phone: phone || '' })
    } else {
      const existing = contactMap.get(key)
      if (!existing.name && name) existing.name = name
      if (!existing.email && email) existing.email = email
      if (!existing.phone && phone) existing.phone = phone
    }
  }

  lightings?.forEach(l => {
    const name = l.members?.map(m => m.name).join('、') || ''
    addContact(name, l.email, l.phone)
  })

  pilgrimages?.forEach(p => {
    addContact(p.contactName, p.email, p.phone)
  })

  registrations?.forEach(r => {
    addContact(r.name, r.email, r.phone)
  })

  contactMessages?.forEach(m => {
    addContact(m.name, m.email, m.phone)
  })

  return Array.from(contactMap.values())
}
