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
  password: string
  createdAt: string
}

const DRINKS_BLOB_KEY = 'drinks.json'
const USERS_BLOB_KEY = 'users.json'

const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN

async function readDrinksBlob(): Promise<Drink[]> {
  if (!hasBlob) {
    console.error('Blob storage not configured, returning empty array')
    return []
  }

  try {
    console.error('Reading drinks from blob storage...')
    const blobs = await list({ 
      prefix: DRINKS_BLOB_KEY
    })
    console.error('Found blobs:', blobs.blobs.length)
    if (blobs.blobs.length === 0) {
      console.error('No drinks blob found, returning empty array')
      return []
    }
    
    const latestBlob = blobs.blobs[0]
    console.error('Fetching drinks from:', latestBlob.url)
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
    const jsonData = JSON.stringify(drinks, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const result = await put(DRINKS_BLOB_KEY, blob, {
      access: 'public',
      contentType: 'application/json',
    })
    console.error('Successfully wrote drinks to blob:', result.url)
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
    console.error('Reading users from blob storage...')
    const blobs = await list({ 
      prefix: USERS_BLOB_KEY
    })
    console.error('Found user blobs:', blobs.blobs.length)
    if (blobs.blobs.length === 0) {
      console.error('No users blob found, returning empty array')
      return []
    }
    
    const latestBlob = blobs.blobs[0]
    console.error('Fetching users from:', latestBlob.url)
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
    const jsonData = JSON.stringify(users, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const result = await put(USERS_BLOB_KEY, blob, {
      access: 'public',
      contentType: 'application/json',
    })
    console.error('Successfully wrote users to blob:', result.url)
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

export async function getUserByPassword(password: string): Promise<User | null> {
  const users = await readUsersBlob()
  return users.find(user => user.password === password) || null
}

export async function createUser(password: string): Promise<User> {
  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    password,
    createdAt: new Date().toISOString()
  }

  const users = await readUsersBlob()
  users.push(newUser)
  await writeUsersBlob(users)
  return newUser
}

export async function getAllUsers(): Promise<User[]> {
  return await readUsersBlob()
}
