export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string | null
          actor_membership_id: string | null
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          company_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          ip_address_masked: unknown
          metadata: Json
          outcome: string | null
          request_id: string | null
          source: string | null
          user_agent_summary: string | null
        }
        Insert: {
          action?: string | null
          actor_membership_id?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          ip_address_masked?: unknown
          metadata?: Json
          outcome?: string | null
          request_id?: string | null
          source?: string | null
          user_agent_summary?: string | null
        }
        Update: {
          action?: string | null
          actor_membership_id?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          ip_address_masked?: unknown
          metadata?: Json
          outcome?: string | null
          request_id?: string | null
          source?: string | null
          user_agent_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_events_actor_membership_id_fkey'
            columns: ['actor_membership_id']
            isOneToOne: false
            referencedRelation: 'company_memberships'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_events_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      communes: {
        Row: {
          code: string | null
          id: string
          name: string
          region_id: string
        }
        Insert: {
          code?: string | null
          id?: string
          name: string
          region_id: string
        }
        Update: {
          code?: string | null
          id?: string
          name?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'communes_region_id_fkey'
            columns: ['region_id']
            isOneToOne: false
            referencedRelation: 'regions'
            referencedColumns: ['id']
          },
        ]
      }
      companies: {
        Row: {
          company_size_id: string | null
          country_code: string
          created_at: string
          created_by: string | null
          default_currency_code: string
          default_language_code: string
          default_time_zone: string
          deleted_at: string | null
          email: string | null
          id: string
          industry_id: string | null
          legal_name: string
          logo_path: string | null
          metadata: Json
          onboarding_status: string
          phone: string | null
          status: string
          tax_id: string | null
          tax_id_normalized: string | null
          trade_name: string | null
          updated_at: string
          verification_status: string
          website_url: string | null
        }
        Insert: {
          company_size_id?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          default_currency_code?: string
          default_language_code?: string
          default_time_zone?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry_id?: string | null
          legal_name: string
          logo_path?: string | null
          metadata?: Json
          onboarding_status?: string
          phone?: string | null
          status?: string
          tax_id?: string | null
          tax_id_normalized?: string | null
          trade_name?: string | null
          updated_at?: string
          verification_status?: string
          website_url?: string | null
        }
        Update: {
          company_size_id?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          default_currency_code?: string
          default_language_code?: string
          default_time_zone?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry_id?: string | null
          legal_name?: string
          logo_path?: string | null
          metadata?: Json
          onboarding_status?: string
          phone?: string | null
          status?: string
          tax_id?: string | null
          tax_id_normalized?: string | null
          trade_name?: string | null
          updated_at?: string
          verification_status?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'companies_company_size_id_fkey'
            columns: ['company_size_id']
            isOneToOne: false
            referencedRelation: 'company_sizes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'companies_country_code_fkey'
            columns: ['country_code']
            isOneToOne: false
            referencedRelation: 'countries'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'companies_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'companies_default_currency_code_fkey'
            columns: ['default_currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'companies_default_language_code_fkey'
            columns: ['default_language_code']
            isOneToOne: false
            referencedRelation: 'languages'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'companies_default_time_zone_fkey'
            columns: ['default_time_zone']
            isOneToOne: false
            referencedRelation: 'time_zones'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'companies_industry_id_fkey'
            columns: ['industry_id']
            isOneToOne: false
            referencedRelation: 'industries'
            referencedColumns: ['id']
          },
        ]
      }
      company_addresses: {
        Row: {
          address_type: string
          city: string | null
          commune_id: string | null
          company_id: string
          country_code: string
          created_at: string
          deleted_at: string | null
          id: string
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          postal_code: string | null
          region_id: string | null
          street_line_1: string
          street_line_2: string | null
          updated_at: string
        }
        Insert: {
          address_type: string
          city?: string | null
          commune_id?: string | null
          company_id: string
          country_code: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          region_id?: string | null
          street_line_1: string
          street_line_2?: string | null
          updated_at?: string
        }
        Update: {
          address_type?: string
          city?: string | null
          commune_id?: string | null
          company_id?: string
          country_code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          postal_code?: string | null
          region_id?: string | null
          street_line_1?: string
          street_line_2?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_addresses_commune_id_fkey'
            columns: ['commune_id']
            isOneToOne: false
            referencedRelation: 'communes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_addresses_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_addresses_country_code_fkey'
            columns: ['country_code']
            isOneToOne: false
            referencedRelation: 'countries'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'company_addresses_region_id_fkey'
            columns: ['region_id']
            isOneToOne: false
            referencedRelation: 'regions'
            referencedColumns: ['id']
          },
        ]
      }
      company_contacts: {
        Row: {
          company_id: string
          contact_type: string
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          is_primary: boolean
          metadata: Json
          name: string
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          contact_type: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          name: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          contact_type?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          name?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_contacts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      company_domains: {
        Row: {
          company_id: string
          created_at: string
          deleted_at: string | null
          domain: string
          domain_normalized: string
          id: string
          updated_at: string
          verification_status: string
          verification_token_hash: string | null
          verified_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          deleted_at?: string | null
          domain: string
          domain_normalized: string
          id?: string
          updated_at?: string
          verification_status?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          domain?: string
          domain_normalized?: string
          id?: string
          updated_at?: string
          verification_status?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'company_domains_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      company_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          company_id: string
          created_at: string
          email: string
          email_normalized: string
          expires_at: string
          id: string
          intended_role_id: string | null
          invited_by: string
          metadata: Json
          revoked_at: string | null
          status: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id: string
          created_at?: string
          email: string
          email_normalized: string
          expires_at: string
          id?: string
          intended_role_id?: string | null
          invited_by: string
          metadata?: Json
          revoked_at?: string | null
          status?: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id?: string
          created_at?: string
          email?: string
          email_normalized?: string
          expires_at?: string
          id?: string
          intended_role_id?: string | null
          invited_by?: string
          metadata?: Json
          revoked_at?: string | null
          status?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_invitations_accepted_by_fkey'
            columns: ['accepted_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_invitations_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_invitations_intended_role_id_fkey'
            columns: ['intended_role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_invitations_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      company_memberships: {
        Row: {
          company_id: string
          created_at: string
          deleted_at: string | null
          department: string | null
          id: string
          invited_by: string | null
          is_primary: boolean
          job_title: string | null
          joined_at: string | null
          status: string
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          id?: string
          invited_by?: string | null
          is_primary?: boolean
          job_title?: string | null
          joined_at?: string | null
          status?: string
          suspended_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          id?: string
          invited_by?: string | null
          is_primary?: boolean
          job_title?: string | null
          joined_at?: string | null
          status?: string
          suspended_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_memberships_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_memberships_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_memberships_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      company_settings: {
        Row: {
          company_id: string
          created_at: string
          date_format: string
          default_currency_code: string
          default_language_code: string
          default_time_zone: string
          feature_preferences: Json
          first_day_of_week: number
          id: string
          metadata: Json
          notification_preferences: Json
          time_format: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date_format?: string
          default_currency_code?: string
          default_language_code?: string
          default_time_zone?: string
          feature_preferences?: Json
          first_day_of_week?: number
          id?: string
          metadata?: Json
          notification_preferences?: Json
          time_format?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date_format?: string
          default_currency_code?: string
          default_language_code?: string
          default_time_zone?: string
          feature_preferences?: Json
          first_day_of_week?: number
          id?: string
          metadata?: Json
          notification_preferences?: Json
          time_format?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_settings_company_id_fkey'
            columns: ['company_id']
            isOneToOne: true
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_settings_default_currency_code_fkey'
            columns: ['default_currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'company_settings_default_language_code_fkey'
            columns: ['default_language_code']
            isOneToOne: false
            referencedRelation: 'languages'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'company_settings_default_time_zone_fkey'
            columns: ['default_time_zone']
            isOneToOne: false
            referencedRelation: 'time_zones'
            referencedColumns: ['code']
          },
        ]
      }
      company_sizes: {
        Row: {
          code: string
          id: string
          is_active: boolean
          max_employees: number | null
          min_employees: number | null
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          max_employees?: number | null
          min_employees?: number | null
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          max_employees?: number | null
          min_employees?: number | null
          name?: string
        }
        Relationships: []
      }
      company_type_assignments: {
        Row: {
          company_id: string
          company_type_id: string
          created_at: string
        }
        Insert: {
          company_id: string
          company_type_id: string
          created_at?: string
        }
        Update: {
          company_id?: string
          company_type_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_type_assignments_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_type_assignments_company_type_id_fkey'
            columns: ['company_type_id']
            isOneToOne: false
            referencedRelation: 'company_types'
            referencedColumns: ['id']
          },
        ]
      }
      company_types: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          is_active: boolean
          name: string
          symbol: string
        }
        Insert: {
          code: string
          is_active?: boolean
          name: string
          symbol: string
        }
        Update: {
          code?: string
          is_active?: boolean
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          code: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      membership_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          membership_id: string
          revoked_at: string | null
          role_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          membership_id: string
          revoked_at?: string | null
          role_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          membership_id?: string
          revoked_at?: string | null
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'membership_roles_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'membership_roles_membership_id_fkey'
            columns: ['membership_id']
            isOneToOne: false
            referencedRelation: 'company_memberships'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'membership_roles_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          resource: string
          updated_at: string
        }
        Insert: {
          action: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          resource: string
          updated_at?: string
        }
        Update: {
          action?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          resource?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      platform_user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          revoked_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'platform_user_roles_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'platform_user_roles_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'platform_user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_active_at: string | null
          last_name: string | null
          locale: string
          metadata: Json
          onboarding_status: string
          phone: string | null
          profile_status: string
          time_zone: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id: string
          last_active_at?: string | null
          last_name?: string | null
          locale?: string
          metadata?: Json
          onboarding_status?: string
          phone?: string | null
          profile_status?: string
          time_zone?: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_active_at?: string | null
          last_name?: string | null
          locale?: string
          metadata?: Json
          onboarding_status?: string
          phone?: string | null
          profile_status?: string
          time_zone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_locale_fkey'
            columns: ['locale']
            isOneToOne: false
            referencedRelation: 'languages'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'profiles_time_zone_fkey'
            columns: ['time_zone']
            isOneToOne: false
            referencedRelation: 'time_zones'
            referencedColumns: ['code']
          },
        ]
      }
      regions: {
        Row: {
          code: string
          country_code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          country_code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          country_code?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'regions_country_code_fkey'
            columns: ['country_code']
            isOneToOne: false
            referencedRelation: 'countries'
            referencedColumns: ['code']
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'role_permissions_permission_id_fkey'
            columns: ['permission_id']
            isOneToOne: false
            referencedRelation: 'permissions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'role_permissions_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          scope_type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          scope_type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          scope_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          ticket_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          ticket_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          ticket_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_comments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_comments_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_files: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          mime_type: string
          original_name: string
          size_bytes: number
          status: string
          storage_path: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          mime_type: string
          original_name: string
          size_bytes: number
          status?: string
          storage_path: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          mime_type?: string
          original_name?: string
          size_bytes?: number
          status?: string
          storage_path?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_files_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_files_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          metadata: Json
          reason: string | null
          ticket_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          ticket_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          ticket_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_status_history_changed_by_fkey'
            columns: ['changed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_status_history_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      tickets: {
        Row: {
          category_id: string
          closed_at: string | null
          code: string
          company_id: string
          created_at: string
          deleted_at: string | null
          description: string
          estimated_cost: number | null
          final_cost: number | null
          first_responded_at: string | null
          id: string
          modality: string
          priority: string
          published_at: string | null
          region_id: string | null
          requester_id: string
          resolution_due_at: string
          resolved_at: string | null
          response_due_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          closed_at?: string | null
          code: string
          company_id: string
          created_at?: string
          deleted_at?: string | null
          description: string
          estimated_cost?: number | null
          final_cost?: number | null
          first_responded_at?: string | null
          id?: string
          modality: string
          priority: string
          published_at?: string | null
          region_id?: string | null
          requester_id: string
          resolution_due_at?: string
          resolved_at?: string | null
          response_due_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          closed_at?: string | null
          code?: string
          company_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          estimated_cost?: number | null
          final_cost?: number | null
          first_responded_at?: string | null
          id?: string
          modality?: string
          priority?: string
          published_at?: string | null
          region_id?: string | null
          requester_id?: string
          resolution_due_at?: string
          resolved_at?: string | null
          response_due_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tickets_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'ticket_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tickets_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tickets_region_id_fkey'
            columns: ['region_id']
            isOneToOne: false
            referencedRelation: 'regions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tickets_requester_id_fkey'
            columns: ['requester_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      time_zones: {
        Row: {
          code: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          accessibility_preferences: Json
          created_at: string
          date_format: string
          locale: string
          notification_preferences: Json
          theme: string
          time_format: string
          time_zone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_preferences?: Json
          created_at?: string
          date_format?: string
          locale?: string
          notification_preferences?: Json
          theme?: string
          time_format?: string
          time_zone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_preferences?: Json
          created_at?: string
          date_format?: string
          locale?: string
          notification_preferences?: Json
          theme?: string
          time_format?: string
          time_zone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_preferences_locale_fkey'
            columns: ['locale']
            isOneToOne: false
            referencedRelation: 'languages'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'user_preferences_time_zone_fkey'
            columns: ['time_zone']
            isOneToOne: false
            referencedRelation: 'time_zones'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'user_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_company_with_owner: {
        Args: { legal_name: string; tax_id?: string; trade_name?: string }
        Returns: string
      }
      normalize_domain: { Args: { value: string }; Returns: string }
      normalize_email: { Args: { value: string }; Returns: string }
      normalize_tax_id: { Args: { value: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
