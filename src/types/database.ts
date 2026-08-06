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
      analytics_api_keys: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          key_hash: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_api_keys_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'analytics_api_keys_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      analytics_daily_company_metrics: {
        Row: {
          active_managed_services: number
          company_id: string
          critical_tickets: number
          metric_date: string
          open_alerts: number
          payments_captured: number
          platform_commission: number
          refreshed_at: string
          tickets_closed: number
          tickets_created: number
        }
        Insert: {
          active_managed_services?: number
          company_id: string
          critical_tickets?: number
          metric_date: string
          open_alerts?: number
          payments_captured?: number
          platform_commission?: number
          refreshed_at?: string
          tickets_closed?: number
          tickets_created?: number
        }
        Update: {
          active_managed_services?: number
          company_id?: string
          critical_tickets?: number
          metric_date?: string
          open_alerts?: number
          payments_captured?: number
          platform_commission?: number
          refreshed_at?: string
          tickets_closed?: number
          tickets_created?: number
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_daily_company_metrics_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      analytics_goals: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          metric_code: string
          period_end: string
          period_start: string
          target_value: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          metric_code: string
          period_end: string
          period_start: string
          target_value: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          metric_code?: string
          period_end?: string
          period_start?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_goals_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'analytics_goals_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
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
      commissions: {
        Row: {
          commission_percent: number
          created_at: string
          gross_amount: number
          id: string
          payment_id: string
          platform_amount: number
          specialist_amount: number
          specialist_id: string
          status: string
          updated_at: string
        }
        Insert: {
          commission_percent: number
          created_at?: string
          gross_amount: number
          id?: string
          payment_id: string
          platform_amount: number
          specialist_amount: number
          specialist_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          created_at?: string
          gross_amount?: number
          id?: string
          payment_id?: string
          platform_amount?: number
          specialist_amount?: number
          specialist_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'commissions_payment_id_fkey'
            columns: ['payment_id']
            isOneToOne: true
            referencedRelation: 'payments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'commissions_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
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
      company_favorite_specialists: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          specialist_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          specialist_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          specialist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_favorite_specialists_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_favorite_specialists_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'company_favorite_specialists_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
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
      continuity_plans: {
        Row: {
          company_id: string | null
          created_at: string
          criticality: string
          id: string
          last_tested_at: string | null
          next_test_at: string | null
          process_name: string
          rpo_minutes: number
          rto_minutes: number
          status: string
          strategy: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          criticality: string
          id?: string
          last_tested_at?: string | null
          next_test_at?: string | null
          process_name: string
          rpo_minutes: number
          rto_minutes: number
          status?: string
          strategy: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          criticality?: string
          id?: string
          last_tested_at?: string | null
          next_test_at?: string | null
          process_name?: string
          rpo_minutes?: number
          rto_minutes?: number
          status?: string
          strategy?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'continuity_plans_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      continuity_restore_tests: {
        Row: {
          achieved_rpo_minutes: number | null
          achieved_rto_minutes: number | null
          created_at: string
          evidence_reference: string | null
          id: string
          plan_id: string
          result: string
          tested_at: string
          tested_by: string
        }
        Insert: {
          achieved_rpo_minutes?: number | null
          achieved_rto_minutes?: number | null
          created_at?: string
          evidence_reference?: string | null
          id?: string
          plan_id: string
          result: string
          tested_at: string
          tested_by: string
        }
        Update: {
          achieved_rpo_minutes?: number | null
          achieved_rto_minutes?: number | null
          created_at?: string
          evidence_reference?: string | null
          id?: string
          plan_id?: string
          result?: string
          tested_at?: string
          tested_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'continuity_restore_tests_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'continuity_plans'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'continuity_restore_tests_tested_by_fkey'
            columns: ['tested_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
      deployment_history: {
        Row: {
          completed_at: string | null
          created_at: string
          environment: string
          id: string
          metadata: Json
          provider_deployment_id: string | null
          release_id: string | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          environment: string
          id?: string
          metadata?: Json
          provider_deployment_id?: string | null
          release_id?: string | null
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          environment?: string
          id?: string
          metadata?: Json
          provider_deployment_id?: string | null
          release_id?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'deployment_history_release_id_fkey'
            columns: ['release_id']
            isOneToOne: false
            referencedRelation: 'platform_releases'
            referencedColumns: ['id']
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          environment: string
          expires_at: string | null
          id: string
          key: string
          rollout_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          enabled?: boolean
          environment?: string
          expires_at?: string | null
          id?: string
          key: string
          rollout_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          environment?: string
          expires_at?: string | null
          id?: string
          key?: string
          rollout_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_type: string
          created_at: string
          currency_code: string
          id: string
          owner_id: string | null
          owner_type: string
        }
        Insert: {
          account_type: string
          created_at?: string
          currency_code?: string
          id?: string
          owner_id?: string | null
          owner_type: string
        }
        Update: {
          account_type?: string
          created_at?: string
          currency_code?: string
          id?: string
          owner_id?: string | null
          owner_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'financial_accounts_currency_code_fkey'
            columns: ['currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
        ]
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
      ledger_entries: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          currency_code: string
          direction: string
          id: string
          transaction_id: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          currency_code: string
          direction: string
          id?: string
          transaction_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          currency_code?: string
          direction?: string
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ledger_entries_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'financial_accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ledger_entries_currency_code_fkey'
            columns: ['currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'ledger_entries_transaction_id_fkey'
            columns: ['transaction_id']
            isOneToOne: false
            referencedRelation: 'ledger_transactions'
            referencedColumns: ['id']
          },
        ]
      }
      ledger_transactions: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          payment_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          id?: string
          payment_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ledger_transactions_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ledger_transactions_payment_id_fkey'
            columns: ['payment_id']
            isOneToOne: true
            referencedRelation: 'payments'
            referencedColumns: ['id']
          },
        ]
      }
      managed_service_assets: {
        Row: {
          asset_type: string
          created_at: string
          external_reference: string | null
          id: string
          managed_service_id: string
          metadata: Json
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          external_reference?: string | null
          id?: string
          managed_service_id: string
          metadata?: Json
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          external_reference?: string | null
          id?: string
          managed_service_id?: string
          metadata?: Json
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'managed_service_assets_managed_service_id_fkey'
            columns: ['managed_service_id']
            isOneToOne: false
            referencedRelation: 'managed_services'
            referencedColumns: ['id']
          },
        ]
      }
      managed_service_catalog: {
        Row: {
          code: string
          created_at: string
          currency_code: string
          default_sla_hours: number
          description: string
          id: string
          is_active: boolean
          monthly_price: number
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency_code?: string
          default_sla_hours: number
          description: string
          id?: string
          is_active?: boolean
          monthly_price: number
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency_code?: string
          default_sla_hours?: number
          description?: string
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'managed_service_catalog_currency_code_fkey'
            columns: ['currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
        ]
      }
      managed_service_checklists: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          items: Json
          managed_service_id: string
          period_end: string
          period_start: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          items?: Json
          managed_service_id: string
          period_end: string
          period_start: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          items?: Json
          managed_service_id?: string
          period_end?: string
          period_start?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'managed_service_checklists_completed_by_fkey'
            columns: ['completed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'managed_service_checklists_managed_service_id_fkey'
            columns: ['managed_service_id']
            isOneToOne: false
            referencedRelation: 'managed_services'
            referencedColumns: ['id']
          },
        ]
      }
      managed_services: {
        Row: {
          auto_renew: boolean
          catalog_id: string
          company_id: string
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          monthly_amount: number
          sla_hours: number
          specialist_id: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          catalog_id: string
          company_id: string
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          monthly_amount: number
          sla_hours: number
          specialist_id?: string | null
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          catalog_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          monthly_amount?: number
          sla_hours?: number
          specialist_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'managed_services_catalog_id_fkey'
            columns: ['catalog_id']
            isOneToOne: false
            referencedRelation: 'managed_service_catalog'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'managed_services_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'managed_services_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'managed_services_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
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
      monitoring_alerts: {
        Row: {
          asset_id: string
          created_at: string
          description: string
          external_alert_id: string | null
          id: string
          metadata: Json
          occurred_at: string
          resolved_at: string | null
          severity: string
          status: string
          ticket_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          description: string
          external_alert_id?: string | null
          id?: string
          metadata?: Json
          occurred_at: string
          resolved_at?: string | null
          severity: string
          status?: string
          ticket_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          description?: string
          external_alert_id?: string | null
          id?: string
          metadata?: Json
          occurred_at?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          ticket_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'monitoring_alerts_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'monitoring_assets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'monitoring_alerts_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      monitoring_assets: {
        Row: {
          asset_type: string
          company_id: string
          created_at: string
          external_id: string | null
          id: string
          last_seen_at: string | null
          managed_service_id: string | null
          metadata: Json
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          company_id: string
          created_at?: string
          external_id?: string | null
          id?: string
          last_seen_at?: string | null
          managed_service_id?: string | null
          metadata?: Json
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          company_id?: string
          created_at?: string
          external_id?: string | null
          id?: string
          last_seen_at?: string | null
          managed_service_id?: string | null
          metadata?: Json
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'monitoring_assets_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'monitoring_assets_managed_service_id_fkey'
            columns: ['managed_service_id']
            isOneToOne: false
            referencedRelation: 'managed_services'
            referencedColumns: ['id']
          },
        ]
      }
      monitoring_metrics: {
        Row: {
          asset_id: string
          created_at: string
          id: number
          metric_name: string
          metric_value: number
          observed_at: string
          unit: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: never
          metric_name: string
          metric_value: number
          observed_at: string
          unit?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: never
          metric_name?: string
          metric_value?: number
          observed_at?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'monitoring_metrics_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'monitoring_assets'
            referencedColumns: ['id']
          },
        ]
      }
      operational_runbooks: {
        Row: {
          code: string
          created_at: string
          document_path: string
          enabled: boolean
          id: string
          last_reviewed_at: string | null
          owner_role: string
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          document_path: string
          enabled?: boolean
          id?: string
          last_reviewed_at?: string | null
          owner_role: string
          severity: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          document_path?: string
          enabled?: boolean
          id?: string
          last_reviewed_at?: string | null
          owner_role?: string
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_clients: {
        Row: {
          client_company_id: string
          created_at: string
          created_by: string
          ends_at: string | null
          partner_id: string
          starts_at: string
          status: string
        }
        Insert: {
          client_company_id: string
          created_at?: string
          created_by: string
          ends_at?: string | null
          partner_id: string
          starts_at?: string
          status?: string
        }
        Update: {
          client_company_id?: string
          created_at?: string
          created_by?: string
          ends_at?: string | null
          partner_id?: string
          starts_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partner_clients_client_company_id_fkey'
            columns: ['client_company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partner_clients_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partner_clients_partner_id_fkey'
            columns: ['partner_id']
            isOneToOne: false
            referencedRelation: 'partner_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      partner_profiles: {
        Row: {
          approved_at: string | null
          commission_percent: number
          company_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          commission_percent?: number
          company_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          commission_percent?: number
          company_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partner_profiles_company_id_fkey'
            columns: ['company_id']
            isOneToOne: true
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      partner_specialists: {
        Row: {
          added_by: string
          created_at: string
          partner_id: string
          specialist_id: string
          status: string
          updated_at: string
        }
        Insert: {
          added_by: string
          created_at?: string
          partner_id: string
          specialist_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          added_by?: string
          created_at?: string
          partner_id?: string
          specialist_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partner_specialists_added_by_fkey'
            columns: ['added_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partner_specialists_partner_id_fkey'
            columns: ['partner_id']
            isOneToOne: false
            referencedRelation: 'partner_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'partner_specialists_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          id: string
          provider: string
          request_id: string
          provider_resource_id: string | null
          event_type: string | null
          action: string | null
          signature_valid: boolean
          status: string
          error_code: string | null
          payload: Json
          received_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          provider: string
          request_id: string
          provider_resource_id?: string | null
          event_type?: string | null
          action?: string | null
          signature_valid?: boolean
          status?: string
          error_code?: string | null
          payload?: Json
          received_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          provider?: string
          request_id?: string
          provider_resource_id?: string | null
          event_type?: string | null
          action?: string | null
          signature_valid?: boolean
          status?: string
          error_code?: string | null
          payload?: Json
          received_at?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          authorized_at: string | null
          captured_at: string | null
          company_id: string
          created_at: string
          created_by: string
          currency_code: string
          id: string
          idempotency_key: string
          provider: string
          provider_reference: string | null
          status: string
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          authorized_at?: string | null
          captured_at?: string | null
          company_id: string
          created_at?: string
          created_by: string
          currency_code?: string
          id?: string
          idempotency_key: string
          provider: string
          provider_reference?: string | null
          status?: string
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          authorized_at?: string | null
          captured_at?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          id?: string
          idempotency_key?: string
          provider?: string
          provider_reference?: string | null
          status?: string
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_currency_code_fkey'
            columns: ['currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'payments_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
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
      plans: {
        Row: {
          audience: string
          code: string
          commission_percent: number
          created_at: string
          currency_code: string
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          audience: string
          code: string
          commission_percent: number
          created_at?: string
          currency_code?: string
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          audience?: string
          code?: string
          commission_percent?: number
          created_at?: string
          currency_code?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plans_currency_code_fkey'
            columns: ['currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
        ]
      }
      platform_releases: {
        Row: {
          commit_sha: string
          created_at: string
          id: string
          notes: string | null
          released_at: string | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          commit_sha: string
          created_at?: string
          id?: string
          notes?: string | null
          released_at?: string | null
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          commit_sha?: string
          created_at?: string
          id?: string
          notes?: string | null
          released_at?: string | null
          status?: string
          updated_at?: string
          version?: string
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
      privacy_processing_activities: {
        Row: {
          company_id: string | null
          created_at: string
          data_categories: string[]
          id: string
          lawful_basis: string
          name: string
          processors: string[]
          purpose: string
          retention_period: string
          status: string
          subject_categories: string[]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          data_categories: string[]
          id?: string
          lawful_basis: string
          name: string
          processors?: string[]
          purpose: string
          retention_period: string
          status?: string
          subject_categories: string[]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          data_categories?: string[]
          id?: string
          lawful_basis?: string
          name?: string
          processors?: string[]
          purpose?: string
          retention_period?: string
          status?: string
          subject_categories?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'privacy_processing_activities_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      privacy_subject_requests: {
        Row: {
          created_at: string
          decision_reason: string | null
          due_at: string
          id: string
          identity_verified_at: string | null
          request_type: string
          requester_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_reason?: string | null
          due_at: string
          id?: string
          identity_verified_at?: string | null
          request_type: string
          requester_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_reason?: string | null
          due_at?: string
          id?: string
          identity_verified_at?: string | null
          request_type?: string
          requester_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'privacy_subject_requests_requester_user_id_fkey'
            columns: ['requester_user_id']
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
      security_controls: {
        Row: {
          code: string
          control_type: string
          created_at: string
          evidence_reference: string | null
          id: string
          implementation_status: string
          last_tested_at: string | null
          next_test_at: string | null
          objective: string
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          control_type: string
          created_at?: string
          evidence_reference?: string | null
          id?: string
          implementation_status?: string
          last_tested_at?: string | null
          next_test_at?: string | null
          objective: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          control_type?: string
          created_at?: string
          evidence_reference?: string | null
          id?: string
          implementation_status?: string
          last_tested_at?: string | null
          next_test_at?: string | null
          objective?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          commander_id: string | null
          company_id: string | null
          contained_at: string | null
          created_at: string
          description: string
          detected_at: string
          id: string
          personal_data_involved: boolean
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          commander_id?: string | null
          company_id?: string | null
          contained_at?: string | null
          created_at?: string
          description: string
          detected_at: string
          id?: string
          personal_data_involved?: boolean
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          commander_id?: string | null
          company_id?: string | null
          contained_at?: string | null
          created_at?: string
          description?: string
          detected_at?: string
          id?: string
          personal_data_involved?: boolean
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'security_incidents_commander_id_fkey'
            columns: ['commander_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'security_incidents_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      security_risks: {
        Row: {
          category: string
          code: string
          company_id: string | null
          created_at: string
          description: string
          id: string
          impact: number
          inherent_score: number | null
          owner_id: string | null
          probability: number
          residual_score: number | null
          review_due_at: string | null
          status: string
          title: string
          treatment: string
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          company_id?: string | null
          created_at?: string
          description: string
          id?: string
          impact: number
          inherent_score?: number | null
          owner_id?: string | null
          probability: number
          residual_score?: number | null
          review_due_at?: string | null
          status?: string
          title: string
          treatment: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          company_id?: string | null
          created_at?: string
          description?: string
          id?: string
          impact?: number
          inherent_score?: number | null
          owner_id?: string | null
          probability?: number
          residual_score?: number | null
          review_due_at?: string | null
          status?: string
          title?: string
          treatment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'security_risks_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'security_risks_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      skills: {
        Row: {
          category: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      specialist_availability: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          modality: string
          specialist_id: string
          starts_at: string
          time_zone: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          modality: string
          specialist_id: string
          starts_at: string
          time_zone?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          modality?: string
          specialist_id?: string
          starts_at?: string
          time_zone?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_availability_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'specialist_availability_time_zone_fkey'
            columns: ['time_zone']
            isOneToOne: false
            referencedRelation: 'time_zones'
            referencedColumns: ['code']
          },
        ]
      }
      specialist_bank_accounts: {
        Row: {
          account_number_masked: string
          account_reference_encrypted: string
          account_type: string
          bank_name: string
          created_at: string
          holder_name: string
          holder_tax_id: string
          id: string
          specialist_id: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          account_number_masked: string
          account_reference_encrypted: string
          account_type: string
          bank_name: string
          created_at?: string
          holder_name: string
          holder_tax_id: string
          id?: string
          specialist_id: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          account_number_masked?: string
          account_reference_encrypted?: string
          account_type?: string
          bank_name?: string
          created_at?: string
          holder_name?: string
          holder_tax_id?: string
          id?: string
          specialist_id?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_bank_accounts_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: true
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      specialist_certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          document_path: string | null
          expires_at: string | null
          id: string
          issued_at: string | null
          issuer: string
          name: string
          rejection_reason: string | null
          specialist_id: string
          status: string
          updated_at: string
          verification_url: string | null
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          document_path?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issuer: string
          name: string
          rejection_reason?: string | null
          specialist_id: string
          status?: string
          updated_at?: string
          verification_url?: string | null
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          document_path?: string | null
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string
          name?: string
          rejection_reason?: string | null
          specialist_id?: string
          status?: string
          updated_at?: string
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_certifications_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      specialist_portfolio: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          is_public: boolean
          project_url: string | null
          specialist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          is_public?: boolean
          project_url?: string | null
          specialist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_public?: boolean
          project_url?: string | null
          specialist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_portfolio_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      specialist_payout_items: {
        Row: {
          id: string
          payout_id: string
          commission_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          payout_id: string
          commission_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          payout_id?: string
          commission_id?: string
          amount?: number
          created_at?: string
        }
        Relationships: []
      }
      specialist_payouts: {
        Row: {
          id: string
          specialist_id: string
          currency_code: string
          amount: number
          status: string
          idempotency_key: string
          bank_reference: string | null
          proof_reference: string | null
          notes: string | null
          requested_by: string
          approved_by: string | null
          paid_by: string | null
          requested_at: string
          approved_at: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          specialist_id: string
          currency_code?: string
          amount: number
          status?: string
          idempotency_key: string
          bank_reference?: string | null
          proof_reference?: string | null
          notes?: string | null
          requested_by: string
          approved_by?: string | null
          paid_by?: string | null
          requested_at?: string
          approved_at?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          specialist_id?: string
          currency_code?: string
          amount?: number
          status?: string
          idempotency_key?: string
          bank_reference?: string | null
          proof_reference?: string | null
          notes?: string | null
          requested_by?: string
          approved_by?: string | null
          paid_by?: string | null
          requested_at?: string
          approved_at?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_payouts_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      specialist_profiles: {
        Row: {
          approval_status: string
          availability_status: string
          avatar_path: string | null
          average_response_minutes: number | null
          bio: string
          completed_services: number
          created_at: string
          currency_code: string
          deleted_at: string | null
          hourly_rate: number
          id: string
          modality: string
          plan_code: string
          professional_title: string
          public_name: string
          rating_average: number
          region_id: string | null
          reviews_count: number
          sla_compliance_percent: number | null
          updated_at: string
          user_id: string
          years_experience: number
        }
        Insert: {
          approval_status?: string
          availability_status?: string
          avatar_path?: string | null
          average_response_minutes?: number | null
          bio: string
          completed_services?: number
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          hourly_rate: number
          id?: string
          modality?: string
          plan_code?: string
          professional_title: string
          public_name: string
          rating_average?: number
          region_id?: string | null
          reviews_count?: number
          sla_compliance_percent?: number | null
          updated_at?: string
          user_id: string
          years_experience?: number
        }
        Update: {
          approval_status?: string
          availability_status?: string
          avatar_path?: string | null
          average_response_minutes?: number | null
          bio?: string
          completed_services?: number
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          hourly_rate?: number
          id?: string
          modality?: string
          plan_code?: string
          professional_title?: string
          public_name?: string
          rating_average?: number
          region_id?: string | null
          reviews_count?: number
          sla_compliance_percent?: number | null
          updated_at?: string
          user_id?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_profiles_currency_code_fkey'
            columns: ['currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'specialist_profiles_region_id_fkey'
            columns: ['region_id']
            isOneToOne: false
            referencedRelation: 'regions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'specialist_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      specialist_reviews: {
        Row: {
          author_id: string
          comment: string | null
          communication_rating: number | null
          company_id: string
          created_at: string
          id: string
          is_public: boolean
          rating: number
          specialist_id: string
          technical_rating: number | null
          ticket_id: string
        }
        Insert: {
          author_id: string
          comment?: string | null
          communication_rating?: number | null
          company_id: string
          created_at?: string
          id?: string
          is_public?: boolean
          rating: number
          specialist_id: string
          technical_rating?: number | null
          ticket_id: string
        }
        Update: {
          author_id?: string
          comment?: string | null
          communication_rating?: number | null
          company_id?: string
          created_at?: string
          id?: string
          is_public?: boolean
          rating?: number
          specialist_id?: string
          technical_rating?: number | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_reviews_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'specialist_reviews_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'specialist_reviews_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'specialist_reviews_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: true
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      specialist_skills: {
        Row: {
          created_at: string
          proficiency: string
          skill_id: string
          specialist_id: string
          years_experience: number
        }
        Insert: {
          created_at?: string
          proficiency: string
          skill_id: string
          specialist_id: string
          years_experience?: number
        }
        Update: {
          created_at?: string
          proficiency?: string
          skill_id?: string
          specialist_id?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_skills_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'specialist_skills_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      specialist_tax_profiles: {
        Row: {
          billing_email: string
          created_at: string
          id: string
          legal_name: string
          specialist_id: string
          tax_id: string
          taxpayer_type: string
          updated_at: string
          validation_status: string
        }
        Insert: {
          billing_email: string
          created_at?: string
          id?: string
          legal_name: string
          specialist_id: string
          tax_id: string
          taxpayer_type: string
          updated_at?: string
          validation_status?: string
        }
        Update: {
          billing_email?: string
          created_at?: string
          id?: string
          legal_name?: string
          specialist_id?: string
          tax_id?: string
          taxpayer_type?: string
          updated_at?: string
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'specialist_tax_profiles_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: true
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_ai_analyses: {
        Row: {
          category_code: string | null
          complexity: string | null
          created_at: string
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          input_tokens: number | null
          model: string
          output_tokens: number | null
          prompt_version: string
          provider: string
          recommended_actions: Json
          requested_by: string
          risk_flags: Json
          status: string
          suggested_priority: string | null
          technical_summary: string
          ticket_id: string
        }
        Insert: {
          category_code?: string | null
          complexity?: string | null
          created_at?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          input_tokens?: number | null
          model: string
          output_tokens?: number | null
          prompt_version: string
          provider?: string
          recommended_actions?: Json
          requested_by: string
          risk_flags?: Json
          status?: string
          suggested_priority?: string | null
          technical_summary: string
          ticket_id: string
        }
        Update: {
          category_code?: string | null
          complexity?: string | null
          created_at?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          input_tokens?: number | null
          model?: string
          output_tokens?: number | null
          prompt_version?: string
          provider?: string
          recommended_actions?: Json
          requested_by?: string
          risk_flags?: Json
          status?: string
          suggested_priority?: string | null
          technical_summary?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_ai_analyses_requested_by_fkey'
            columns: ['requested_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_ai_analyses_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_application_messages: {
        Row: {
          application_id: string
          body: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          application_id: string
          body: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          application_id?: string
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_application_messages_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'ticket_applications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_application_messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_application_versions: {
        Row: {
          application_id: string
          created_at: string
          created_by: string
          id: string
          snapshot: Json
          version: number
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by: string
          id?: string
          snapshot: Json
          version: number
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string
          id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_application_versions_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'ticket_applications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_application_versions_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_applications: {
        Row: {
          amount: number
          assumptions: string | null
          available_from: string
          billing_type: string
          created_at: string
          currency_code: string
          estimated_end_at: string
          estimated_hours: number | null
          exclusions: string | null
          id: string
          modality: string
          solution_summary: string
          specialist_id: string
          status: string
          submitted_at: string | null
          ticket_id: string
          updated_at: string
          valid_until: string
          version: number
          warranty: string | null
        }
        Insert: {
          amount: number
          assumptions?: string | null
          available_from: string
          billing_type: string
          created_at?: string
          currency_code?: string
          estimated_end_at: string
          estimated_hours?: number | null
          exclusions?: string | null
          id?: string
          modality: string
          solution_summary: string
          specialist_id: string
          status?: string
          submitted_at?: string | null
          ticket_id: string
          updated_at?: string
          valid_until: string
          version?: number
          warranty?: string | null
        }
        Update: {
          amount?: number
          assumptions?: string | null
          available_from?: string
          billing_type?: string
          created_at?: string
          currency_code?: string
          estimated_end_at?: string
          estimated_hours?: number | null
          exclusions?: string | null
          id?: string
          modality?: string
          solution_summary?: string
          specialist_id?: string
          status?: string
          submitted_at?: string | null
          ticket_id?: string
          updated_at?: string
          valid_until?: string
          version?: number
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_applications_currency_code_fkey'
            columns: ['currency_code']
            isOneToOne: false
            referencedRelation: 'currencies'
            referencedColumns: ['code']
          },
          {
            foreignKeyName: 'ticket_applications_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_applications_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_assignments: {
        Row: {
          accepted_at: string | null
          application_id: string
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          rejected_at: string | null
          rejection_reason: string | null
          selected_by: string
          specialist_id: string
          started_at: string | null
          status: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          application_id: string
          completed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          selected_by: string
          specialist_id: string
          started_at?: string | null
          status?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          application_id?: string
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          selected_by?: string
          specialist_id?: string
          started_at?: string | null
          status?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_assignments_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'ticket_applications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_assignments_selected_by_fkey'
            columns: ['selected_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_assignments_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_assignments_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
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
      ticket_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          message: string | null
          responded_at: string | null
          specialist_id: string
          status: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          message?: string | null
          responded_at?: string | null
          specialist_id: string
          status?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          message?: string | null
          responded_at?: string | null
          specialist_id?: string
          status?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_invitations_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_invitations_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_invitations_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_match_results: {
        Row: {
          availability_score: number
          created_at: string
          explanation: Json
          id: string
          price_score: number
          rank: number
          reputation_score: number
          run_id: string
          skill_score: number
          specialist_id: string
          ticket_id: string
          total_score: number
        }
        Insert: {
          availability_score: number
          created_at?: string
          explanation?: Json
          id?: string
          price_score: number
          rank: number
          reputation_score: number
          run_id: string
          skill_score: number
          specialist_id: string
          ticket_id: string
          total_score: number
        }
        Update: {
          availability_score?: number
          created_at?: string
          explanation?: Json
          id?: string
          price_score?: number
          rank?: number
          reputation_score?: number
          run_id?: string
          skill_score?: number
          specialist_id?: string
          ticket_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_match_results_run_id_fkey'
            columns: ['run_id']
            isOneToOne: false
            referencedRelation: 'ticket_match_runs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_match_results_specialist_id_fkey'
            columns: ['specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_match_results_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_match_runs: {
        Row: {
          algorithm_version: string
          candidate_count: number
          created_at: string
          id: string
          requested_by: string
          status: string
          ticket_id: string
        }
        Insert: {
          algorithm_version: string
          candidate_count?: number
          created_at?: string
          id?: string
          requested_by: string
          status?: string
          ticket_id: string
        }
        Update: {
          algorithm_version?: string
          candidate_count?: number
          created_at?: string
          id?: string
          requested_by?: string
          status?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_match_runs_requested_by_fkey'
            columns: ['requested_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_match_runs_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_messages: {
        Row: {
          body: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: string
          metadata: Json
          reply_to_id: string | null
          sender_id: string
          ticket_id: string
          visibility: string
        }
        Insert: {
          body: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json
          reply_to_id?: string | null
          sender_id: string
          ticket_id: string
          visibility?: string
        }
        Update: {
          body?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json
          reply_to_id?: string | null
          sender_id?: string
          ticket_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_messages_reply_to_id_fkey'
            columns: ['reply_to_id']
            isOneToOne: false
            referencedRelation: 'ticket_messages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_messages_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'tickets'
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
          applications_close_at: string | null
          assigned_specialist_id: string | null
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
          resolution_summary: string | null
          resolved_at: string | null
          response_due_at: string
          status: string
          title: string
          updated_at: string
          work_started_at: string | null
        }
        Insert: {
          applications_close_at?: string | null
          assigned_specialist_id?: string | null
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
          resolution_summary?: string | null
          resolved_at?: string | null
          response_due_at?: string
          status?: string
          title: string
          updated_at?: string
          work_started_at?: string | null
        }
        Update: {
          applications_close_at?: string | null
          assigned_specialist_id?: string | null
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
          resolution_summary?: string | null
          resolved_at?: string | null
          response_due_at?: string
          status?: string
          title?: string
          updated_at?: string
          work_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tickets_assigned_specialist_id_fkey'
            columns: ['assigned_specialist_id']
            isOneToOne: false
            referencedRelation: 'specialist_profiles'
            referencedColumns: ['id']
          },
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
      approve_specialist_payout: {
        Args: { p_payout_id: string }
        Returns: undefined
      }
      create_company_with_owner: {
        Args: { legal_name: string; tax_id?: string; trade_name?: string }
        Returns: string
      }
      create_manual_ticket_payment: {
        Args: {
          p_amount: number
          p_commission_percent?: number
          p_idempotency_key: string
          p_ticket_id: string
        }
        Returns: string
      }
      initialize_mercadopago_ticket_payment: {
        Args: { p_ticket_id: string }
        Returns: { payment_id: string; amount: number; currency_code: string }[]
      }
      finalize_mercadopago_ticket_payment: {
        Args: {
          p_amount: number
          p_payment_id: string
          p_provider_reference: string
          p_provider_status: string
        }
        Returns: undefined
      }
      record_specialist_payout_transfer: {
        Args: {
          p_bank_reference: string
          p_payout_id: string
          p_proof_reference?: string
        }
        Returns: undefined
      }
      request_specialist_payout: {
        Args: { p_idempotency_key: string }
        Returns: string
      }
      create_ticket_from_critical_alert: {
        Args: { p_alert_id: string }
        Returns: string
      }
      generate_ticket_matches: {
        Args: { p_ticket_id: string }
        Returns: string
      }
      normalize_domain: { Args: { value: string }; Returns: string }
      normalize_email: { Args: { value: string }; Returns: string }
      normalize_tax_id: { Args: { value: string }; Returns: string }
      refresh_company_daily_metrics: {
        Args: { p_company_id: string; p_date?: string }
        Returns: undefined
      }
      respond_ticket_assignment: {
        Args: { p_accept: boolean; p_assignment_id: string; p_reason?: string }
        Returns: undefined
      }
      resolve_ticket_work: {
        Args: { p_resolution_summary: string; p_ticket_id: string }
        Returns: undefined
      }
      close_resolved_ticket: {
        Args: { p_ticket_id: string }
        Returns: undefined
      }
      submit_ticket_review: {
        Args: {
          p_comment?: string
          p_communication_rating: number
          p_is_public?: boolean
          p_rating: number
          p_technical_rating: number
          p_ticket_id: string
        }
        Returns: string
      }
      select_ticket_candidate: {
        Args: { p_application_id: string; p_ticket_id: string }
        Returns: string
      }
      start_ticket_work: {
        Args: { p_assignment_id: string }
        Returns: undefined
      }
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
