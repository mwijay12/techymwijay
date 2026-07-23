'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Clock, CheckSquare, Wallet, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useElectron } from '@/hooks/use-electron'

interface NotificationPrefs {
  enabled: boolean
  dailySummary: boolean
  todoReminders: boolean
  budgetAlerts: boolean
  summaryTime: string
}

const STORAGE_KEY = 'mwijay_notification_prefs'

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') {
    return {
      enabled: true,
      dailySummary: true,
      todoReminders: true,
      budgetAlerts: true,
      summaryTime: '08:00',
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw
      ? JSON.parse(raw)
      : {
          enabled: true,
          dailySummary: true,
          todoReminders: true,
          budgetAlerts: true,
          summaryTime: '08:00',
        }
  } catch {
    return {
      enabled: true,
      dailySummary: true,
      todoReminders: true,
      budgetAlerts: true,
      summaryTime: '08:00',
    }
  }
}

interface NotificationSettingsProps {
  className?: string
}

export function NotificationSettings({
  className,
}: NotificationSettingsProps) {
  const { isElectron, showNotification, updateNotificationSettings } =
    useElectron()
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs)
  const [testSent, setTestSent] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    updateNotificationSettings(prefs)
  }, [prefs, updateNotificationSettings])

  const updatePref = <K extends keyof NotificationPrefs>(
    key: K,
    value: NotificationPrefs[K]
  ) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  const handleTestNotification = () => {
    showNotification(
      'Mwijay Tech Test',
      '✅ Desktop notifications are working! Argh safi.'
    )
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  if (!isElectron) {
    return (
      <div className={cn('text-xs text-brand-muted p-3', className)}>
        Desktop notifications are active in the Electron desktop app.
      </div>
    )
  }

  const settingRows = [
    {
      key: 'dailySummary' as const,
      label: 'Daily Summary',
      description: 'Morning briefing with todos and spending summary',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-purple-400',
    },
    {
      key: 'todoReminders' as const,
      label: 'Todo Reminders',
      description: 'Alerts for tasks due today or tomorrow',
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'text-emerald-400',
    },
    {
      key: 'budgetAlerts' as const,
      label: 'Budget Alerts',
      description: 'Alert when spending hits 80% and 100%',
      icon: <Wallet className="w-4 h-4" />,
      color: 'text-amber-400',
    },
  ]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {prefs.enabled ? (
            <Bell className="w-4 h-4 text-purple-400" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-500" />
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              Desktop Notifications
            </p>
            <p className="text-xs text-gray-400">
              System tray & OS notifications
            </p>
          </div>
        </div>
        <label className="relative cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(e) => updatePref('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 rounded-full transition-all duration-200 peer-checked:bg-purple-600 bg-gray-700 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all after:duration-200 peer-checked:after:translate-x-5" />
        </label>
      </div>

      <div
        className={cn(
          'space-y-2 transition-opacity duration-200',
          !prefs.enabled && 'opacity-40 pointer-events-none'
        )}
      >
        {settingRows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <span className={row.color}>{row.icon}</span>
              <div>
                <p className="text-sm text-white">{row.label}</p>
                <p className="text-[10px] text-gray-400">{row.description}</p>
              </div>
            </div>
            <label className="relative cursor-pointer flex-shrink-0 ml-4">
              <input
                type="checkbox"
                checked={prefs[row.key]}
                onChange={(e) => updatePref(row.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 rounded-full transition-all duration-200 peer-checked:bg-purple-600 bg-gray-700 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all after:duration-200 peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleTestNotification}
          disabled={!prefs.enabled}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-40"
        >
          {testSent ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Notification Sent!
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5" />
              Send Test Notification
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default NotificationSettings
