import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DRINKS_FILE = path.join(DATA_DIR, 'drinks.json')

export interface Drink {
  id: string
  type: 'beer' | 'cachaca'
  amount: number
  timestamp: string
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readDrinks(): Drink[] {
  ensureDataDir()
  if (!fs.existsSync(DRINKS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(DRINKS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeDrinks(drinks: Drink[]) {
  ensureDataDir()
  fs.writeFileSync(DRINKS_FILE, JSON.stringify(drinks, null, 2))
}

export function addDrink(drink: Omit<Drink, 'id'>): Drink {
  const drinks = readDrinks()
  const newDrink: Drink = {
    ...drink,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  }
  drinks.push(newDrink)
  writeDrinks(drinks)
  return newDrink
}

export function getAllDrinks(): Drink[] {
  return readDrinks()
}

export function getDrinksByDateRange(startDate: Date, endDate: Date): Drink[] {
  const drinks = readDrinks()
  return drinks.filter((drink) => {
    const drinkDate = new Date(drink.timestamp)
    return drinkDate >= startDate && drinkDate <= endDate
  })
}

export function clearAllDrinks(): void {
  ensureDataDir()
  writeDrinks([])
}

