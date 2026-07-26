/**
 * تایپ دستی متناظر با supabase/schema.sql (بدون CLI شبکه امکان codegen
 * نبود). هر تغییری در schema.sql باید اینجا هم اعمال شود.
 *
 * نکته: `Relationships: []` روی هر جدول/View و `Functions: {}` روی
 * اسکیمای public، فیلدهای الزامی نوع GenericTable/GenericSchema در
 * @supabase/postgrest-js هستند؛ بدون آن‌ها کل تایپ‌ها به `never` سقوط
 * می‌کنند (طی تست واقعی روی این پروژه کشف شد).
 */
export type UserRole =
  | "doctor"
  | "psychologist"
  | "social-worker"
  | "parent"
  | "teacher"
  | "donor"
  | "admin";

export type PatientFileStatus =
  | "draft"
  | "awaiting_doctor"
  | "awaiting_parent"
  | "active";

export type SelfReportRole = "doctor" | "parent";

export type SupportRequestStatus = "pending" | "approved" | "fulfilled" | "rejected";

export type CaseNoteRole = "doctor" | "psychologist" | "teacher";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          national_id: string;
          full_name: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          national_id: string;
          full_name: string;
          verified?: boolean;
        };
        Update: Partial<{
          role: UserRole;
          full_name: string;
          verified: boolean;
        }>;
        Relationships: [];
      };
      patient_files: {
        Row: {
          id: string;
          child_national_id: string;
          child_full_name: string;
          created_by: string;
          parent_id: string | null;
          doctor_id: string | null;
          psychologist_id: string | null;
          teacher_id: string | null;
          status: PatientFileStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_national_id: string;
          child_full_name: string;
          created_by: string;
          status?: PatientFileStatus;
        };
        Update: Partial<{
          parent_id: string | null;
          doctor_id: string | null;
          psychologist_id: string | null;
          teacher_id: string | null;
          status: PatientFileStatus;
        }>;
        Relationships: [];
      };
      self_report_tokens: {
        Row: {
          token: string;
          patient_file_id: string;
          role: SelfReportRole;
          phone: string;
          used: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          token?: string;
          patient_file_id: string;
          role: SelfReportRole;
          phone: string;
          expires_at: string;
        };
        Update: Partial<{ used: boolean }>;
        Relationships: [];
      };
      doctor_reports: {
        Row: {
          id: string;
          patient_file_id: string;
          disease_type: string;
          prognosis: string;
          treatment_duration: string;
          complications: string[];
          notes: string | null;
          submitted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          disease_type: string;
          prognosis: string;
          treatment_duration: string;
          complications: string[];
          notes?: string | null;
          submitted_by?: string | null;
        };
        Update: Partial<{
          disease_type: string;
          prognosis: string;
          treatment_duration: string;
          complications: string[];
          notes: string | null;
        }>;
        Relationships: [];
      };
      parent_reports: {
        Row: {
          id: string;
          patient_file_id: string;
          education_level: string;
          parent_job: string;
          household_income_bracket: string;
          school_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          education_level: string;
          parent_job: string;
          household_income_bracket: string;
          school_name: string;
        };
        Update: Partial<{
          education_level: string;
          parent_job: string;
          household_income_bracket: string;
          school_name: string;
        }>;
        Relationships: [];
      };
      mental_health_results: {
        Row: {
          id: string;
          patient_file_id: string;
          responses: { itemId: string; value: number }[];
          total_score: number;
          max_score: number;
          band: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          responses: { itemId: string; value: number }[];
          total_score: number;
          max_score: number;
          band: string;
        };
        Update: Partial<{ band: string }>;
        Relationships: [];
      };
      support_requests: {
        Row: {
          id: string;
          patient_file_id: string;
          category: string;
          description: string;
          city: string | null;
          status: SupportRequestStatus;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          category: string;
          description: string;
          city?: string | null;
          created_by: string;
        };
        Update: Partial<{ status: SupportRequestStatus }>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          target_table: string | null;
          target_id: string | null;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          action: string;
          target_table?: string | null;
          target_id?: string | null;
        };
        Update: Partial<{ action: string }>;
        Relationships: [];
      };
      case_notes: {
        Row: {
          id: string;
          patient_file_id: string;
          role: CaseNoteRole;
          author_id: string;
          note: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          role: CaseNoteRole;
          author_id: string;
          note: string;
        };
        Update: Partial<{ note: string }>;
        Relationships: [];
      };
    };
    Views: {
      donor_visible_requests: {
        Row: {
          id: string;
          category: string;
          description: string;
          city: string | null;
          status: SupportRequestStatus;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}
