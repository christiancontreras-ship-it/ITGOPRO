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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          skills?: string[];
          certifications?: string | null;
          experience_years?: number;
          hourly_rate?: number;
          availability_status?: string;
          rating?: number;
          total_jobs?: number;
          completed_jobs?: number;
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
          priority: 'low' | 'medium' | 'high' | 'critical';
          status: 'new' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          estimated_hours: number | null;
          actual_hours: number | null;
          budget: number | null;
          rating: number | null;
          feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          specialist_id?: string | null;
          title: string;
          description: string;
          category: string;
          priority?: string;
          status?: string;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          budget?: number | null;
          rating?: number | null;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          specialist_id?: string | null;
          title?: string;
          description?: string;
          category?: string;
          priority?: string;
          status?: string;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          budget?: number | null;
          rating?: number | null;
          feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          related_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          related_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string;
          related_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
  };
};