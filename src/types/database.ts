export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'client' | 'specialist' | 'partner';
          password_hash: string;
          phone: string | null;
          bio: string | null;
          avatar_url: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          timezone: string | null;
          language: string;
          is_verified: boolean;
          is_active: boolean;
          mfa_enabled: boolean;
          mfa_secret: string | null;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role?: string;
          password_hash: string;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          timezone?: string | null;
          language?: string;
          is_verified?: boolean;
          is_active?: boolean;
          mfa_enabled?: boolean;
          mfa_secret?: string | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          password_hash?: string;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          timezone?: string | null;
          language?: string;
          is_verified?: boolean;
          is_active?: boolean;
          mfa_enabled?: boolean;
          mfa_secret?: string | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      specialists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          skills: string[];
          certifications: string | null;
          experience_years: number;
          hourly_rate: number;
          availability_status: 'available' | 'busy' | 'offline';
          rating: number;
          total_jobs: number;
          completed_jobs: number;
          response_time_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          skills: string[];
          certifications?: string | null;
          experience_years: number;
          hourly_rate: number;
          availability_status?: string;
          rating?: number;
          total_jobs?: number;
          completed_jobs?: number;
          response_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          skills?: string[];
          certifications?: string | null;
          experience_years?: number;
          hourly_rate?: number;
          availability_status?: string;
          rating?: number;
          total_jobs?: number;
          completed_jobs?: number;
          response_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          client_id: string;
          specialist_id: string | null;
          title: string;
          description: string;
          category: string;
          subcategory: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
          budget: number | null;
          estimated_hours: number | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          specialist_id?: string | null;
          title: string;
          description: string;
          category: string;
          subcategory?: string | null;
          priority?: string;
          status?: string;
          budget?: number | null;
          estimated_hours?: number | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          specialist_id?: string | null;
          title?: string;
          description?: string;
          category?: string;
          subcategory?: string | null;
          priority?: string;
          status?: string;
          budget?: number | null;
          estimated_hours?: number | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      bids: {
        Row: {
          id: string;
          ticket_id: string;
          specialist_id: string;
          proposed_price: number;
          proposed_timeline: number;
          cover_letter: string;
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          specialist_id: string;
          proposed_price: number;
          proposed_timeline: number;
          cover_letter: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          specialist_id?: string;
          proposed_price?: number;
          proposed_timeline?: number;
          cover_letter?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          ticket_id: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method: string;
          transaction_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          status?: string;
          payment_method: string;
          transaction_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          from_user_id?: string;
          to_user_id?: string;
          amount?: number;
          status?: string;
          payment_method?: string;
          transaction_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          ticket_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          ticket_id: string | null;
          participant_ids: string[];
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id?: string | null;
          participant_ids: string[];
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string | null;
          participant_ids?: string[];
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          attachments: string[] | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          attachments?: string[] | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          attachments?: string[] | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          related_id: string | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          related_id?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          related_id?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          ticket_id: string;
          initiated_by: string;
          reason: string;
          description: string;
          status: 'open' | 'resolved' | 'escalated' | 'closed';
          resolution: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          initiated_by: string;
          reason: string;
          description: string;
          status?: string;
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          initiated_by?: string;
          reason?: string;
          description?: string;
          status?: string;
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      [key: string]: any;
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};