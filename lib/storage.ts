import { put, list } from '@vercel/blob'

export interface Drink {
  id: string
  type: 'beer' | 'cachaca'
  amount: number
  timestamp: string
  userId?: string
}

export interface User {
  id: string
  username: string
  password: string
  createdAt: string
}

const DRINKS_BLOB_PREFIX = 'drinks'
const USERS_BLOB_PREFIX = 'users'

const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN

async function readDrinksBlob(): Promise<Drink[]> {
  if (!hasBlob) {
    console.error('Blob storage not configured, returning empty array')
    return []
  }

  try {
    console.error('Reading drinks from blob storage, prefix:', DRINKS_BLOB_PREFIX)
    const blobs = await list({ 
      prefix: DRINKS_BLOB_PREFIX
    })
    console.error('Found blobs with prefix:', blobs.blobs.length)
    if (blobs.blobs.length === 0) {
      console.error('No drinks blob found, returning empty array')
      return []
    }
    
    const sortedBlobs = blobs.blobs.sort((a, b) => {
      const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
      const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
      return timeB - timeA
    })
    
    const latestBlob = sortedBlobs[0]
    console.error('Fetching drinks from:', latestBlob.url, 'pathname:', latestBlob.pathname, 'uploaded:', latestBlob.uploadedAt)
    const response = await fetch(latestBlob.url)
    if (!response.ok) {
      console.error('Failed to fetch drinks blob:', response.status, response.statusText)
      return []
    }
    const data = await response.json()
    const drinks = Array.isArray(data) ? data : []
    console.error('Successfully read', drinks.length, 'drinks from blob')
    return drinks
  } catch (error: any) {
    console.error('Failed to read drinks from blob:', error)
    console.error('Error details:', error?.message, error?.stack)
    return []
  }
}

async function writeDrinksBlob(drinks: Drink[]): Promise<void> {
  if (!hasBlob) {
    throw new Error('Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.')
  }

  try {
    console.error('Writing', drinks.length, 'drinks to blob storage, prefix:', DRINKS_BLOB_PREFIX)
    const jsonData = JSON.stringify(drinks, null, 2)
    console.error('JSON data size:', jsonData.length, 'bytes')
    
    const filename = `${DRINKS_BLOB_PREFIX}-${Date.now()}.json`
    const result = await put(filename, jsonData, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    console.error('Successfully wrote drinks to blob:', result.url, 'pathname:', result.pathname)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const verify = await list({ prefix: DRINKS_BLOB_PREFIX })
    console.error('Verification: Found', verify.blobs.length, 'blobs after write')
    if (verify.blobs.length > 0) {
      console.error('Latest blob pathname:', verify.blobs[0].pathname)
    }
  } catch (error: any) {
    console.error('Failed to write drinks to blob:', error)
    console.error('Error details:', error?.message, error?.stack)
    throw new Error(`Failed to save data to blob storage: ${error?.message || 'Unknown error'}`)
  }
}

async function readUsersBlob(): Promise<User[]> {
  if (!hasBlob) {
    console.error('Blob storage not configured, returning empty array')
    return []
  }

  try {
    console.error('Reading users from blob storage, prefix:', USERS_BLOB_PREFIX)
    const blobs = await list({ 
      prefix: USERS_BLOB_PREFIX
    })
    console.error('Found user blobs:', blobs.blobs.length)
    if (blobs.blobs.length === 0) {
      console.error('No users blob found, returning empty array')
      return []
    }
    
    const sortedBlobs = blobs.blobs.sort((a, b) => {
      const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
      const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
      return timeB - timeA
    })
    
    const latestBlob = sortedBlobs[0]
    console.error('Fetching users from:', latestBlob.url, 'pathname:', latestBlob.pathname)
    const response = await fetch(latestBlob.url)
    if (!response.ok) {
      console.error('Failed to fetch users blob:', response.status, response.statusText)
      return []
    }
    const data = await response.json()
    const users = Array.isArray(data) ? data : []
    console.error('Successfully read', users.length, 'users from blob')
    return users
  } catch (error: any) {
    console.error('Failed to read users from blob:', error)
    console.error('Error details:', error?.message, error?.stack)
    return []
  }
}

async function writeUsersBlob(users: User[]): Promise<void> {
  if (!hasBlob) {
    throw new Error('Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.')
  }

  try {
    console.error('Writing', users.length, 'users to blob storage, prefix:', USERS_BLOB_PREFIX)
    const jsonData = JSON.stringify(users, null, 2)
    const filename = `${USERS_BLOB_PREFIX}-${Date.now()}.json`
    const result = await put(filename, jsonData, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    console.error('Successfully wrote users to blob:', result.url, 'pathname:', result.pathname)
  } catch (error: any) {
    console.error('Failed to write users to blob:', error)
    console.error('Error details:', error?.message, error?.stack)
    throw new Error(`Failed to save users to blob storage: ${error?.message || 'Unknown error'}`)
  }
}

async function readDrinks(userId?: string): Promise<Drink[]> {
  const allDrinks = await readDrinksBlob()
  
  if (userId) {
    return allDrinks.filter(drink => drink.userId === userId)
  }
  return allDrinks
}

async function writeDrinks(drinks: Drink[]): Promise<void> {
  await writeDrinksBlob(drinks)
}

export async function addDrink(drink: Omit<Drink, 'id'>, userId?: string): Promise<Drink> {
  const drinks = await readDrinks()
  const newDrink: Drink = {
    ...drink,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId: userId || 'default'
  }
  drinks.push(newDrink)
  await writeDrinks(drinks)
  return newDrink
}

export async function getAllDrinks(userId?: string): Promise<Drink[]> {
  return await readDrinks(userId)
}

export async function getDrinksByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<Drink[]> {
  const drinks = await readDrinks(userId)
  return drinks.filter((drink) => {
    const drinkDate = new Date(drink.timestamp)
    return drinkDate >= startDate && drinkDate <= endDate
  })
}

export async function clearAllDrinks(userId?: string): Promise<void> {
  if (userId) {
    const drinks = await readDrinks()
    const filteredDrinks = drinks.filter(drink => drink.userId !== userId)
    await writeDrinks(filteredDrinks)
  } else {
    await writeDrinks([])
  }
}

export async function getUserByUsernameAndPassword(username: string, password: string): Promise<User | null> {
  const users = await readUsersBlob()
  return users.find(user => user.username === username && user.password === password) || null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await readUsersBlob()
  return users.find(user => user.username === username) || null
}

export async function createUser(username: string, password: string): Promise<User> {
  const users = await readUsersBlob()
  const existingUser = users.find(user => user.username === username)
  if (existingUser) {
    throw new Error('Username already exists')
  }

  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    username,
    password,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  await writeUsersBlob(users)
  return newUser
}

export async function getAllUsers(): Promise<User[]> {
  return await readUsersBlob()
}

export async function updateUserUsername(userId: string, username: string): Promise<User> {
  const users = await readUsersBlob()
  const userIndex = users.findIndex(user => user.id === userId)
  
  if (userIndex === -1) {
    throw new Error('User not found')
  }
  
  const existingUser = users.find(user => user.username === username && user.id !== userId)
  if (existingUser) {
    throw new Error('Username already exists')
  }
  
  users[userIndex].username = username
  await writeUsersBlob(users)
  return users[userIndex]
}
