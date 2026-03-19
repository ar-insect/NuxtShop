import type { ObjectId } from 'mongodb'
import { getCollection } from '~/server/utils/mongodb'
import type { AdItem, AdsResponse } from '~/types/api'

interface AdDocument {
  _id?: ObjectId
  id: number
  position: string
  order: number
  active?: boolean
  image: string
  link: string
  altKey: string
}

const COLLECTION_NAME = 'ads'

const toClient = (doc: AdDocument): AdItem => {
  const { _id, ...rest } = doc
  return rest
}

export default defineEventHandler(async (event): Promise<AdsResponse> => {
  const query = getQuery(event)
  const position = String(query.position || 'home')

  const collection = getCollection<AdDocument>(COLLECTION_NAME)

  const docs = await collection
    .find({ position, active: { $ne: false } })
    .sort({ order: 1, _id: 1 })
    .toArray() as AdDocument[]

  if (docs.length > 0) {
    return { items: docs.map(toClient) }
  }

  const defaults: AdDocument[] = []

  if (position === 'home') {
    defaults.push(
      {
        id: 1,
        position,
        image: 'https://images.unsplash.com/photo-1523275335684-bd4202213ad2?auto=format&fit=crop&w=1200&q=80',
        link: '/products?category=electronics',
        altKey: 'pages.home.adElectronics',
        order: 1,
        active: true
      },
      {
        id: 2,
        position,
        image: 'https://images.unsplash.com/photo-1561053720-76ae374061ea?auto=format&fit=crop&w=1200&q=80',
        link: '/products?category=jewelery',
        altKey: 'pages.home.adJewelery',
        order: 2,
        active: true
      },
      {
        id: 3,
        position,
        image: 'https://images.unsplash.com/photo-1523381294911-8d3cead290f2?auto=format&fit=crop&w=1200&q=80',
        link: '/products?category=men%27s%20clothing',
        altKey: 'pages.home.adMen',
        order: 3,
        active: true
      }
    )
  } else if (position === 'wishlist') {
    defaults.push(
      {
        id: 1,
        position,
        image: 'https://images.unsplash.com/photo-1523275335684-bd4202213ad2?auto=format&fit=crop&w=1200&q=80',
        link: '/products?category=electronics',
        altKey: 'pages.wishlist.adAltElectronics',
        order: 1,
        active: true
      },
      {
        id: 2,
        position,
        image: 'https://images.unsplash.com/photo-1561053720-76ae374061ea?auto=format&fit=crop&w=1200&q=80',
        link: '/products?category=jewelery',
        altKey: 'pages.wishlist.adAltJewelery',
        order: 2,
        active: true
      }
    )
  }

  if (defaults.length > 0) {
    await collection.insertMany(defaults)
    return { items: defaults.map(toClient) }
  }

  return { items: [] }
})
