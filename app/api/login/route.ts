import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsernameAndPassword, createUser, getAllUsers } from '@/lib/storage'

const FIXED_PASSWORD = process.env.APP_PASSWORD || 'beercounter2024'

export async function POST(request: NextRequest) {
  try {
    const { username, password, isRegister } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    try {
      if (isRegister) {
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
      } else {
        let user = await getUserByUsernameAndPassword(username, password)
        
        if (!user) {
          const users = await getAllUsers()
          if (users.length === 0 && password === FIXED_PASSWORD) {
            user = await createUser(username, password)
          } else {
            return NextResponse.json(
              { success: false, error: 'Invalid username or password' },
              { status: 401 }
            )
          }
        }

        return NextResponse.json({ success: true, userId: user.id, username: user.username }, { status: 200 })
      }
    } catch (error: any) {
      console.error('Login/Register error:', error)
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

