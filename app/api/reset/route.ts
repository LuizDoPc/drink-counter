import { NextRequest, NextResponse } from 'next/server'
import { clearAllDrinks } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json().catch(() => ({}))
    await clearAllDrinks(userId)
    return NextResponse.json({ success: true, message: 'All data has been reset' }, { status: 200 })
  } catch (error: any) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to reset data' },
      { status: 500 }
    )
  }
}

