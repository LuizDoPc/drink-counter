import { NextResponse } from 'next/server'
import { getAllDrinks } from '@/lib/storage'

export async function GET() {
  try {
    const drinks = getAllDrinks()
    const now = new Date()
    
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const recentDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= last24Hours
    )

    const hourlyData: { [key: string]: { beer: number; cachaca: number; time: string } } = {}
    
    recentDrinks.forEach((drink) => {
      const drinkDate = new Date(drink.timestamp)
      const hourKey = `${drinkDate.getHours()}:00`
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { beer: 0, cachaca: 0, time: hourKey }
      }
      
      if (drink.type === 'beer') {
        hourlyData[hourKey].beer += drink.amount
      } else {
        hourlyData[hourKey].cachaca += drink.amount
      }
    })

    const chartData = Object.values(hourlyData).sort((a, b) => {
      const timeA = parseInt(a.time.split(':')[0])
      const timeB = parseInt(b.time.split(':')[0])
      return timeA - timeB
    })

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

