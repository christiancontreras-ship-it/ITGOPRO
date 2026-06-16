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