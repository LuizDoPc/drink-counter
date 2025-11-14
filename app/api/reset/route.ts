import { NextResponse } from 'next/server'
import { clearAllDrinks } from '@/lib/storage'

export async function POST() {
  try {
    clearAllDrinks()
    return NextResponse.json({ success: true, message: 'All data has been reset' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    )
  }
}

