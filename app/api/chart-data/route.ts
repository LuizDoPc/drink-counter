import { NextRequest, NextResponse } from 'next/server'
import { getAllDrinks } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    const drinks = await getAllDrinks(userId)
    const now = new Date()
    
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const recentDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= last24Hours
    )

    const intervalData: { [key: number]: { beer: number; cachaca: number } } = {}
    
    recentDrinks.forEach((drink) => {
      const drinkDate = new Date(drink.timestamp)
      const minutes = drinkDate.getMinutes()
      const intervalMinutes = Math.floor(minutes / 30) * 30
      const intervalDate = new Date(drinkDate)
      intervalDate.setMinutes(intervalMinutes, 0, 0)
      const intervalTimestamp = intervalDate.getTime()
      
      if (!intervalData[intervalTimestamp]) {
        intervalData[intervalTimestamp] = { beer: 0, cachaca: 0 }
      }
      
      if (drink.type === 'beer') {
        intervalData[intervalTimestamp].beer += drink.amount
      } else {
        intervalData[intervalTimestamp].cachaca += drink.amount
      }
    })

    const chartData: Array<{ beer: number; cachaca: number; time: string }> = []
    const numIntervals = 48
    const intervalMs = 30 * 60 * 1000
    
    for (let i = numIntervals - 1; i >= 0; i--) {
      const intervalTime = new Date(now.getTime() - i * intervalMs)
      const intervalTimestamp = new Date(intervalTime)
      intervalTimestamp.setMinutes(Math.floor(intervalTime.getMinutes() / 30) * 30, 0, 0)
      const timestamp = intervalTimestamp.getTime()
      
      if (timestamp >= last24Hours.getTime()) {
        const hours = intervalTimestamp.getHours()
        const mins = intervalTimestamp.getMinutes()
        const timeKey = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        
        chartData.push({
          beer: intervalData[timestamp]?.beer || 0,
          cachaca: intervalData[timestamp]?.cachaca || 0,
          time: timeKey
        })
      }
    }

    const last1Hour = new Date(now.getTime() - 60 * 60 * 1000)
    const lastHourDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= last1Hour
    )

    const minuteData: { [key: string]: { beer: number; cachaca: number; time: string } } = {}
    
    lastHourDrinks.forEach((drink) => {
      const drinkDate = new Date(drink.timestamp)
      const minuteKey = `${drinkDate.getHours()}:${String(drinkDate.getMinutes()).padStart(2, '0')}`
      
      if (!minuteData[minuteKey]) {
        minuteData[minuteKey] = { beer: 0, cachaca: 0, time: minuteKey }
      }
      
      if (drink.type === 'beer') {
        minuteData[minuteKey].beer += drink.amount
      } else {
        minuteData[minuteKey].cachaca += drink.amount
      }
    })

    const oneHourChartData = Object.values(minuteData).sort((a, b) => {
      const [hourA, minA] = a.time.split(':').map(Number)
      const [hourB, minB] = b.time.split(':').map(Number)
      if (hourA !== hourB) return hourA - hourB
      return minA - minB
    })

    const last4Hours = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const last4HoursDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= last4Hours
    )

    const fourHourData: { [key: string]: { beer: number; cachaca: number; time: string } } = {}
    
    last4HoursDrinks.forEach((drink) => {
      const drinkDate = new Date(drink.timestamp)
      const minutes = drinkDate.getMinutes()
      const intervalMinutes = Math.floor(minutes / 15) * 15
      const timeKey = `${String(drinkDate.getHours()).padStart(2, '0')}:${String(intervalMinutes).padStart(2, '0')}`
      
      if (!fourHourData[timeKey]) {
        fourHourData[timeKey] = { beer: 0, cachaca: 0, time: timeKey }
      }
      
      if (drink.type === 'beer') {
        fourHourData[timeKey].beer += drink.amount
      } else {
        fourHourData[timeKey].cachaca += drink.amount
      }
    })

    const fourHourChartData = Object.values(fourHourData).sort((a, b) => {
      const [hourA, minA] = a.time.split(':').map(Number)
      const [hourB, minB] = b.time.split(':').map(Number)
      if (hourA !== hourB) return hourA - hourB
      return minA - minB
    })

    const last8Hours = new Date(now.getTime() - 8 * 60 * 60 * 1000)
    const last8HoursDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= last8Hours
    )

    const eightHourIntervalData: { [key: number]: { beer: number; cachaca: number } } = {}
    
    last8HoursDrinks.forEach((drink) => {
      const drinkDate = new Date(drink.timestamp)
      const minutes = drinkDate.getMinutes()
      const intervalMinutes = Math.floor(minutes / 30) * 30
      const intervalDate = new Date(drinkDate)
      intervalDate.setMinutes(intervalMinutes, 0, 0)
      const intervalTimestamp = intervalDate.getTime()
      
      if (!eightHourIntervalData[intervalTimestamp]) {
        eightHourIntervalData[intervalTimestamp] = { beer: 0, cachaca: 0 }
      }
      
      if (drink.type === 'beer') {
        eightHourIntervalData[intervalTimestamp].beer += drink.amount
      } else {
        eightHourIntervalData[intervalTimestamp].cachaca += drink.amount
      }
    })

    const eightHourChartData: Array<{ beer: number; cachaca: number; time: string }> = []
    const numIntervals8h = 16
    const intervalMs8h = 30 * 60 * 1000
    
    for (let i = numIntervals8h - 1; i >= 0; i--) {
      const intervalTime = new Date(now.getTime() - i * intervalMs8h)
      const intervalTimestamp = new Date(intervalTime)
      intervalTimestamp.setMinutes(Math.floor(intervalTime.getMinutes() / 30) * 30, 0, 0)
      const timestamp = intervalTimestamp.getTime()
      
      if (timestamp >= last8Hours.getTime()) {
        const hours = intervalTimestamp.getHours()
        const mins = intervalTimestamp.getMinutes()
        const timeKey = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        
        eightHourChartData.push({
          beer: eightHourIntervalData[timestamp]?.beer || 0,
          cachaca: eightHourIntervalData[timestamp]?.cachaca || 0,
          time: timeKey
        })
      }
    }

    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= last7Days
    )

    const dailyData: { [key: string]: { beer: number; cachaca: number; date: string } } = {}
    
    weekDrinks.forEach((drink) => {
      const drinkDate = new Date(drink.timestamp)
      const dateKey = drinkDate.toISOString().split('T')[0]
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { beer: 0, cachaca: 0, date: dateKey }
      }
      
      if (drink.type === 'beer') {
        dailyData[dateKey].beer += drink.amount
      } else {
        dailyData[dateKey].cachaca += drink.amount
      }
    })

    const weeklyChartData = Object.values(dailyData).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }).map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))

    return NextResponse.json(
      {
        hourly: chartData,
        oneHour: oneHourChartData,
        fourHour: fourHourChartData,
        eightHour: eightHourChartData,
        daily: weeklyChartData,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}

