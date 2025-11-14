import { put, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

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

const DATA_DIR = path.join(process.cwd(), 'data')
const DRINKS_FILE = path.join(DATA_DIR, 'drinks.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

async function readDrinksBlob(): Promise<Drink[]> {
  if (!hasBlob) {
    return []
  }

  try {
    const blobs = await list({ prefix: DRINKS_BLOB_KEY })
    if (blobs.blobs.length === 0) {
      return []
    }
    
    const latestBlob = blobs.blobs[0]
    const response = await fetch(latestBlob.url)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to read drinks from blob:', error)
    return []
  }
}

async function writeDrinksBlob(drinks: Drink[]): Promise<void> {
  if (!hasBlob) {
    throw new Error('Blob storage not configured')
  }

  try {
    const jsonData = JSON.stringify(drinks, null, 2)
    await put(DRINKS_BLOB_KEY, jsonData, {
      access: 'public',
      contentType: 'application/json',
    })
  } catch (error) {
    console.error('Failed to write drinks to blob:', error)
    throw new Error('Failed to save data to blob storage.')
  }
}

async function readUsersBlob(): Promise<User[]> {
  if (!hasBlob) {
    return []
  }

  try {
    const blobs = await list({ prefix: USERS_BLOB_KEY })
    if (blobs.blobs.length === 0) {
      return []
    }
    
    const latestBlob = blobs.blobs[0]
    const response = await fetch(latestBlob.url)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to read users from blob:', error)
    return []
  }
}

async function writeUsersBlob(users: User[]): Promise<void> {
  if (!hasBlob) {
    throw new Error('Blob storage not configured')
  }

  try {
    const jsonData = JSON.stringify(users, null, 2)
    await put(USERS_BLOB_KEY, jsonData, {
      access: 'public',
      contentType: 'application/json',
    })
  } catch (error) {
    console.error('Failed to write users to blob:', error)
    throw new Error('Failed to save users to blob storage.')
  }
}

async function readDrinks(userId?: string): Promise<Drink[]> {
  let allDrinks: Drink[] = []

  if (hasBlob) {
    allDrinks = await readDrinksBlob()
  } else {
    ensureDataDir()
    if (fs.existsSync(DRINKS_FILE)) {
      try {
        const data = fs.readFileSync(DRINKS_FILE, 'utf-8')
        allDrinks = JSON.parse(data) as Drink[]
      } catch (error) {
        console.error('Failed to read drinks from file:', error)
      }
    }
  }

  if (userId) {
    return allDrinks.filter(drink => drink.userId === userId)
  }
  return allDrinks
}

async function writeDrinks(drinks: Drink[]): Promise<void> {
  if (hasBlob) {
    await writeDrinksBlob(drinks)
  } else {
    try {
      ensureDataDir()
      fs.writeFileSync(DRINKS_FILE, JSON.stringify(drinks, null, 2))
    } catch (error) {
      console.error('Failed to write drinks to file:', error)
      throw new Error('Failed to save data. File system may be read-only.')
    }
  }
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
  let users: User[] = []

  if (hasBlob) {
    users = await readUsersBlob()
  } else {
    ensureDataDir()
    if (fs.existsSync(USERS_FILE)) {
      try {
        const data = fs.readFileSync(USERS_FILE, 'utf-8')
        users = JSON.parse(data) as User[]
      } catch (error) {
        console.error('Failed to read users from file:', error)
      }
    }
  }

  return users.find(user => user.password === password) || null
}

export async function createUser(password: string): Promise<User> {
  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    password,
    createdAt: new Date().toISOString()
  }

  let users: User[] = []

  if (hasBlob) {
    users = await readUsersBlob()
    users.push(newUser)
    await writeUsersBlob(users)
  } else {
    try {
      ensureDataDir()
      users = fs.existsSync(USERS_FILE)
        ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')) as User[]
        : []
      users.push(newUser)
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    } catch (error) {
      console.error('Failed to create user in file:', error)
      throw new Error('Failed to create user')
    }
  }

  return newUser
}

export async function getAllUsers(): Promise<User[]> {
  if (hasBlob) {
    return await readUsersBlob()
  }

  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data) as User[]
  } catch (error) {
    console.error('Failed to get users from file:', error)
    return []
  }
}
