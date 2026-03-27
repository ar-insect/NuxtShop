export interface AdminAdDocument {
  id: number
  position: string
  order: number
  active?: boolean
  image: string
  link: string
  altKey: string
}

export interface AdItem {
  id: number
  image: string
  link: string
  altKey: string
}
