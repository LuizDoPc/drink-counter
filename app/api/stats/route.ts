import { NextResponse } from 'next/server'
import { getAllDrinks } from '@/lib/storage'

export async function GET() {
  try {
    const drinks = getAllDrinks()

    const totalBeer = drinks
      .filter((d) => d.type === 'beer')
      .reduce((sum, d) => sum + d.amount, 0)

    const totalCachaca = drinks
      .filter((d) => d.type === 'cachaca')
      .reduce((sum, d) => sum + d.amount, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= today
    )
    const todayBeer = todayDrinks
      .filter((d) => d.type === 'beer')
      .reduce((sum, d) => sum + d.amount, 0)
    const todayCachaca = todayDrinks
      .filter((d) => d.type === 'cachaca')
      .reduce((sum, d) => sum + d.amount, 0)

    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    const weekDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= thisWeek
    )
    const weekBeer = weekDrinks
      .filter((d) => d.type === 'beer')
      .reduce((sum, d) => sum + d.amount, 0)
    const weekCachaca = weekDrinks
      .filter((d) => d.type === 'cachaca')
      .reduce((sum, d) => sum + d.amount, 0)

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const monthDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= thisMonth
    )
    const monthBeer = monthDrinks
      .filter((d) => d.type === 'beer')
      .reduce((sum, d) => sum + d.amount, 0)
    const monthCachaca = monthDrinks
      .filter((d) => d.type === 'cachaca')
      .reduce((sum, d) => sum + d.amount, 0)

    const now = new Date()
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)
    const lastTwoHours = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const lastHourDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= lastHour
    )
    const lastHourBeer = lastHourDrinks
      .filter((d) => d.type === 'beer')
      .reduce((sum, d) => sum + d.amount, 0)
    const lastHourCachaca = lastHourDrinks
      .filter((d) => d.type === 'cachaca')
      .reduce((sum, d) => sum + d.amount, 0)

    const lastTwoHoursDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= lastTwoHours
    )
    const lastTwoHoursBeer = lastTwoHoursDrinks
      .filter((d) => d.type === 'beer')
      .reduce((sum, d) => sum + d.amount, 0)
    const lastTwoHoursCachaca = lastTwoHoursDrinks
      .filter((d) => d.type === 'cachaca')
      .reduce((sum, d) => sum + d.amount, 0)

    const lastDayDrinks = drinks.filter(
      (d) => new Date(d.timestamp) >= lastDay
    )
    const lastDayBeer = lastDayDrinks
      .filter((d) => d.type === 'beer')
      .reduce((sum, d) => sum + d.amount, 0)
    const lastDayCachaca = lastDayDrinks
      .filter((d) => d.type === 'cachaca')
      .reduce((sum, d) => sum + d.amount, 0)

    return NextResponse.json(
      {
        total: {
          beer: totalBeer,
          cachaca: totalCachaca,
          total: totalBeer + totalCachaca,
        },
        today: {
          beer: todayBeer,
          cachaca: todayCachaca,
          total: todayBeer + todayCachaca,
        },
        week: {
          beer: weekBeer,
          cachaca: weekCachaca,
          total: weekBeer + weekCachaca,
        },
        month: {
          beer: monthBeer,
          cachaca: monthCachaca,
          total: monthBeer + monthCachaca,
        },
        recent: {
          lastHour: {
            beer: lastHourBeer,
            cachaca: lastHourCachaca,
            total: lastHourBeer + lastHourCachaca,
          },
          lastTwoHours: {
            beer: lastTwoHoursBeer,
            cachaca: lastTwoHoursCachaca,
            total: lastTwoHoursBeer + lastTwoHoursCachaca,
          },
          lastDay: {
            beer: lastDayBeer,
            cachaca: lastDayCachaca,
            total: lastDayBeer + lastDayCachaca,
          },
        },
        totalDrinks: drinks.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

