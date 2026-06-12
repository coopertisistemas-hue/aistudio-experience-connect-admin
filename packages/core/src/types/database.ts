// V2 Database Types — Dom Pietro Experience Connect
// Generated from schema: 20250516120000_v2_core_schema.sql
// Last updated: 2026-05-16

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: unknown }
  | unknown[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          status: string;
          settings: Json;
          branding: Json;
          plan: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          status?: string;
          settings?: Json;
          branding?: Json;
          plan?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          status?: string;
          settings?: Json;
          branding?: Json;
          plan?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string | null;
          avatar_url: string | null;
          status: string;
          preferences: Json;
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          status?: string;
          preferences?: Json;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          status?: string;
          preferences?: Json;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_tenants: {
        Row: {
          user_id: string;
          tenant_id: string;
          role: string;
          status: string;
          invited_by: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tenant_id: string;
          role: string;
          status?: string;
          invited_by?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tenant_id?: string;
          role?: string;
          status?: string;
          invited_by?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          name: string;
          phone: string | null;
          whatsapp: string | null;
          document: string | null;
          status: string;
          default_vehicle_id: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          name: string;
          phone?: string | null;
          whatsapp?: string | null;
          document?: string | null;
          status?: string;
          default_vehicle_id?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string | null;
          whatsapp?: string | null;
          document?: string | null;
          status?: string;
          default_vehicle_id?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: string;
          plate: string | null;
          model: string | null;
          capacity: number;
          color: string | null;
          photo_url: string | null;
          status: string;
          default_driver_id: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          type: string;
          plate?: string | null;
          model?: string | null;
          capacity?: number;
          color?: string | null;
          photo_url?: string | null;
          status?: string;
          default_driver_id?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: string;
          plate?: string | null;
          model?: string | null;
          capacity?: number;
          color?: string | null;
          photo_url?: string | null;
          status?: string;
          default_driver_id?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      served_lodgings: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          whatsapp: string | null;
          address: string | null;
          pickup_point: string | null;
          notes: string | null;
          status: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          pickup_point?: string | null;
          notes?: string | null;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          pickup_point?: string | null;
          notes?: string | null;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      route_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string;
          color: string;
          visibility: string;
          tags: Json;
          sort_order: number;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string;
          color?: string;
          visibility?: string;
          tags?: Json;
          sort_order?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          visibility?: string;
          tags?: Json;
          sort_order?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          partner_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          full_description: string | null;
          origin: string | null;
          destination: string | null;
origin_coords: Json | null;
destination_coords: Json | null;
          distance_km: number | null;
          duration_min: number | null;
          base_price: number;
          images: Json;
          included_items: Json;
          pickup_info: string | null;
          operational_notes: string | null;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id?: string | null;
          partner_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          full_description?: string | null;
          origin?: string | null;
          destination?: string | null;
          origin_coords?: Json | null;
          destination_coords?: Json | null;
          distance_km?: number | null;
          duration_min?: number | null;
          base_price: number;
          images?: Json;
          included_items?: Json;
          pickup_info?: string | null;
          operational_notes?: string | null;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string | null;
          partner_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          full_description?: string | null;
          origin?: string | null;
          destination?: string | null;
          origin_coords?: Json | null;
          destination_coords?: Json | null;
          distance_km?: number | null;
          duration_min?: number | null;
          base_price?: number;
          images?: Json;
          included_items?: Json;
          pickup_info?: string | null;
          operational_notes?: string | null;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      partners: {
        Row: {
          id: string;
          tenant_id: string;
          partner_type: string;
          name: string;
          contact_name: string | null;
          contact_email: string;
          phone: string | null;
          whatsapp: string | null;
          address: string | null;
          city: string;
          state: string;
          country: string;
          notes: string | null;
          tags: Json;
          status: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          partner_type: string;
          name: string;
          contact_name?: string | null;
          contact_email?: string;
          phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          city?: string;
          state?: string;
          country?: string;
          notes?: string | null;
          tags?: Json;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          partner_type?: string;
          name?: string;
          contact_name?: string | null;
          contact_email?: string;
          phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          city?: string;
          state?: string;
          country?: string;
          notes?: string | null;
          tags?: Json;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicle_slots: {
        Row: {
          id: string;
          tenant_id: string;
          vehicle_id: string;
          slot_start: string;
          slot_end: string;
          total_capacity: number;
          held_seats: number;
          reserved_seats: number;
          remaining_seats: number;
          status: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          lock_version: number;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          vehicle_id: string;
          slot_start: string;
          slot_end: string;
          total_capacity: number;
          held_seats?: number;
          reserved_seats?: number;
          remaining_seats?: number;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          lock_version?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          vehicle_id?: string;
          slot_start?: string;
          slot_end?: string;
          total_capacity?: number;
          held_seats?: number;
          reserved_seats?: number;
          remaining_seats?: number;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          lock_version?: number;
        };
      };
      bookings: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          route_id: string | null;
          vehicle_id: string | null;
          vehicle_slot_id: string | null;
          driver_id: string | null;
          served_lodging_id: string | null;
          booking_type: string;
          status: string;
          scheduled_at: string;
          scheduled_end_at: string;
          pickup_location: string | null;
          dropoff_location: string | null;
          passenger_count: number;
          seat_count: number;
          luggage_count: number | null;
          special_requests: string | null;
          total_amount: number;
          notes: string | null;
          idempotency_key: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          lock_version: number;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          route_id?: string | null;
          vehicle_id?: string | null;
          vehicle_slot_id?: string | null;
          driver_id?: string | null;
          served_lodging_id?: string | null;
          booking_type?: string;
          status?: string;
          scheduled_at: string;
          scheduled_end_at: string;
          pickup_location?: string | null;
          dropoff_location?: string | null;
          passenger_count?: number;
          seat_count?: number;
          luggage_count?: number | null;
          special_requests?: string | null;
          total_amount?: number;
          notes?: string | null;
          idempotency_key?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          lock_version?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          route_id?: string | null;
          vehicle_id?: string | null;
          vehicle_slot_id?: string | null;
          driver_id?: string | null;
          served_lodging_id?: string | null;
          booking_type?: string;
          status?: string;
          scheduled_at?: string;
          scheduled_end_at?: string;
          pickup_location?: string | null;
          dropoff_location?: string | null;
          passenger_count?: number;
          seat_count?: number;
          luggage_count?: number | null;
          special_requests?: string | null;
          total_amount?: number;
          notes?: string | null;
          idempotency_key?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          lock_version?: number;
        };
      };
      booking_holds: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string | null;
          vehicle_id: string;
          vehicle_slot_id: string | null;
          passenger_count: number;
          seat_count: number;
          hold_start: string;
          hold_end: string;
          expires_at: string;
          status: string;
          idempotency_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id?: string | null;
          vehicle_id: string;
          vehicle_slot_id?: string | null;
          passenger_count?: number;
          seat_count?: number;
          hold_start: string;
          hold_end: string;
          expires_at: string;
          status?: string;
          idempotency_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string | null;
          vehicle_id?: string;
          vehicle_slot_id?: string | null;
          passenger_count?: number;
          seat_count?: number;
          hold_start?: string;
          hold_end?: string;
          expires_at?: string;
          status?: string;
          idempotency_key?: string;
          created_at?: string;
        };
      };
      booking_passengers: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          full_name: string;
          document: string | null;
          age_group: string;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          full_name: string;
          document?: string | null;
          age_group?: string;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          full_name?: string;
          document?: string | null;
          age_group?: string;
          deleted_at?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          user_id: string;
          provider: string;
          provider_payment_id: string | null;
          preference_id: string | null;
          amount: number;
          currency: string;
          status: string;
          method: string | null;
          idempotency_key: string;
          metadata: Json;
          paid_at: string | null;
          refunded_at: string | null;
          manual_override_reason: string | null;
          manual_override_by: string | null;
          manual_override_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          lock_version: number;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          user_id: string;
          provider?: string;
          provider_payment_id?: string | null;
          preference_id?: string | null;
          amount: number;
          currency?: string;
          status?: string;
          method?: string | null;
          idempotency_key: string;
          metadata?: Json;
          paid_at?: string | null;
          refunded_at?: string | null;
          manual_override_reason?: string | null;
          manual_override_by?: string | null;
          manual_override_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          lock_version?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          user_id?: string;
          provider?: string;
          provider_payment_id?: string | null;
          preference_id?: string | null;
          amount?: number;
          currency?: string;
          status?: string;
          method?: string | null;
          idempotency_key?: string;
          metadata?: Json;
          paid_at?: string | null;
          refunded_at?: string | null;
          manual_override_reason?: string | null;
          manual_override_by?: string | null;
          manual_override_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          lock_version?: number;
        };
      };
      payment_events: {
        Row: {
          id: string;
          payment_id: string;
          tenant_id: string;
          booking_id: string;
          event_type: string;
          provider_event_id: string | null;
          payload: Json;
          processed_by: string;
          correlation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          tenant_id: string;
          booking_id: string;
          event_type: string;
          provider_event_id?: string | null;
          payload?: Json;
          processed_by: string;
          correlation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          tenant_id?: string;
          booking_id?: string;
          event_type?: string;
          provider_event_id?: string | null;
          payload?: Json;
          processed_by?: string;
          correlation_id?: string | null;
          created_at?: string;
        };
      };
      webhook_deliveries: {
        Row: {
          id: string;
          provider: string;
          event_id: string;
          payload_signature: string | null;
          payload_hash: string;
          status: string;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          event_id: string;
          payload_signature?: string | null;
          payload_hash: string;
          status?: string;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          event_id?: string;
          payload_signature?: string | null;
          payload_hash?: string;
          status?: string;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          invoice_number: string;
          amount: number;
          tax_amount: number;
          total_amount: number;
          status: string;
          due_date: string | null;
          paid_at: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          invoice_number: string;
          amount: number;
          tax_amount?: number;
          total_amount: number;
          status?: string;
          due_date?: string | null;
          paid_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          invoice_number?: string;
          amount?: number;
          tax_amount?: number;
          total_amount?: number;
          status?: string;
          due_date?: string | null;
          paid_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string | null;
          sender_id: string;
          recipient_id: string | null;
          channel: string;
          type: string;
          content: string;
          is_read: boolean;
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id?: string | null;
          sender_id: string;
          recipient_id?: string | null;
          channel?: string;
          type?: string;
          content: string;
          is_read?: boolean;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string | null;
          sender_id?: string;
          recipient_id?: string | null;
          channel?: string;
          type?: string;
          content?: string;
          is_read?: boolean;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          impersonator_id: string | null;
          table_name: string;
          record_id: string | null;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          reason: string | null;
          correlation_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          impersonator_id?: string | null;
          table_name: string;
          record_id?: string | null;
          action: string;
          old_data?: Json | null;
          new_data?: Json | null;
          reason?: string | null;
          correlation_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          impersonator_id?: string | null;
          table_name?: string;
          record_id?: string | null;
          action?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          reason?: string | null;
          correlation_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          tenant_id: string;
          email: string;
          role: string;
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          email: string;
          role: string;
          token: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          email?: string;
          role?: string;
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      booking_status_changes: {
        Row: {
          id: string;
          booking_id: string;
          tenant_id: string;
          previous_status: string;
          new_status: string;
          changed_by: string | null;
          reason: string | null;
          correlation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          tenant_id: string;
          previous_status: string;
          new_status: string;
          changed_by?: string | null;
          reason?: string | null;
          correlation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          tenant_id?: string;
          previous_status?: string;
          new_status?: string;
          changed_by?: string | null;
          reason?: string | null;
          correlation_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking_hold: {
        Args: {
          p_tenant_id: string;
          p_user_id: string;
          p_vehicle_slot_id: string;
          p_passenger_count: number;
          p_scheduled_at: string;
          p_scheduled_end_at: string;
          p_pickup_location: string | null;
          p_dropoff_location: string | null;
          p_idempotency_key: string;
        };
        Returns: {
          booking_id: string;
          hold_id: string;
          expires_at: string;
        }[];
      };
      confirm_booking_from_payment: {
        Args: {
          p_tenant_id: string;
          p_booking_id: string;
          p_payment_id: string;
          p_idempotency_key: string;
        };
        Returns: boolean;
      };
      cancel_booking: {
        Args: {
          p_tenant_id: string;
          p_booking_id: string;
          p_reason: string;
        };
        Returns: boolean;
      };
      expire_booking_hold: {
        Args: {
          p_hold_id: string;
          p_admin_id?: string;
        };
        Returns: boolean;
      };
      reschedule_booking: {
        Args: {
          p_tenant_id: string;
          p_booking_id: string;
          p_new_vehicle_slot_id: string;
          p_new_scheduled_at: string;
          p_new_scheduled_end_at: string;
          p_reason: string;
        };
        Returns: boolean;
      };
      process_mp_webhook: {
        Args: {
          p_provider: string;
          p_event_id: string;
          p_payload_hash: string;
          p_payment_id: string;
          p_tenant_id: string;
          p_booking_id: string;
          p_event_type: string;
          p_provider_event_id: string;
          p_payload: Json;
          p_correlation_id: string;
        };
        Returns: boolean;
      };
      record_manual_payment: {
        Args: {
          p_tenant_id: string;
          p_booking_id: string;
          p_admin_id: string;
          p_amount: number;
          p_reason: string;
        };
        Returns: string;
      };
      is_tenant_member: {
        Args: {
          t_uuid: string;
          required_roles?: string[];
        };
        Returns: boolean;
      };
      accept_invite: {
        Args: {
          invitation_token: string;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}
