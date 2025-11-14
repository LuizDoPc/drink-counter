import { NextRequest, NextResponse } from 'next/server'
import { addDrink, getAllDrinks, type Drink } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { type, amount, userId } = await request.json()

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

    console.error('Adding drink:', { type, amount, userId: userId || 'default' })
    const drink = await addDrink({
      type,
      amount,
      timestamp: new Date().toISOString(),
    }, userId || 'default')
    console.error('Drink added successfully:', drink.id)

    return NextResponse.json({ success: true, drink }, { status: 200 })
  } catch (error: any) {
    console.error('Error adding drink:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { error: error?.message || 'Failed to add drink. Storage may be unavailable.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    const drinks = await getAllDrinks(userId)
    return NextResponse.json({ drinks }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch drinks' },
      { status: 500 }
    )
  }
}

