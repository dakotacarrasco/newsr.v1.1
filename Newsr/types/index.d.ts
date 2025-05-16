export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  publishedAt: Date
  category: string
  author: Author
  topics: Topic[]
  location?: Location
}

export interface Author {
  id: string
  name: string
  avatar: string
  bio: string
}

export interface Topic {
  id: string
  name: string
  slug: string
  description: string
}

export interface Location {
  id: string
  name: string
  country: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: {
    topics: string[]
    locations: string[]
    darkMode: boolean
  }
} 