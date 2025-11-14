import { NextRequest, NextResponse } from 'next/server'
import { getUserByPassword, createUser, getAllUsers } from '@/lib/storage'

const FIXED_PASSWORD = process.env.APP_PASSWORD || 'beercounter2024'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    try {
      let user = await getUserByPassword(password)
      
      if (!user) {
        const users = await getAllUsers()
        if (users.length === 0 && password === FIXED_PASSWORD) {
          user = await createUser(password)
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid password' },
            { status: 401 }
          )
        }
      }

      return NextResponse.json({ success: true, userId: user.id }, { status: 200 })
    } catch (error: any) {
      console.error('Login error:', error)
      if (password === FIXED_PASSWORD) {
        return NextResponse.json({ success: true, userId: 'default' }, { status: 200 })
      }
      return NextResponse.json(
        { success: false, error: 'Database error. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}

