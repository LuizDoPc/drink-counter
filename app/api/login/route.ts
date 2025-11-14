import { NextRequest, NextResponse } from 'next/server'

const FIXED_PASSWORD = process.env.APP_PASSWORD || 'beercounter2024'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === FIXED_PASSWORD) {
      return NextResponse.json({ success: true }, { status: 200 })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}

