export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notification_preferences: {
        Row: {
          admin_id: string | null
          created_at: string | null
          failed_verifications: boolean | null
          id: string
          new_user_registrations: boolean | null
          platform_errors: boolean | null
          reported_content: boolean | null
          scheme_updates: boolean | null
          security_events: boolean | null
          server_health: boolean | null
          system_announcements: boolean | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          failed_verifications?: boolean | null
          id?: string
          new_user_registrations?: boolean | null
          platform_errors?: boolean | null
          reported_content?: boolean | null
          scheme_updates?: boolean | null
          security_events?: boolean | null
          server_health?: boolean | null
          system_announcements?: boolean | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          failed_verifications?: boolean | null
          id?: string
          new_user_registrations?: boolean | null
          platform_errors?: boolean | null
          reported_content?: boolean | null
          scheme_updates?: boolean | null
          security_events?: boolean | null
          server_health?: boolean | null
          system_announcements?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notification_preferences_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_preferences: {
        Row: {
          admin_id: string | null
          created_at: string | null
          dashboard_layout: string | null
          default_landing_page: string | null
          id: string
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          dashboard_layout?: string | null
          default_landing_page?: string | null
          id?: string
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          dashboard_layout?: string | null
          default_landing_page?: string | null
          id?: string
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_preferences_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          designation: string
          employee_id: string | null
          full_name: string
          id: string
          mobile_number: string
          official_email: string
          profile_photo_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          designation: string
          employee_id?: string | null
          full_name: string
          id?: string
          mobile_number: string
          official_email: string
          profile_photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          designation?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          mobile_number?: string
          official_email?: string
          profile_photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_security: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          mfa_method: string | null
          recovery_email: string | null
          recovery_mobile: string | null
          remember_browser: boolean | null
          session_timeout_minutes: number | null
          trusted_devices: Json | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          mfa_method?: string | null
          recovery_email?: string | null
          recovery_mobile?: string | null
          remember_browser?: boolean | null
          session_timeout_minutes?: number | null
          trusted_devices?: Json | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          mfa_method?: string | null
          recovery_email?: string | null
          recovery_mobile?: string | null
          remember_browser?: boolean | null
          session_timeout_minutes?: number | null
          trusted_devices?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_security_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_reports: {
        Row: {
          created_at: string | null
          id: string
          report_type: string | null
          result: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_type?: string | null
          result?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          report_type?: string | null
          result?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          id: string
          metric: string | null
          recorded_at: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          id?: string
          metric?: string | null
          recorded_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          id?: string
          metric?: string | null
          recorded_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource: string | null
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_history: {
        Row: {
          checksum: string | null
          completed_at: string | null
          file_size_bytes: number | null
          id: string
          job_id: string | null
          started_at: string | null
          status: string | null
          storage_path: string | null
        }
        Insert: {
          checksum?: string | null
          completed_at?: string | null
          file_size_bytes?: number | null
          id?: string
          job_id?: string | null
          started_at?: string | null
          status?: string | null
          storage_path?: string | null
        }
        Update: {
          checksum?: string | null
          completed_at?: string | null
          file_size_bytes?: number | null
          id?: string
          job_id?: string | null
          started_at?: string | null
          status?: string | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "backup_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_jobs: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          job_name: string | null
          last_run_at: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          job_name?: string | null
          last_run_at?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          job_name?: string | null
          last_run_at?: string | null
          type?: string | null
        }
        Relationships: []
      }
      buyer_documents: {
        Row: {
          buyer_id: string | null
          doc_type: string
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          doc_type: string
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          doc_type?: string
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_documents_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_payment_settings: {
        Row: {
          account_holder: string | null
          account_number: string | null
          bank_name: string | null
          billing_address: string | null
          buyer_id: string | null
          created_at: string | null
          delivery_address: string | null
          id: string
          ifsc_code: string | null
          payment_methods: Json | null
          payment_terms: string | null
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          billing_address?: string | null
          buyer_id?: string | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          ifsc_code?: string | null
          payment_methods?: Json | null
          payment_terms?: string | null
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          billing_address?: string | null
          buyer_id?: string | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          ifsc_code?: string | null
          payment_methods?: Json | null
          payment_terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_payment_settings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_preferences: {
        Row: {
          annual_capacity: number | null
          buyer_id: string | null
          categories: Json | null
          created_at: string | null
          daily_capacity: number | null
          id: string
          monthly_capacity: number | null
          radius_km: number | null
          schedule: string | null
        }
        Insert: {
          annual_capacity?: number | null
          buyer_id?: string | null
          categories?: Json | null
          created_at?: string | null
          daily_capacity?: number | null
          id?: string
          monthly_capacity?: number | null
          radius_km?: number | null
          schedule?: string | null
        }
        Update: {
          annual_capacity?: number | null
          buyer_id?: string | null
          categories?: Json | null
          created_at?: string | null
          daily_capacity?: number | null
          id?: string
          monthly_capacity?: number | null
          radius_km?: number | null
          schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_preferences_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          business_name: string
          business_type: string
          contact_person: string
          created_at: string | null
          email: string
          gst_number: string | null
          id: string
          mobile: string
          owner_name: string
          pan_number: string | null
          registration_number: string | null
          trade_license: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          business_name: string
          business_type: string
          contact_person: string
          created_at?: string | null
          email: string
          gst_number?: string | null
          id?: string
          mobile: string
          owner_name: string
          pan_number?: string | null
          registration_number?: string | null
          trade_license?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          business_name?: string
          business_type?: string
          contact_person?: string
          created_at?: string | null
          email?: string
          gst_number?: string | null
          id?: string
          mobile?: string
          owner_name?: string
          pan_number?: string | null
          registration_number?: string | null
          trade_license?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          gst_number: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          room_id: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message: string | null
          last_message_at: string | null
          participant_one: string | null
          participant_two: string | null
          participants: string[]
          related_order: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          participant_one?: string | null
          participant_two?: string | null
          participants?: string[]
          related_order?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          participant_one?: string | null
          participant_two?: string | null
          participants?: string[]
          related_order?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_last_message_fkey"
            columns: ["last_message"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_participant_one_fkey"
            columns: ["participant_one"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_participant_two_fkey"
            columns: ["participant_two"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_related_order_fkey"
            columns: ["related_order"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          buyer_id: string | null
          contract_file: string | null
          created_at: string | null
          delivery_address: Json | null
          delivery_date: string | null
          farmer_id: string | null
          id: string
          industry_id: string | null
          listing_id: string | null
          offer_id: string | null
          payment_terms: string | null
          price_per_unit: number | null
          quality_terms: string | null
          quantity: number | null
          signatures: Json | null
          status: string | null
          terms: string | null
          title: string | null
          total_amount: number | null
          transporter_id: string | null
          unit: string | null
        }
        Insert: {
          buyer_id?: string | null
          contract_file?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          farmer_id?: string | null
          id?: string
          industry_id?: string | null
          listing_id?: string | null
          offer_id?: string | null
          payment_terms?: string | null
          price_per_unit?: number | null
          quality_terms?: string | null
          quantity?: number | null
          signatures?: Json | null
          status?: string | null
          terms?: string | null
          title?: string | null
          total_amount?: number | null
          transporter_id?: string | null
          unit?: string | null
        }
        Update: {
          buyer_id?: string | null
          contract_file?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          farmer_id?: string | null
          id?: string
          industry_id?: string | null
          listing_id?: string | null
          offer_id?: string | null
          payment_terms?: string | null
          price_per_unit?: number | null
          quality_terms?: string | null
          quantity?: number | null
          signatures?: Json | null
          status?: string | null
          terms?: string | null
          title?: string | null
          total_amount?: number | null
          transporter_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_one: string | null
          participant_two: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_one?: string | null
          participant_two?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_one?: string | null
          participant_two?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_one_fkey"
            columns: ["participant_one"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_two_fkey"
            columns: ["participant_two"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_activities: {
        Row: {
          activity_date: string
          activity_type: string
          cost: number | null
          created_at: string | null
          crop_id: string | null
          description: string | null
          id: string
          performed_by: string | null
        }
        Insert: {
          activity_date: string
          activity_type: string
          cost?: number | null
          created_at?: string | null
          crop_id?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          cost?: number | null
          created_at?: string | null
          crop_id?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_activities_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_calendar: {
        Row: {
          created_at: string | null
          crop_id: string | null
          event_date: string
          event_type: string
          id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          crop_id?: string | null
          event_date: string
          event_type: string
          id?: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          crop_id?: string | null
          event_date?: string
          event_type?: string
          id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_calendar_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_images: {
        Row: {
          analysis_result: Json | null
          captured_at: string | null
          created_at: string | null
          crop_id: string | null
          id: string
          image_type: string | null
          image_url: string
        }
        Insert: {
          analysis_result?: Json | null
          captured_at?: string | null
          created_at?: string | null
          crop_id?: string | null
          id?: string
          image_type?: string | null
          image_url: string
        }
        Update: {
          analysis_result?: Json | null
          captured_at?: string | null
          created_at?: string | null
          crop_id?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_images_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_notes: {
        Row: {
          created_at: string | null
          crop_id: string | null
          id: string
          note: string
        }
        Insert: {
          created_at?: string | null
          crop_id?: string | null
          id?: string
          note: string
        }
        Update: {
          created_at?: string | null
          crop_id?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_notes_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_waste: {
        Row: {
          created_at: string | null
          farmer_id: string | null
          id: string
          image_url: string | null
          location: string | null
          price: number | null
          quantity: number | null
          waste_type: string | null
        }
        Insert: {
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          quantity?: number | null
          waste_type?: string | null
        }
        Update: {
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          quantity?: number | null
          waste_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_waste_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          actual_harvest_date: string | null
          actual_price: number | null
          area: number | null
          category: string | null
          created_at: string | null
          crop_name: string | null
          current_stage: string | null
          description: string | null
          estimated_price: number | null
          expected_harvest_date: string | null
          farm_id: string | null
          farmer_id: string | null
          fertilizers: string[] | null
          harvest_date: string | null
          health_score: number | null
          id: string
          irrigation_method: string | null
          name: string | null
          organic_certified: boolean | null
          parcel_id: string | null
          pesticides: string[] | null
          planting_date: string | null
          price: number | null
          quality: string | null
          quantity: number | null
          season: string | null
          seed_quantity: number | null
          seed_source: string | null
          soil_type: string | null
          sowing_date: string | null
          status: string | null
          unit: string | null
          updated_at: string | null
          variety: string | null
        }
        Insert: {
          actual_harvest_date?: string | null
          actual_price?: number | null
          area?: number | null
          category?: string | null
          created_at?: string | null
          crop_name?: string | null
          current_stage?: string | null
          description?: string | null
          estimated_price?: number | null
          expected_harvest_date?: string | null
          farm_id?: string | null
          farmer_id?: string | null
          fertilizers?: string[] | null
          harvest_date?: string | null
          health_score?: number | null
          id?: string
          irrigation_method?: string | null
          name?: string | null
          organic_certified?: boolean | null
          parcel_id?: string | null
          pesticides?: string[] | null
          planting_date?: string | null
          price?: number | null
          quality?: string | null
          quantity?: number | null
          season?: string | null
          seed_quantity?: number | null
          seed_source?: string | null
          soil_type?: string | null
          sowing_date?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
        }
        Update: {
          actual_harvest_date?: string | null
          actual_price?: number | null
          area?: number | null
          category?: string | null
          created_at?: string | null
          crop_name?: string | null
          current_stage?: string | null
          description?: string | null
          estimated_price?: number | null
          expected_harvest_date?: string | null
          farm_id?: string | null
          farmer_id?: string | null
          fertilizers?: string[] | null
          harvest_date?: string | null
          health_score?: number | null
          id?: string
          irrigation_method?: string | null
          name?: string | null
          organic_certified?: boolean | null
          parcel_id?: string | null
          pesticides?: string[] | null
          planting_date?: string | null
          price?: number | null
          quality?: string | null
          quantity?: number | null
          season?: string | null
          seed_quantity?: number | null
          seed_source?: string | null
          soil_type?: string | null
          sowing_date?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crops_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_parcel"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "land_parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string | null
          id: string
          name: string
          quantity: number
          updated_at: string | null
          user_id: string | null
          working_condition: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          quantity: number
          updated_at?: string | null
          user_id?: string | null
          working_condition?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
          working_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_locations: {
        Row: {
          address: string | null
          created_at: string | null
          district: string
          farm_id: string | null
          id: string
          latitude: number
          longitude: number
          mandal: string | null
          state: string
          updated_at: string | null
          user_id: string | null
          village: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          district: string
          farm_id?: string | null
          id?: string
          latitude: number
          longitude: number
          mandal?: string | null
          state: string
          updated_at?: string | null
          user_id?: string | null
          village: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          district?: string
          farm_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          mandal?: string | null
          state?: string
          updated_at?: string | null
          user_id?: string | null
          village?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_locations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          created_at: string | null
          experience: number | null
          id: string
          irrigation_type: string | null
          land_area: number | null
          land_type: string | null
          sustainability_score: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          experience?: number | null
          id?: string
          irrigation_type?: string | null
          land_area?: number | null
          land_type?: string | null
          sustainability_score?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          experience?: number | null
          id?: string
          irrigation_type?: string | null
          land_area?: number | null
          land_type?: string | null
          sustainability_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          address: Json | null
          created_at: string | null
          district: string | null
          farm_name: string | null
          farmer_id: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string | null
          soil_type: string | null
          state: string | null
          total_area: number | null
          village: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          district?: string | null
          farm_name?: string | null
          farmer_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          soil_type?: string | null
          state?: string | null
          total_area?: number | null
          village?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          district?: string | null
          farm_name?: string | null
          farmer_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          soil_type?: string | null
          state?: string | null
          total_area?: number | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      government_announcements: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      government_profiles: {
        Row: {
          created_at: string | null
          crop_insurance: boolean | null
          fpo_member: boolean | null
          id: string
          kisan_credit_card: boolean | null
          pm_kisan_beneficiary: boolean | null
          soil_health_card: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          crop_insurance?: boolean | null
          fpo_member?: boolean | null
          id?: string
          kisan_credit_card?: boolean | null
          pm_kisan_beneficiary?: boolean | null
          soil_health_card?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          crop_insurance?: boolean | null
          fpo_member?: boolean | null
          id?: string
          kisan_credit_card?: boolean | null
          pm_kisan_beneficiary?: boolean | null
          soil_health_card?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      government_schemes: {
        Row: {
          application_url: string | null
          benefits: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          eligibility: string | null
          id: string
          is_active: boolean | null
          ministry: string | null
          state: string | null
          target_roles: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          application_url?: string | null
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          is_active?: boolean | null
          ministry?: string | null
          state?: string | null
          target_roles?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          application_url?: string | null
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          is_active?: boolean | null
          ministry?: string | null
          state?: string | null
          target_roles?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_schemes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string | null
          factory_name: string | null
          gst_number: string | null
          id: string
          industry_type: string | null
          sustainability_rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          factory_name?: string | null
          gst_number?: string | null
          id?: string
          industry_type?: string | null
          sustainability_rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          factory_name?: string | null
          gst_number?: string | null
          id?: string
          industry_type?: string | null
          sustainability_rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_documents: {
        Row: {
          doc_type: string
          file_url: string
          id: string
          industry_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          doc_type: string
          file_url: string
          id?: string
          industry_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          doc_type?: string
          file_url?: string
          id?: string
          industry_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_documents_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_factories: {
        Row: {
          city: string
          created_at: string | null
          district: string
          factory_address: string
          factory_name: string
          id: string
          industry_id: string | null
          latitude: number | null
          longitude: number | null
          number_of_employees: number | null
          postal_code: string
          state: string
          working_shifts: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          district: string
          factory_address: string
          factory_name: string
          id?: string
          industry_id?: string | null
          latitude?: number | null
          longitude?: number | null
          number_of_employees?: number | null
          postal_code: string
          state: string
          working_shifts?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          district?: string
          factory_address?: string
          factory_name?: string
          id?: string
          industry_id?: string | null
          latitude?: number | null
          longitude?: number | null
          number_of_employees?: number | null
          postal_code?: string
          state?: string
          working_shifts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_factories_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_payment_settings: {
        Row: {
          account_holder: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          ifsc_code: string | null
          industry_id: string | null
          upi_id: string | null
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          industry_id?: string | null
          upi_id?: string | null
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          industry_id?: string | null
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_payment_settings_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_processing_capacity: {
        Row: {
          annual_capacity: number | null
          capacity_unit: string
          created_at: string | null
          daily_capacity: number
          id: string
          industry_id: string | null
          loading_facilities: Json | null
          logistics_preference: string | null
          monthly_capacity: number | null
          operating_hours: string | null
        }
        Insert: {
          annual_capacity?: number | null
          capacity_unit: string
          created_at?: string | null
          daily_capacity: number
          id?: string
          industry_id?: string | null
          loading_facilities?: Json | null
          logistics_preference?: string | null
          monthly_capacity?: number | null
          operating_hours?: string | null
        }
        Update: {
          annual_capacity?: number | null
          capacity_unit?: string
          created_at?: string | null
          daily_capacity?: number
          id?: string
          industry_id?: string | null
          loading_facilities?: Json | null
          logistics_preference?: string | null
          monthly_capacity?: number | null
          operating_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_processing_capacity_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_procurement_preferences: {
        Row: {
          certified_farms_only: boolean | null
          contract_farming_preferred: boolean | null
          created_at: string | null
          id: string
          industry_id: string | null
          max_order_quantity: number | null
          min_order_quantity: number | null
          organic_only: boolean | null
          preferred_districts: Json | null
          preferred_farmer_types: Json | null
          preferred_quality_grade: string | null
          preferred_states: Json | null
          purchase_frequency: string
          raw_materials: Json
        }
        Insert: {
          certified_farms_only?: boolean | null
          contract_farming_preferred?: boolean | null
          created_at?: string | null
          id?: string
          industry_id?: string | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          organic_only?: boolean | null
          preferred_districts?: Json | null
          preferred_farmer_types?: Json | null
          preferred_quality_grade?: string | null
          preferred_states?: Json | null
          purchase_frequency: string
          raw_materials: Json
        }
        Update: {
          certified_farms_only?: boolean | null
          contract_farming_preferred?: boolean | null
          created_at?: string | null
          id?: string
          industry_id?: string | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          organic_only?: boolean | null
          preferred_districts?: Json | null
          preferred_farmer_types?: Json | null
          preferred_quality_grade?: string | null
          preferred_states?: Json | null
          purchase_frequency?: string
          raw_materials?: Json
        }
        Relationships: [
          {
            foreignKeyName: "industry_procurement_preferences_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_profiles: {
        Row: {
          company_email: string
          company_name: string
          contact_number: string
          created_at: string | null
          gst_number: string | null
          id: string
          industry_type: string
          pan_number: string | null
          registration_number: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          year_established: number | null
        }
        Insert: {
          company_email: string
          company_name: string
          contact_number: string
          created_at?: string | null
          gst_number?: string | null
          id?: string
          industry_type: string
          pan_number?: string | null
          registration_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          year_established?: number | null
        }
        Update: {
          company_email?: string
          company_name?: string
          contact_number?: string
          created_at?: string | null
          gst_number?: string | null
          id?: string
          industry_type?: string
          pan_number?: string | null
          registration_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_warehouses: {
        Row: {
          address: string
          capacity_tons: number
          cold_storage: boolean | null
          created_at: string | null
          id: string
          industry_id: string | null
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          temperature_controlled: boolean | null
          warehouse_name: string
        }
        Insert: {
          address: string
          capacity_tons: number
          cold_storage?: boolean | null
          created_at?: string | null
          id?: string
          industry_id?: string | null
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          temperature_controlled?: boolean | null
          warehouse_name: string
        }
        Update: {
          address?: string
          capacity_tons?: number
          cold_storage?: boolean | null
          created_at?: string | null
          id?: string
          industry_id?: string | null
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          temperature_controlled?: boolean | null
          warehouse_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "industry_warehouses_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      irrigation_profiles: {
        Row: {
          created_at: string | null
          farm_id: string | null
          frequency: string | null
          id: string
          irrigation_type: string
          updated_at: string | null
          user_id: string | null
          water_availability: string | null
          water_source: string
        }
        Insert: {
          created_at?: string | null
          farm_id?: string | null
          frequency?: string | null
          id?: string
          irrigation_type: string
          updated_at?: string | null
          user_id?: string | null
          water_availability?: string | null
          water_source: string
        }
        Update: {
          created_at?: string | null
          farm_id?: string | null
          frequency?: string | null
          id?: string
          irrigation_type?: string
          updated_at?: string | null
          user_id?: string | null
          water_availability?: string | null
          water_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "irrigation_profiles_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "irrigation_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      land_parcels: {
        Row: {
          area: number | null
          created_at: string | null
          farmer_id: string | null
          id: string
          parcel_name: string
          updated_at: string | null
        }
        Insert: {
          area?: number | null
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          parcel_name: string
          updated_at?: string | null
        }
        Update: {
          area?: number | null
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          parcel_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "land_parcels_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: Json | null
          available_from: string | null
          available_till: string | null
          created_at: string | null
          crop_id: string | null
          crop_name: string | null
          crop_variety: string | null
          description: string | null
          farmer_id: string | null
          id: string
          listing_type: string | null
          min_order_quantity: number | null
          organic_certified: boolean | null
          price: number | null
          price_per_unit: number | null
          quantity: number | null
          seller_id: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          type: string | null
          unit: string | null
          views: number | null
        }
        Insert: {
          address?: Json | null
          available_from?: string | null
          available_till?: string | null
          created_at?: string | null
          crop_id?: string | null
          crop_name?: string | null
          crop_variety?: string | null
          description?: string | null
          farmer_id?: string | null
          id?: string
          listing_type?: string | null
          min_order_quantity?: number | null
          organic_certified?: boolean | null
          price?: number | null
          price_per_unit?: number | null
          quantity?: number | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          unit?: string | null
          views?: number | null
        }
        Update: {
          address?: Json | null
          available_from?: string | null
          available_till?: string | null
          created_at?: string | null
          crop_id?: string | null
          crop_name?: string | null
          crop_variety?: string | null
          description?: string | null
          farmer_id?: string | null
          id?: string
          listing_type?: string | null
          min_order_quantity?: number | null
          organic_certified?: boolean | null
          price?: number | null
          price_per_unit?: number | null
          quantity?: number | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          unit?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          authentication_method: string
          browser: string
          browser_version: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_id: string | null
          device_type: string
          failure_reason: string | null
          id: string
          internet_provider: string | null
          ip_address: string
          is_blocked: boolean | null
          is_successful: boolean | null
          is_trusted_device: boolean | null
          language: string | null
          latitude: number | null
          login_id: string
          login_status: string
          login_time: string
          login_type: string
          logout_time: string | null
          longitude: number | null
          metadata: Json | null
          network_type: string | null
          operating_system: string
          operating_system_version: string | null
          otp_request_id: string | null
          platform: string
          public_id: string | null
          refresh_token_id: string | null
          risk_score: number | null
          screen_resolution: string | null
          session_duration: number | null
          session_id: string | null
          state: string | null
          suspicious_reason: string | null
          timezone: string | null
          updated_at: string | null
          user_agent: string
          user_id: string | null
          version: number | null
        }
        Insert: {
          authentication_method: string
          browser: string
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_id?: string | null
          device_type: string
          failure_reason?: string | null
          id?: string
          internet_provider?: string | null
          ip_address: string
          is_blocked?: boolean | null
          is_successful?: boolean | null
          is_trusted_device?: boolean | null
          language?: string | null
          latitude?: number | null
          login_id: string
          login_status: string
          login_time?: string
          login_type: string
          logout_time?: string | null
          longitude?: number | null
          metadata?: Json | null
          network_type?: string | null
          operating_system: string
          operating_system_version?: string | null
          otp_request_id?: string | null
          platform: string
          public_id?: string | null
          refresh_token_id?: string | null
          risk_score?: number | null
          screen_resolution?: string | null
          session_duration?: number | null
          session_id?: string | null
          state?: string | null
          suspicious_reason?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_agent: string
          user_id?: string | null
          version?: number | null
        }
        Update: {
          authentication_method?: string
          browser?: string
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_id?: string | null
          device_type?: string
          failure_reason?: string | null
          id?: string
          internet_provider?: string | null
          ip_address?: string
          is_blocked?: boolean | null
          is_successful?: boolean | null
          is_trusted_device?: boolean | null
          language?: string | null
          latitude?: number | null
          login_id?: string
          login_status?: string
          login_time?: string
          login_type?: string
          logout_time?: string | null
          longitude?: number | null
          metadata?: Json | null
          network_type?: string | null
          operating_system?: string
          operating_system_version?: string | null
          otp_request_id?: string | null
          platform?: string
          public_id?: string | null
          refresh_token_id?: string | null
          risk_score?: number | null
          screen_resolution?: string | null
          session_duration?: number | null
          session_id?: string | null
          state?: string | null
          suspicious_reason?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_agent?: string
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string | null
          sender_id: string | null
        }
        Insert: {
          attachment?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          sender_id?: string | null
        }
        Update: {
          attachment?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          createdAt: string | null
          id: string
          is_read: boolean | null
          isRead: boolean | null
          message: string | null
          title: string | null
          user_id: string | null
          userId: string | null
        }
        Insert: {
          created_at?: string | null
          createdAt?: string | null
          id?: string
          is_read?: boolean | null
          isRead?: boolean | null
          message?: string | null
          title?: string | null
          user_id?: string | null
          userId?: string | null
        }
        Update: {
          created_at?: string | null
          createdAt?: string | null
          id?: string
          is_read?: boolean | null
          isRead?: boolean | null
          message?: string | null
          title?: string | null
          user_id?: string | null
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          buyer_id: string | null
          counter_by: string | null
          counter_message: string | null
          counter_price: number | null
          created_at: string | null
          farmer_id: string | null
          history: Json | null
          id: string
          industry_id: string | null
          listing_id: string | null
          message: string | null
          offer_price: number | null
          offered_price: number | null
          quantity: number | null
          status: string | null
        }
        Insert: {
          buyer_id?: string | null
          counter_by?: string | null
          counter_message?: string | null
          counter_price?: number | null
          created_at?: string | null
          farmer_id?: string | null
          history?: Json | null
          id?: string
          industry_id?: string | null
          listing_id?: string | null
          message?: string | null
          offer_price?: number | null
          offered_price?: number | null
          quantity?: number | null
          status?: string | null
        }
        Update: {
          buyer_id?: string | null
          counter_by?: string | null
          counter_message?: string | null
          counter_price?: number | null
          created_at?: string | null
          farmer_id?: string | null
          history?: Json | null
          id?: string
          industry_id?: string | null
          listing_id?: string | null
          message?: string | null
          offer_price?: number | null
          offered_price?: number | null
          quantity?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string | null
          contract_id: string | null
          created_at: string | null
          delivery_status: string | null
          farmer_id: string | null
          id: string
          industry_id: string | null
          paid_amount: number | null
          payment_status: string | null
          quality_grade: string | null
          quality_inspected_at: string | null
          quality_notes: string | null
          status: string | null
          timeline: Json | null
          total_amount: number | null
          transport_id: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          delivery_status?: string | null
          farmer_id?: string | null
          id?: string
          industry_id?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          quality_grade?: string | null
          quality_inspected_at?: string | null
          quality_notes?: string | null
          status?: string | null
          timeline?: Json | null
          total_amount?: number | null
          transport_id?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          delivery_status?: string | null
          farmer_id?: string | null
          id?: string
          industry_id?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          quality_grade?: string | null
          quality_inspected_at?: string | null
          quality_notes?: string | null
          status?: string | null
          timeline?: Json | null
          total_amount?: number | null
          transport_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_requests: {
        Row: {
          channel: string | null
          country_code: string | null
          created_at: string | null
          email: string | null
          expires_at: string
          failure_reason: string | null
          id: string
          max_attempts: number | null
          max_resend_limit: number | null
          metadata: Json | null
          otp_hash: string | null
          otp_length: number | null
          phone: string | null
          public_id: string | null
          purpose: string | null
          request_device: string | null
          request_ip: string | null
          request_platform: string | null
          resend_count: number | null
          status: string | null
          twilio_message_sid: string | null
          updated_at: string | null
          user_id: string | null
          verification_attempts: number | null
          verified_at: string | null
          version: number | null
        }
        Insert: {
          channel?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          expires_at: string
          failure_reason?: string | null
          id?: string
          max_attempts?: number | null
          max_resend_limit?: number | null
          metadata?: Json | null
          otp_hash?: string | null
          otp_length?: number | null
          phone?: string | null
          public_id?: string | null
          purpose?: string | null
          request_device?: string | null
          request_ip?: string | null
          request_platform?: string | null
          resend_count?: number | null
          status?: string | null
          twilio_message_sid?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_attempts?: number | null
          verified_at?: string | null
          version?: number | null
        }
        Update: {
          channel?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string
          failure_reason?: string | null
          id?: string
          max_attempts?: number | null
          max_resend_limit?: number | null
          metadata?: Json | null
          otp_hash?: string | null
          otp_length?: number | null
          phone?: string | null
          public_id?: string | null
          purpose?: string | null
          request_device?: string | null
          request_ip?: string | null
          request_platform?: string | null
          resend_count?: number | null
          status?: string | null
          twilio_message_sid?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_attempts?: number | null
          verified_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      otps: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          otp: string | null
          phone: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          otp?: string | null
          phone?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          otp?: string | null
          phone?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          contract_id: string | null
          created_at: string | null
          id: string
          method: string | null
          note: string | null
          order_id: string | null
          paid_at: string | null
          paid_by: string | null
          payment_method: string | null
          payment_status: string | null
          receipt_url: string | null
          received_by: string | null
          received_by_id: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: number | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          note?: string | null
          order_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_url?: string | null
          received_by?: string | null
          received_by_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          note?: string | null
          order_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_url?: string | null
          received_by?: string | null
          received_by_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_id_fkey"
            columns: ["received_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          device_id: string | null
          device_type: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_compromised: boolean | null
          is_deleted: boolean | null
          is_expired: boolean | null
          is_revoked: boolean | null
          issued_at: string | null
          jwt_id: string
          last_used_at: string | null
          metadata: Json | null
          operating_system: string | null
          platform: string | null
          public_id: string | null
          revoke_reason: string | null
          revoked_at: string | null
          session_id: string | null
          token_hash: string
          token_version: number | null
          updated_at: string | null
          updated_by: string | null
          user_agent: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          device_id?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_compromised?: boolean | null
          is_deleted?: boolean | null
          is_expired?: boolean | null
          is_revoked?: boolean | null
          issued_at?: string | null
          jwt_id: string
          last_used_at?: string | null
          metadata?: Json | null
          operating_system?: string | null
          platform?: string | null
          public_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          session_id?: string | null
          token_hash: string
          token_version?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          device_id?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_compromised?: boolean | null
          is_deleted?: boolean | null
          is_expired?: boolean | null
          is_revoked?: boolean | null
          issued_at?: string | null
          jwt_id?: string
          last_used_at?: string | null
          metadata?: Json | null
          operating_system?: string | null
          platform?: string | null
          public_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          session_id?: string | null
          token_hash?: string
          token_version?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_agent?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          reason: string | null
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          reason?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          reason?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          reviewee_id: string | null
          reviewer_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_applications: {
        Row: {
          created_at: string | null
          form_data: Json
          id: string
          scheme_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          form_data: Json
          id?: string
          scheme_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          form_data?: Json
          id?: string
          scheme_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "government_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_url: string
          id: string
          scheme_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_url: string
          id?: string
          scheme_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_url?: string
          id?: string
          scheme_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_documents_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "government_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_eligibility: {
        Row: {
          checked_at: string | null
          created_at: string | null
          id: string
          scheme_id: string | null
          score: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          checked_at?: string | null
          created_at?: string | null
          id?: string
          scheme_id?: string | null
          score?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          checked_at?: string | null
          created_at?: string | null
          id?: string
          scheme_id?: string | null
          score?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_eligibility_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "government_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_eligibility_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          severity: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          severity?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          severity?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          actioned_at: string | null
          actioned_by: string | null
          admin_action: string | null
          admin_notes: string | null
          audit_log_id: string | null
          browser: string | null
          category: string
          city: string | null
          confidence_score: number | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string
          detection_method: string | null
          device_id: string | null
          device_type: string | null
          event_code: string
          event_type: string
          id: string
          ip_address: string
          is_automated_response: boolean | null
          is_deleted: boolean | null
          is_resolved: boolean | null
          latitude: number | null
          login_history_id: string | null
          longitude: number | null
          metadata: Json | null
          occurred_at: string | null
          operating_system: string | null
          platform: string | null
          public_id: string | null
          refresh_token_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          response_action: string | null
          risk_score: number | null
          session_id: string | null
          severity: string
          source: string
          state: string | null
          status: string
          title: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          admin_action?: string | null
          admin_notes?: string | null
          audit_log_id?: string | null
          browser?: string | null
          category: string
          city?: string | null
          confidence_score?: number | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          detection_method?: string | null
          device_id?: string | null
          device_type?: string | null
          event_code: string
          event_type: string
          id?: string
          ip_address: string
          is_automated_response?: boolean | null
          is_deleted?: boolean | null
          is_resolved?: boolean | null
          latitude?: number | null
          login_history_id?: string | null
          longitude?: number | null
          metadata?: Json | null
          occurred_at?: string | null
          operating_system?: string | null
          platform?: string | null
          public_id?: string | null
          refresh_token_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_action?: string | null
          risk_score?: number | null
          session_id?: string | null
          severity: string
          source: string
          state?: string | null
          status: string
          title: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actioned_at?: string | null
          actioned_by?: string | null
          admin_action?: string | null
          admin_notes?: string | null
          audit_log_id?: string | null
          browser?: string | null
          category?: string
          city?: string | null
          confidence_score?: number | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          detection_method?: string | null
          device_id?: string | null
          device_type?: string | null
          event_code?: string
          event_type?: string
          id?: string
          ip_address?: string
          is_automated_response?: boolean | null
          is_deleted?: boolean | null
          is_resolved?: boolean | null
          latitude?: number | null
          login_history_id?: string | null
          longitude?: number | null
          metadata?: Json | null
          occurred_at?: string | null
          operating_system?: string | null
          platform?: string | null
          public_id?: string | null
          refresh_token_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_action?: string | null
          risk_score?: number | null
          session_id?: string | null
          severity?: string
          source?: string
          state?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reported_by: string | null
          severity: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          browser: string | null
          browser_version: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_id: string | null
          device_model: string | null
          device_type: string | null
          expires_at: string
          id: string
          idle_timeout_at: string
          ip_address: string | null
          language: string | null
          last_activity_at: string
          latitude: number | null
          login_method: string
          login_time: string
          logout_reason: string | null
          logout_time: string | null
          longitude: number | null
          metadata: Json | null
          operating_system: string | null
          operating_system_version: string | null
          platform: string | null
          public_id: string | null
          refresh_token_id: string | null
          screen_resolution: string | null
          session_code: string
          session_status: string
          state: string | null
          timezone: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_id?: string | null
          device_model?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          idle_timeout_at: string
          ip_address?: string | null
          language?: string | null
          last_activity_at: string
          latitude?: number | null
          login_method: string
          login_time: string
          logout_reason?: string | null
          logout_time?: string | null
          longitude?: number | null
          metadata?: Json | null
          operating_system?: string | null
          operating_system_version?: string | null
          platform?: string | null
          public_id?: string | null
          refresh_token_id?: string | null
          screen_resolution?: string | null
          session_code: string
          session_status: string
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_id?: string | null
          device_model?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          idle_timeout_at?: string
          ip_address?: string | null
          language?: string | null
          last_activity_at?: string
          latitude?: number | null
          login_method?: string
          login_time?: string
          logout_reason?: string | null
          logout_time?: string | null
          longitude?: number | null
          metadata?: Json | null
          operating_system?: string | null
          operating_system_version?: string | null
          platform?: string | null
          public_id?: string | null
          refresh_token_id?: string | null
          screen_resolution?: string | null
          session_code?: string
          session_status?: string
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      token_blacklist: {
        Row: {
          id: string
          revoked_at: string | null
          token: string
        }
        Insert: {
          id?: string
          revoked_at?: string | null
          token: string
        }
        Update: {
          id?: string
          revoked_at?: string | null
          token?: string
        }
        Relationships: []
      }
      transport_availability: {
        Row: {
          created_at: string | null
          id: string
          schedule_type: string
          status: string | null
          transport_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          schedule_type: string
          status?: string | null
          transport_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          schedule_type?: string
          status?: string | null
          transport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_availability_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "transport_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_bank_accounts: {
        Row: {
          account_holder: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          ifsc_code: string | null
          transport_id: string | null
          upi_id: string | null
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          transport_id?: string | null
          upi_id?: string | null
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          transport_id?: string | null
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_bank_accounts_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "transport_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_bookings: {
        Row: {
          actual_delivery: string | null
          cargo: string | null
          checkpoints: Json | null
          created_at: string | null
          current_location: Json | null
          delivery_address: Json | null
          fare: number | null
          farmer_id: string | null
          id: string
          order_id: string | null
          pickup_address: Json | null
          pickup_date: string | null
          special_instructions: string | null
          status: string | null
          transporter_id: string | null
          updated_at: string | null
          vehicle_id: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          actual_delivery?: string | null
          cargo?: string | null
          checkpoints?: Json | null
          created_at?: string | null
          current_location?: Json | null
          delivery_address?: Json | null
          fare?: number | null
          farmer_id?: string | null
          id?: string
          order_id?: string | null
          pickup_address?: Json | null
          pickup_date?: string | null
          special_instructions?: string | null
          status?: string | null
          transporter_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          actual_delivery?: string | null
          cargo?: string | null
          checkpoints?: Json | null
          created_at?: string | null
          current_location?: Json | null
          delivery_address?: Json | null
          fare?: number | null
          farmer_id?: string | null
          id?: string
          order_id?: string | null
          pickup_address?: Json | null
          pickup_date?: string | null
          special_instructions?: string | null
          status?: string | null
          transporter_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_bookings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_drivers: {
        Row: {
          aadhaar_number: string | null
          created_at: string | null
          dob: string
          driver_name: string
          gender: string | null
          id: string
          license_expiry: string
          license_number: string
          mobile_number: string
          transport_id: string | null
          years_experience: number | null
        }
        Insert: {
          aadhaar_number?: string | null
          created_at?: string | null
          dob: string
          driver_name: string
          gender?: string | null
          id?: string
          license_expiry: string
          license_number: string
          mobile_number: string
          transport_id?: string | null
          years_experience?: number | null
        }
        Update: {
          aadhaar_number?: string | null
          created_at?: string | null
          dob?: string
          driver_name?: string
          gender?: string | null
          id?: string
          license_expiry?: string
          license_number?: string
          mobile_number?: string
          transport_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_drivers_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "transport_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_pricing: {
        Row: {
          base_price: number
          created_at: string | null
          id: string
          loading_charge: number | null
          minimum_charge: number | null
          price_per_km: number | null
          price_per_ton: number | null
          pricing_model: string
          transport_id: string | null
          unloading_charge: number | null
          waiting_charge: number | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          id?: string
          loading_charge?: number | null
          minimum_charge?: number | null
          price_per_km?: number | null
          price_per_ton?: number | null
          pricing_model: string
          transport_id?: string | null
          unloading_charge?: number | null
          waiting_charge?: number | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          id?: string
          loading_charge?: number | null
          minimum_charge?: number | null
          price_per_km?: number | null
          price_per_ton?: number | null
          pricing_model?: string
          transport_id?: string | null
          unloading_charge?: number | null
          waiting_charge?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_pricing_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "transport_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_profiles: {
        Row: {
          company_name: string
          contact_number: string
          created_at: string | null
          email: string
          gst_number: string | null
          id: string
          office_address: string | null
          owner_name: string
          transport_type: string
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          company_name: string
          contact_number: string
          created_at?: string | null
          email: string
          gst_number?: string | null
          id?: string
          office_address?: string | null
          owner_name: string
          transport_type: string
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          company_name?: string
          contact_number?: string
          created_at?: string | null
          email?: string
          gst_number?: string | null
          id?: string
          office_address?: string | null
          owner_name?: string
          transport_type?: string
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_service_areas: {
        Row: {
          created_at: string | null
          districts: Json | null
          gps_setting: string | null
          id: string
          latitude: number | null
          longitude: number | null
          polygon_data: Json | null
          radius_km: number | null
          selection_method: string
          states: Json | null
          transport_id: string | null
        }
        Insert: {
          created_at?: string | null
          districts?: Json | null
          gps_setting?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          polygon_data?: Json | null
          radius_km?: number | null
          selection_method: string
          states?: Json | null
          transport_id?: string | null
        }
        Update: {
          created_at?: string | null
          districts?: Json | null
          gps_setting?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          polygon_data?: Json | null
          radius_km?: number | null
          selection_method?: string
          states?: Json | null
          transport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_service_areas_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "transport_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_vehicles: {
        Row: {
          brand: string | null
          capacity_unit: string
          created_at: string | null
          fuel_type: string | null
          id: string
          is_primary: boolean | null
          load_capacity: number
          manufacturing_year: number | null
          model: string | null
          status: string | null
          transport_id: string | null
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          brand?: string | null
          capacity_unit: string
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          is_primary?: boolean | null
          load_capacity: number
          manufacturing_year?: number | null
          model?: string | null
          status?: string | null
          transport_id?: string | null
          vehicle_number: string
          vehicle_type: string
        }
        Update: {
          brand?: string | null
          capacity_unit?: string
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          is_primary?: boolean | null
          load_capacity?: number
          manufacturing_year?: number | null
          model?: string | null
          status?: string | null
          transport_id?: string | null
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_vehicles_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "transport_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transporters: {
        Row: {
          created_at: string | null
          fleet_size: number | null
          id: string
          license_number: string | null
          total_earnings: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fleet_size?: number | null
          id?: string
          license_number?: string | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fleet_size?: number | null
          id?: string
          license_number?: string | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transporters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          browser: string | null
          browser_version: string | null
          created_at: string | null
          device_code: string | null
          device_fingerprint: string | null
          device_name: string | null
          device_type: string | null
          failed_logins: number | null
          first_city: string | null
          first_country: string | null
          first_login_at: string | null
          first_state: string | null
          id: string
          ip_address: string | null
          is_blocked: boolean | null
          is_current_device: boolean | null
          is_deleted: boolean | null
          is_trusted: boolean | null
          language: string | null
          last_activity_at: string | null
          last_city: string | null
          last_country: string | null
          last_login_at: string | null
          last_refresh_token_id: string | null
          last_session_id: string | null
          last_state: string | null
          mac_hash: string | null
          manufacturer: string | null
          metadata: Json | null
          model: string | null
          network_type: string | null
          operating_system: string | null
          operating_system_version: string | null
          platform: string | null
          public_id: string | null
          revoke_reason: string | null
          revoked_at: string | null
          screen_resolution: string | null
          successful_logins: number | null
          timezone: string | null
          total_logins: number | null
          trust_status: string | null
          trusted_at: string | null
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          created_at?: string | null
          device_code?: string | null
          device_fingerprint?: string | null
          device_name?: string | null
          device_type?: string | null
          failed_logins?: number | null
          first_city?: string | null
          first_country?: string | null
          first_login_at?: string | null
          first_state?: string | null
          id?: string
          ip_address?: string | null
          is_blocked?: boolean | null
          is_current_device?: boolean | null
          is_deleted?: boolean | null
          is_trusted?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          last_city?: string | null
          last_country?: string | null
          last_login_at?: string | null
          last_refresh_token_id?: string | null
          last_session_id?: string | null
          last_state?: string | null
          mac_hash?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          network_type?: string | null
          operating_system?: string | null
          operating_system_version?: string | null
          platform?: string | null
          public_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          screen_resolution?: string | null
          successful_logins?: number | null
          timezone?: string | null
          total_logins?: number | null
          trust_status?: string | null
          trusted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          created_at?: string | null
          device_code?: string | null
          device_fingerprint?: string | null
          device_name?: string | null
          device_type?: string | null
          failed_logins?: number | null
          first_city?: string | null
          first_country?: string | null
          first_login_at?: string | null
          first_state?: string | null
          id?: string
          ip_address?: string | null
          is_blocked?: boolean | null
          is_current_device?: boolean | null
          is_deleted?: boolean | null
          is_trusted?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          last_city?: string | null
          last_country?: string | null
          last_login_at?: string | null
          last_refresh_token_id?: string | null
          last_session_id?: string | null
          last_state?: string | null
          mac_hash?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          network_type?: string | null
          operating_system?: string | null
          operating_system_version?: string | null
          platform?: string | null
          public_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          screen_resolution?: string | null
          successful_logins?: number | null
          timezone?: string | null
          total_logins?: number | null
          trust_status?: string | null
          trusted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trusted_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_locked_until: string | null
          address: Json | null
          avatar: string | null
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          email_verification_token: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          is_email_verified: boolean | null
          is_mobile_verified: boolean | null
          is_phone_verified: boolean | null
          is_verified: boolean | null
          language: string | null
          last_login: string | null
          last_login_at: string | null
          last_password_changed_at: string | null
          name: string | null
          password_hash: string | null
          password_reset_expires: string | null
          password_reset_token: string | null
          phone: string | null
          preferred_language: string | null
          profile_completed: boolean | null
          profile_photo: string | null
          public_id: string | null
          refresh_token: string | null
          role: string | null
          status: string | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          updated_by: string | null
          verified: boolean | null
          version: number | null
        }
        Insert: {
          account_locked_until?: string | null
          address?: Json | null
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          email_verification_token?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_email_verified?: boolean | null
          is_mobile_verified?: boolean | null
          is_phone_verified?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_login?: string | null
          last_login_at?: string | null
          last_password_changed_at?: string | null
          name?: string | null
          password_hash?: string | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_completed?: boolean | null
          profile_photo?: string | null
          public_id?: string | null
          refresh_token?: string | null
          role?: string | null
          status?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verified?: boolean | null
          version?: number | null
        }
        Update: {
          account_locked_until?: string | null
          address?: Json | null
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          email_verification_token?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_email_verified?: boolean | null
          is_mobile_verified?: boolean | null
          is_phone_verified?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_login?: string | null
          last_login_at?: string | null
          last_password_changed_at?: string | null
          name?: string | null
          password_hash?: string | null
          password_reset_expires?: string | null
          password_reset_token?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_completed?: boolean | null
          profile_photo?: string | null
          public_id?: string | null
          refresh_token?: string | null
          role?: string | null
          status?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verified?: boolean | null
          version?: number | null
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          doc_type: string
          file_url: string
          id: string
          transport_id: string | null
          uploaded_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          doc_type: string
          file_url: string
          id?: string
          transport_id?: string | null
          uploaded_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          doc_type?: string
          file_url?: string
          id?: string
          transport_id?: string | null
          uploaded_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_transport_id_fkey"
            columns: ["transport_id"]
            isOneToOne: false
            referencedRelation: "transport_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "transport_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity: number | null
          capacity_unit: string | null
          color: string | null
          created_at: string | null
          current_location: Json | null
          driver_id: string | null
          id: string
          make: string | null
          model: string | null
          registration_number: string | null
          status: string | null
          transporter_id: string | null
          type: string | null
          vehicle_type: string | null
          year: number | null
        }
        Insert: {
          capacity?: number | null
          capacity_unit?: string | null
          color?: string | null
          created_at?: string | null
          current_location?: Json | null
          driver_id?: string | null
          id?: string
          make?: string | null
          model?: string | null
          registration_number?: string | null
          status?: string | null
          transporter_id?: string | null
          type?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Update: {
          capacity?: number | null
          capacity_unit?: string | null
          color?: string | null
          created_at?: string | null
          current_location?: Json | null
          driver_id?: string | null
          id?: string
          make?: string | null
          model?: string | null
          registration_number?: string | null
          status?: string | null
          transporter_id?: string | null
          type?: string | null
          vehicle_type?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_transporter_id_fkey"
            columns: ["transporter_id"]
            isOneToOne: false
            referencedRelation: "transporters"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          document_type: string
          file_url: string
          id: string
          rejection_reason: string | null
          request_id: string | null
          status: string | null
          uploaded_at: string | null
        }
        Insert: {
          document_type: string
          file_url: string
          id?: string
          rejection_reason?: string | null
          request_id?: string | null
          status?: string | null
          uploaded_at?: string | null
        }
        Update: {
          document_type?: string
          file_url?: string
          id?: string
          rejection_reason?: string | null
          request_id?: string | null
          status?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_history: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          new_status: string | null
          notes: string | null
          previous_status: string | null
          request_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
          request_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          assigned_admin_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          role: string
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          role: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          role?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string
          buyer_id: string | null
          capacity_tons: number
          city: string
          cold_storage: boolean | null
          created_at: string | null
          district: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          postal_code: string
          state: string
        }
        Insert: {
          address: string
          buyer_id?: string | null
          capacity_tons: number
          city: string
          cold_storage?: boolean | null
          created_at?: string | null
          district: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          postal_code: string
          state: string
        }
        Update: {
          address?: string
          buyer_id?: string | null
          capacity_tons?: number
          city?: string
          cold_storage?: boolean | null
          created_at?: string | null
          district?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          postal_code?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_logs: {
        Row: {
          created_at: string | null
          farm_id: string | null
          humidity: number | null
          id: string
          pressure: number | null
          rainfall: number | null
          temperature: number | null
          wind_speed: number | null
        }
        Insert: {
          created_at?: string | null
          farm_id?: string | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          rainfall?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string | null
          farm_id?: string | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          rainfall?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_logs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nearby_listings: {
        Args: { lat: number; lng: number; radius_km: number }
        Returns: {
          address: Json | null
          available_from: string | null
          available_till: string | null
          created_at: string | null
          crop_id: string | null
          crop_name: string | null
          crop_variety: string | null
          description: string | null
          farmer_id: string | null
          id: string
          listing_type: string | null
          min_order_quantity: number | null
          organic_certified: boolean | null
          price: number | null
          price_per_unit: number | null
          quantity: number | null
          seller_id: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          type: string | null
          unit: string | null
          views: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "listings"
          isOneToOne: false
          isSetofReturn: true
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

