export type Category = {
  id: string
  name: string
  slug: string
  emoji: string | null
  created_at: string
}

export type Service = {
  id: string
  category_id: string
  name: string
  description: string | null
  address: string | null
  city: string
  price_info: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  photos: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  categories?: Category
}

export type ServiceWithStats = Service & {
  avg_rating: number
  total_ratings: number
  total_likes: number
  user_liked: boolean
  user_rating: number | null
}

export type ServiceLike = {
  id: string
  user_id: string
  service_id: string
  created_at: string
}

export type ServiceRating = {
  id: string
  user_id: string
  service_id: string
  stars: number
  created_at: string
  updated_at: string
}

export type ServiceComment = {
  id: string
  user_id: string
  service_id: string
  content: string
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  role: 'admin' | 'client' | 'user'
}

export type ClientRequestStatus = 'pending' | 'approved' | 'rejected'

export type ClientRequest = {
  id: string
  user_id: string
  status: ClientRequestStatus
  message: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}
