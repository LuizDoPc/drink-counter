'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Stats {
  total: { beer: number; cachaca: number; total: number }
  today: { beer: number; cachaca: number; total: number }
  week: { beer: number; cachaca: number; total: number }
  month: { beer: number; cachaca: number; total: number }
  recent: {
    lastHour: { beer: number; cachaca: number; total: number }
    lastTwoHours: { beer: number; cachaca: number; total: number }
    lastDay: { beer: number; cachaca: number; total: number }
  }
  totalDrinks: number
}

export default function CounterPage() {
  const [activeTab, setActiveTab] = useState<'counter' | 'stats'>('counter')
  const [loadingButton, setLoadingButton] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<Array<{ time: string; beer: number; cachaca: number }>>([])
  const [oneHourChartData, setOneHourChartData] = useState<Array<{ time: string; beer: number; cachaca: number }>>([])
  const [weeklyChartData, setWeeklyChartData] = useState<Array<{ date: string; beer: number; cachaca: number }>>([])
  const [chartTimeRange, setChartTimeRange] = useState<'1h' | '24h'>('1h')
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      router.push('/')
      return
    }
    fetchStats()
    fetchChartData()
    const interval = setInterval(() => {
      fetchStats()
      fetchChartData()
    }, 60000)
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (showResetModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showResetModal])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/chart-data')
      const data = await response.json()
      setChartData(data.hourly || [])
      setOneHourChartData(data.oneHour || [])
      setWeeklyChartData(data.daily || [])
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    }
  }

  const handleDrink = async (type: 'beer' | 'cachaca', amount: number) => {
    const buttonId = `${type}-${amount}`
    setLoadingButton(buttonId)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/drinks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, amount }),
      })

      if (response.ok) {
        const data = await response.json()
        const drinkType = type === 'beer' ? '🍺 Beer' : '🥃 Cachaça'
        const drinkAmount = formatVolume(amount)
        setIsError(false)
        setSuccessMessage(`${drinkType} ${drinkAmount} added! 🎉`)
        await fetchStats()
        await fetchChartData()
        setTimeout(() => {
          setSuccessMessage(null)
          setIsError(false)
        }, 3000)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to add drink:', response.status, errorData)
        setIsError(true)
        setSuccessMessage(`❌ ${errorData.error || 'Server error'}`)
        setTimeout(() => {
          setSuccessMessage(null)
          setIsError(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to add drink:', error)
      setIsError(true)
      setSuccessMessage('❌ Network error or server unavailable')
      setTimeout(() => {
        setSuccessMessage(null)
        setIsError(false)
      }, 5000)
    } finally {
      setTimeout(() => setLoadingButton(null), 500)
    }
  }

  const formatVolume = (ml: number) => {
    if (ml >= 1000) {
      return `${(ml / 1000).toFixed(1)}L`
    }
    return `${ml}ml`
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      })

      if (response.ok) {
        setShowResetModal(false)
        setIsError(false)
        await fetchStats()
        await fetchChartData()
        setSuccessMessage('All data has been reset! 🔄')
        setTimeout(() => {
          setSuccessMessage(null)
          setIsError(false)
        }, 3000)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setIsError(true)
        setSuccessMessage(`❌ ${errorData.error || 'Failed to reset data'}`)
        setTimeout(() => {
          setSuccessMessage(null)
          setIsError(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to reset:', error)
      setIsError(true)
      setSuccessMessage('❌ Network error or server unavailable')
      setTimeout(() => {
        setSuccessMessage(null)
        setIsError(false)
      }, 5000)
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🍺 Beer Counter</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('isLoggedIn')
              router.push('/')
            }}
            className="text-white hover:text-gray-200 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex border-b bg-white sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => setActiveTab('counter')}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${
            activeTab === 'counter'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-500'
          }`}
        >
          🍻 Counter
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${
            activeTab === 'stats'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-500'
          }`}
        >
          📊 Stats
        </button>
      </div>

      {activeTab === 'counter' && (
        <div className="p-4 space-y-6">

          {stats && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                ⚡ Recent Consumption
              </h3>
              <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Last Hour</div>
                  <div className="font-bold text-base text-blue-700">
                    {formatVolume(stats.recent.lastHour.total)}
                  </div>
                </div>
                <div className="text-center border-x border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">Last 2 Hours</div>
                  <div className="font-bold text-base text-blue-700">
                    {formatVolume(stats.recent.lastTwoHours.total)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Last Day</div>
                  <div className="font-bold text-base text-blue-700">
                    {formatVolume(stats.recent.lastDay.total)}
                  </div>
                </div>
              </div>
              {(chartData.length > 0 || oneHourChartData.length > 0) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      📈 Consumption Over Time
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartTimeRange('1h')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          chartTimeRange === '1h'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        1 Hour
                      </button>
                      <button
                        onClick={() => setChartTimeRange('24h')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          chartTimeRange === '24h'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        24 Hours
                      </button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartTimeRange === '1h' ? oneHourChartData : chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        interval={chartTimeRange === '24h' ? 'preserveStartEnd' : 0}
                        angle={chartTimeRange === '24h' ? -45 : 0}
                        textAnchor={chartTimeRange === '24h' ? 'end' : 'middle'}
                        height={chartTimeRange === '24h' ? 60 : 30}
                      />
                      <YAxis 
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'ml', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => formatVolume(value)}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="beer" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        name="🍺 Beer"
                        dot={{ fill: '#f59e0b', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cachaca" 
                        stroke="#eab308" 
                        strokeWidth={3}
                        name="🥃 Cachaça"
                        dot={{ fill: '#eab308', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🍺 Beer
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDrink('beer', 300)}
                disabled={loadingButton !== null}
                className={`bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-6 rounded-xl transition-all duration-200 text-xl shadow-md ${
                  loadingButton === 'beer-300'
                    ? 'opacity-50 cursor-not-allowed scale-95'
                    : 'hover:from-amber-500 hover:to-amber-600 active:scale-95'
                }`}
              >
                {loadingButton === 'beer-300' ? '⏳ Adding...' : '🍺 300ml'}
              </button>
              <button
                onClick={() => handleDrink('beer', 500)}
                disabled={loadingButton !== null}
                className={`bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-6 rounded-xl transition-all duration-200 text-xl shadow-md ${
                  loadingButton === 'beer-500'
                    ? 'opacity-50 cursor-not-allowed scale-95'
                    : 'hover:from-amber-600 hover:to-amber-700 active:scale-95'
                }`}
              >
                {loadingButton === 'beer-500' ? '⏳ Adding...' : '🍺 500ml'}
              </button>
              <button
                onClick={() => handleDrink('beer', 1000)}
                disabled={loadingButton !== null}
                className={`bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-6 rounded-xl transition-all duration-200 text-xl shadow-md ${
                  loadingButton === 'beer-1000'
                    ? 'opacity-50 cursor-not-allowed scale-95'
                    : 'hover:from-amber-700 hover:to-amber-800 active:scale-95'
                }`}
              >
                {loadingButton === 'beer-1000' ? '⏳ Adding...' : '🍺 1L'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🥃 Cachaça
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDrink('cachaca', 50)}
                disabled={loadingButton !== null}
                className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-6 rounded-xl transition-all duration-200 text-xl shadow-md ${
                  loadingButton === 'cachaca-50'
                    ? 'opacity-50 cursor-not-allowed scale-95'
                    : 'hover:from-yellow-600 hover:to-yellow-700 active:scale-95'
                }`}
              >
                {loadingButton === 'cachaca-50' ? '⏳ Adding...' : '🥃 50ml (Dose)'}
              </button>
              <button
                onClick={() => handleDrink('cachaca', 190)}
                disabled={loadingButton !== null}
                className={`bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold py-6 rounded-xl transition-all duration-200 text-xl shadow-md ${
                  loadingButton === 'cachaca-190'
                    ? 'opacity-50 cursor-not-allowed scale-95'
                    : 'hover:from-yellow-700 hover:to-yellow-800 active:scale-95'
                }`}
              >
                {loadingButton === 'cachaca-190' ? '⏳ Adding...' : '🥃 190ml (Lavrado)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="p-4 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                📊 Statistics Dashboard
              </h2>
              <button
                onClick={() => setShowResetModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
              >
                🗑️ Reset All Data
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">📅 Today</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beer:</span>
                    <span className="font-bold">{formatVolume(stats.today.beer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cachaça:</span>
                    <span className="font-bold">{formatVolume(stats.today.cachaca)}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex justify-between">
                    <span className="text-gray-700 font-semibold">Total:</span>
                    <span className="font-bold text-base text-amber-700">
                      {formatVolume(stats.today.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">📆 This Week</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beer:</span>
                    <span className="font-bold">{formatVolume(stats.week.beer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cachaça:</span>
                    <span className="font-bold">{formatVolume(stats.week.cachaca)}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 flex justify-between">
                    <span className="text-gray-700 font-semibold">Total:</span>
                    <span className="font-bold text-base text-blue-700">
                      {formatVolume(stats.week.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">🗓️ This Month</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beer:</span>
                    <span className="font-bold">{formatVolume(stats.month.beer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cachaça:</span>
                    <span className="font-bold">{formatVolume(stats.month.cachaca)}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-200 flex justify-between">
                    <span className="text-gray-700 font-semibold">Total:</span>
                    <span className="font-bold text-base text-purple-700">
                      {formatVolume(stats.month.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">🏆 All Time</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beer:</span>
                    <span className="font-bold">{formatVolume(stats.total.beer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cachaça:</span>
                    <span className="font-bold">{formatVolume(stats.total.cachaca)}</span>
                  </div>
                  <div className="pt-2 border-t border-green-200 flex justify-between">
                    <span className="text-gray-700 font-semibold">Total:</span>
                    <span className="font-bold text-base text-green-700">
                      {formatVolume(stats.total.total)}
                    </span>
                  </div>
                  <div className="pt-1 text-center">
                    <span className="text-gray-600 text-xs">Total Drinks: </span>
                    <span className="font-bold text-sm">{stats.totalDrinks}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 mb-6 border-2 border-amber-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                📊 Consumption Comparison
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { period: 'Today', beer: stats.today.beer, cachaca: stats.today.cachaca },
                  { period: 'Week', beer: stats.week.beer, cachaca: stats.week.cachaca },
                  { period: 'Month', beer: stats.month.beer, cachaca: stats.month.cachaca },
                  { period: 'All Time', beer: stats.total.beer, cachaca: stats.total.cachaca }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="period" stroke="#64748b" />
                  <YAxis stroke="#64748b" label={{ value: 'ml', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatVolume(value)}
                  />
                  <Legend />
                  <Bar dataKey="beer" fill="#f59e0b" name="🍺 Beer" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="cachaca" fill="#eab308" name="🥃 Cachaça" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {weeklyChartData.length > 0 && (
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 mb-6 border-2 border-blue-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  📈 Weekly Trend (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#64748b" label={{ value: 'ml', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => formatVolume(value)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="beer" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="🍺 Beer"
                      dot={{ fill: '#f59e0b', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cachaca" 
                      stroke="#eab308" 
                      strokeWidth={3}
                      name="🥃 Cachaça"
                      dot={{ fill: '#eab308', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                🥧 Total Consumption Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '🍺 Beer', value: stats.total.beer },
                      { name: '🥃 Cachaça', value: stats.total.cachaca }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#f59e0b" />
                    <Cell fill="#eab308" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatVolume(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
      {successMessage && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 font-semibold px-6 py-4 rounded-xl shadow-2xl z-[10000] animate-slide-down flex items-center gap-2 min-w-[280px] max-w-[90vw] ${
            isError 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}
          style={{ 
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          {!isError && <span className="text-2xl">🎉</span>}
          <p className="text-lg">{successMessage}</p>
        </div>
      )}
      {showResetModal && (
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Reset All Data?
              </h3>
              <p className="text-gray-600">
                This action cannot be undone. All your drinking history will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

