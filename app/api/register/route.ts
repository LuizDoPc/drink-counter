import { NextRequest, NextResponse } from 'next/server'
import { createUser, getAllUsers } from '@/lib/storage'

const FIXED_PASSWORD = process.env.APP_PASSWORD || 'beercounter2024'
const VERIFICATION_CODE = Buffer.from('vibecoding-verification-2024').toString('base64')

export async function POST(request: NextRequest) {
  try {
    const { username, password, verificationCode } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      )
    }

    if (verificationCode !== VERIFICATION_CODE) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    try {
      const users = await getAllUsers()
      if (users.length === 0 && password === FIXED_PASSWORD) {
        const user = await createUser(username, password)
        return NextResponse.json({ success: true, userId: user.id, username: user.username, message: 'User created successfully' }, { status: 200 })
      }
      
      try {
        const user = await createUser(username, password)
        return NextResponse.json({ success: true, userId: user.id, username: user.username, message: 'User created successfully' }, { status: 200 })
      } catch (error: any) {
        if (error.message === 'Username already exists') {
          return NextResponse.json(
            { success: false, error: 'Username already exists' },
            { status: 409 }
          )
        }
        throw error
      }
    } catch (error: any) {
      console.error('Register error:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Database error. Please try again.' },
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

