import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGODB_DB_NAME || 'NuxtShop'

const adminUsername = process.env.NUXTSHOP_ADMIN_USERNAME || 'admin'
const adminPassword = process.env.NUXTSHOP_ADMIN_PASSWORD || 'admin123'

const homeAds = [
  {
    id: 1,
    position: 'home',
    image: 'https://images.unsplash.com/photo-1523275335684-bd4202213ad2?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=electronics',
    altKey: 'pages.home.adElectronics',
    order: 1,
    active: true
  },
  {
    id: 2,
    position: 'home',
    image: 'https://images.unsplash.com/photo-1561053720-76ae374061ea?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=jewelery',
    altKey: 'pages.home.adJewelery',
    order: 2,
    active: true
  },
  {
    id: 3,
    position: 'home',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead290f2?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=men%27s%20clothing',
    altKey: 'pages.home.adMen',
    order: 3,
    active: true
  }
]

const wishlistAds = [
  {
    id: 1,
    position: 'wishlist',
    image: 'https://images.unsplash.com/photo-1523275335684-bd4202213ad2?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=electronics',
    altKey: 'pages.wishlist.adAltElectronics',
    order: 1,
    active: true
  },
  {
    id: 2,
    position: 'wishlist',
    image: 'https://images.unsplash.com/photo-1561053720-76ae374061ea?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=jewelery',
    altKey: 'pages.wishlist.adAltJewelery',
    order: 2,
    active: true
  }
]

async function ensureCollection(db, name) {
  const collections = await db.listCollections({ name }).toArray()
  if (collections.length === 0) {
    await db.createCollection(name)
    console.log(`Created collection: ${name}`)
  }
}

async function seed() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    await db.command({ ping: 1 })
    console.log(`Connected to MongoDB database: ${db.databaseName}`)

    await ensureCollection(db, 'users')
    await ensureCollection(db, 'ads')

    const users = db.collection('users')
    const existingAdmin = await users.findOne({ username: adminUsername })
    if (!existingAdmin) {
      if (adminPassword === 'admin123') {
        console.warn('[seed] Using default admin password "admin123", please change NUXTSHOP_ADMIN_PASSWORD in production.')
      }
      const hashed = await bcrypt.hash(adminPassword, 10)
      const now = new Date()
      await users.insertOne({
        username: adminUsername,
        password: hashed,
        role: 'admin',
        name: 'Admin',
        createdAt: now,
        updatedAt: now
      })
      console.log(`Created admin user: ${adminUsername} / ${adminPassword}`)
    } else {
      console.log(`Admin user already exists: ${adminUsername}`)
    }

    const ads = db.collection('ads')
    const adsCount = await ads.countDocuments()
    if (adsCount === 0) {
      await ads.insertMany([...homeAds, ...wishlistAds])
      console.log('Seeded default ads')
    } else {
      console.log('Ads collection already has data, skip seeding')
    }
  } finally {
    await client.close().catch(() => {})
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
