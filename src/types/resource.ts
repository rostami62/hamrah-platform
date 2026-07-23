export type ResourceCategory = "accommodation" | "ngo" | "charity";

export interface SupportResource {
  id: string;
  category: ResourceCategory;
  name: string;
  city: string;
  nearHospital?: string;
  description: string;
  accessNotes: string;
  contact?: {
    phone?: string;
    website?: string;
  };
  /** true تا زمانی که مددکار/ادمین داده‌ی واقعی را در فاز ۳ جایگزین کند. */
  isSampleData: boolean;
}
