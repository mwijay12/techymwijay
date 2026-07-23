'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  INTEGRATION_TESTS,
  runAllTests,
  getTestSummary,
  type TestResult,
} from '@/lib/integration-tests'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAppState } from '@/hooks/use-app-state'

export function IntegrationTestRunner() {
  const { user } = useAuth()
  const { isOnline } = useAppState()

  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [runCount, setRunCount] = useState(0)
  const [expandedTest, setExpandedTest] = useState<string | null>(null)

  const categories = [
    'all',
    ...Array.from(new Set(INTEGRATION_TESTS.map(t => t.category))),
  ]

  const filteredTests = selectedCategory === 'all'
    ? INTEGRATION_TESTS
    : INTEGRATION_TESTS.filter(t => t.category === selectedCategory)

  const handleRunTests = useCallback(async () => {
    setIsRunning(true)
    setResults({})

    const ctx = {
      userId: user?.uid,
      isOnline,
    }

    const testResults = await runAllTests(
      ctx,
      (id, result) => {
        setResults(prev => ({ ...prev, [id]: result }))
      }
    )

    setResults(testResults)
    setIsRunning(false)
    setRunCount(prev => prev + 1)
  }, [user?.uid, isOnline])

  const summary = getTestSummary(results)
  const hasResults = Object.keys(results).length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            Integration Test Runner
          </h3>
          <p className="text-xs text-gray-400">
            {INTEGRATION_TESTS.length} tests across {categories.length - 1} categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-300 bg-[#16162a] focus:outline-none disabled:opacity-50"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All tests' : cat}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
              !isRunning
                ? 'bg-brand-primary text-white hover:bg-brand-primary/95 shadow-lg shadow-brand-primary/20'
                : 'bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed'
            )}
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isRunning ? 'Running...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {hasResults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-4 p-4 rounded-xl border',
            summary.failed === 0
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-rose-500/20 bg-rose-500/5'
          )}
        >
          <div className="text-2xl">
            {summary.failed === 0 ? '🎉' : '⚠️'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              {summary.failed === 0
                ? `All ${summary.passed} tests passed successfully!`
                : `${summary.passed}/${summary.total} passed · ${summary.failed} failed`}
            </p>
            <p className="text-xs text-gray-400">
              {summary.skipped > 0 && `${summary.skipped} skipped · `}
              Avg {summary.avgDurationMs}ms · Run #{runCount}
            </p>
          </div>
          <div className={cn(
            'text-2xl font-black',
            summary.failed === 0 ? 'text-emerald-400' : 'text-rose-400'
          )}>
            {summary.successRate}%
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {filteredTests.map((test) => {
          const result = results[test.id]
          const isRunningThis = isRunning && !result

          return (
            <div
              key={test.id}
              className="bg-[#121225] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {test.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5 font-mono">
                      {test.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {test.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isRunningThis && (
                    <RefreshCw className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                  )}
                  {result && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {result.durationMs}ms
                      </span>
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : result.message.startsWith('Skipped') ? (
                        <Clock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  )}

                  {result?.details && (
                    <button
                      onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                      className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {expandedTest === test.id && result?.details && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <pre className="text-[9px] text-gray-400 font-mono bg-black/30 p-2 rounded max-h-40 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
