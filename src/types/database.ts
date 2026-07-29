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

export type CaseStatus = "open" | "under_review" | "completed";
export type CaseUrgency = "low" | "medium" | "high" | "emergency";

export type SelfReportRole = "doctor" | "parent";

export type SupportRequestStatus = "pending" | "approved" | "fulfilled" | "rejected";

export type CaseNoteRole = "doctor" | "psychologist" | "teacher";

export type PledgeStatus = "pledged" | "fulfilled" | "cancelled";

export type ReferralRole = "doctor" | "psychologist" | "teacher" | "donor";
export type ReferralStatus = "pending" | "completed";

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
          case_status: CaseStatus;
          urgency: CaseUrgency;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_national_id: string;
          child_full_name: string;
          created_by: string;
          status?: PatientFileStatus;
          case_status?: CaseStatus;
          urgency?: CaseUrgency;
        };
        Update: Partial<{
          parent_id: string | null;
          doctor_id: string | null;
          psychologist_id: string | null;
          teacher_id: string | null;
          status: PatientFileStatus;
          case_status: CaseStatus;
          urgency: CaseUrgency;
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
          required_amount: number | null;
          raised_amount: number;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          category: string;
          description: string;
          city?: string | null;
          required_amount?: number | null;
          created_by: string;
        };
        Update: Partial<{ status: SupportRequestStatus; required_amount: number | null; raised_amount: number }>;
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
      referrals: {
        Row: {
          id: string;
          case_id: string;
          referred_to_role: ReferralRole;
          assigned_to_user_id: string | null;
          status: ReferralStatus;
          created_by: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          referred_to_role: ReferralRole;
          assigned_to_user_id?: string | null;
          status?: ReferralStatus;
          created_by: string;
        };
        Update: Partial<{
          assigned_to_user_id: string | null;
          status: ReferralStatus;
          completed_at: string | null;
        }>;
        Relationships: [];
      };
      medical_reports: {
        Row: {
          id: string;
          patient_file_id: string;
          author_id: string;
          diagnosis: string | null;
          medications: string | null;
          treatment_plan: string | null;
          next_visit_date: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          author_id: string;
          diagnosis?: string | null;
          medications?: string | null;
          treatment_plan?: string | null;
          next_visit_date?: string | null;
        };
        Update: Partial<{
          diagnosis: string | null;
          medications: string | null;
          treatment_plan: string | null;
          next_visit_date: string | null;
        }>;
        Relationships: [];
      };
      psychology_reports: {
        Row: {
          id: string;
          patient_file_id: string;
          author_id: string;
          behavioral_assessment: string | null;
          therapy_session_notes: string | null;
          mental_status: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          author_id: string;
          behavioral_assessment?: string | null;
          therapy_session_notes?: string | null;
          mental_status?: string | null;
        };
        Update: Partial<{
          behavioral_assessment: string | null;
          therapy_session_notes: string | null;
          mental_status: string | null;
        }>;
        Relationships: [];
      };
      academic_reports: {
        Row: {
          id: string;
          patient_file_id: string;
          author_id: string;
          academic_performance: string | null;
          school_behavior: string | null;
          attendance_status: string | null;
          educational_needs: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          author_id: string;
          academic_performance?: string | null;
          school_behavior?: string | null;
          attendance_status?: string | null;
          educational_needs?: string | null;
        };
        Update: Partial<{
          academic_performance: string | null;
          school_behavior: string | null;
          attendance_status: string | null;
          educational_needs: string | null;
        }>;
        Relationships: [];
      };
      medical_documents: {
        Row: {
          id: string;
          patient_file_id: string;
          uploaded_by: string;
          file_path: string;
          file_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_file_id: string;
          uploaded_by: string;
          file_path: string;
          file_name: string;
        };
        Update: never;
        Relationships: [];
      };
      donation_pledges: {
        Row: {
          id: string;
          support_request_id: string;
          donor_id: string;
          amount: number;
          message: string | null;
          status: PledgeStatus;
          created_at: string;
          fulfilled_at: string | null;
        };
        Insert: {
          id?: string;
          support_request_id: string;
          donor_id: string;
          amount: number;
          message?: string | null;
        };
        Update: Partial<{ status: PledgeStatus; fulfilled_at: string | null }>;
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
          required_amount: number | null;
          raised_amount: number;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}
