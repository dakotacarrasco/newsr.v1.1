export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          default_city: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          default_city?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          default_city?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      digest_subscriptions: {
        Row: {
          id: string
          user_id: string
          city_code: string
          frequency: 'daily' | 'weekly'
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          city_code: string
          frequency: 'daily' | 'weekly'
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          city_code?: string
          frequency?: 'daily' | 'weekly'
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      city_digests: {
        Row: {
          id: string
          city_code: string
          title: string
          content: string
          status: 'draft' | 'active' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_code: string
          title: string
          content: string
          status?: 'draft' | 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_code?: string
          title?: string
          content?: string
          status?: 'draft' | 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      digest_delivery_logs: {
        Row: {
          id: string
          city_code: string
          digest_id: string
          campaign_id: string
          user_id?: string
          email?: string
          frequency: 'daily' | 'weekly'
          status: 'sent' | 'test_sent' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          city_code: string
          digest_id: string
          campaign_id: string
          user_id?: string
          email?: string
          frequency: 'daily' | 'weekly'
          status?: 'sent' | 'test_sent' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          city_code?: string
          digest_id?: string
          campaign_id?: string
          user_id?: string
          email?: string
          frequency?: 'daily' | 'weekly'
          status?: 'sent' | 'test_sent' | 'failed'
          created_at?: string
        }
      }
    }
  }
} 