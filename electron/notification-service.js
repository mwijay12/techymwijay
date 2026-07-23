/**
 * Smart Notification Service
 * Schedules intelligent notifications for todos and spending.
 * Checks every 30 minutes for pending notifications.
 */

const { Notification } = require('electron')

let notificationInterval = null
let mainWindow = null
let notificationSettings = {
  enabled: true,
  dailySummary: true,
  todoReminders: true,
  budgetAlerts: true,
  summaryTime: '08:00',
}

function initNotificationService(win) {
  mainWindow = win

  if (!Notification.isSupported()) {
    console.warn('[Notifications] Not supported on this platform')
    return
  }

  notificationInterval = setInterval(() => {
    checkScheduledNotifications()
  }, 30 * 60 * 1000)

  setTimeout(() => {
    checkScheduledNotifications()
  }, 10_000)

  console.log('[Notifications] Service initialized')
}

async function checkScheduledNotifications() {
  if (!notificationSettings.enabled) return

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const [summaryHour, summaryMinute] = notificationSettings.summaryTime
    .split(':')
    .map(Number)

  const isSummaryTime =
    currentHour === summaryHour &&
    currentMinute >= summaryMinute &&
    currentMinute < summaryMinute + 30

  if (notificationSettings.dailySummary && isSummaryTime) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('request-daily-summary')
    }
  }
}

function sendDailySummary(data) {
  const { todoCount = 0, overdueCount = 0, todaySpending = 0, currency = 'TZS' } = data

  if (!notificationSettings.enabled) return

  const parts = []
  if (overdueCount > 0) {
    parts.push(`⚠️ ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}`)
  }
  if (todoCount > 0) {
    parts.push(`✅ ${todoCount} task${todoCount > 1 ? 's' : ''} today`)
  }
  if (todaySpending > 0) {
    parts.push(`💰 ${currency} ${todaySpending.toLocaleString()} spent today`)
  }

  const body =
    parts.length > 0
      ? parts.join('\n')
      : "You're all caught up! Kazi nzuri! 🎉"

  showNotification({
    title: 'Good morning, Davie! 🌅',
    body,
    urgency: overdueCount > 0 ? 'critical' : 'normal',
  })
}

function sendTodoDeadlineNotification(todo, daysUntilDue) {
  if (!notificationSettings.enabled || !notificationSettings.todoReminders) {
    return
  }

  const isToday = daysUntilDue === 0

  showNotification({
    title: isToday
      ? `📋 Due today: ${todo.title}`
      : `📋 Due tomorrow: ${todo.title}`,
    body: isToday
      ? 'This task is due today — leo hii!'
      : "Don't forget — kesho deadline!",
    urgency: isToday ? 'critical' : 'normal',
  })
}

function sendBudgetAlert(usedPercent, usedAmount, limit, currency) {
  if (!notificationSettings.enabled || !notificationSettings.budgetAlerts) {
    return
  }

  const isExceeded = usedPercent >= 100
  const remaining = Math.max(0, limit - usedAmount)

  showNotification({
    title: isExceeded
      ? '⚠️ Budget exceeded!'
      : `💸 Budget alert — ${usedPercent}% used`,
    body: isExceeded
      ? `Umezidi bajeti! You've spent ${currency} ${usedAmount.toLocaleString()} of ${currency} ${limit.toLocaleString()}`
      : `${currency} ${remaining.toLocaleString()} remaining this month`,
    urgency: isExceeded ? 'critical' : 'normal',
  })
}

function showNotification({ title, body, urgency = 'normal' }) {
  if (!Notification.isSupported()) return

  try {
    const notification = new Notification({
      title,
      body,
      silent: urgency === 'normal',
      urgency,
    })

    notification.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      }
    })

    notification.show()
  } catch (err) {
    console.warn('[Notifications] Failed to show:', err.message)
  }
}

function updateNotificationSettings(settings) {
  notificationSettings = { ...notificationSettings, ...settings }
}

function destroyNotificationService() {
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }
}

module.exports = {
  initNotificationService,
  sendDailySummary,
  sendTodoDeadlineNotification,
  sendBudgetAlert,
  showNotification,
  updateNotificationSettings,
  destroyNotificationService,
}
