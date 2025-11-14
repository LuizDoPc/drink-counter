import { NextRequest, NextResponse } from 'next/server'
import { addDrink, getAllDrinks, type Drink } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { type, amount } = await request.json()

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Type and amount are required' },
        { status: 400 }
      )
    }

    if (type !== 'beer' && type !== 'cachaca') {
      return NextResponse.json(
        { error: 'Type must be beer or cachaca' },
        { status: 400 }
      )
    }

    const drink = addDrink({
      type,
      amount,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, drink }, { status: 200 })
  } catch (error: any) {
    console.error('Error adding drink:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to add drink. Storage may be unavailable.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const drinks = getAllDrinks()
    return NextResponse.json({ drinks }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch drinks' },
      { status: 500 }
    )
  }
}

