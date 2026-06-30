export type User = {
  id: number;
  name: string;
  email: string;
  is_premium?: boolean;
};

export type SubscriptionStatus = {
  is_premium: boolean;
  product_id: string;
  subscription: null | {
    id: number;
    platform: string;
    product_id: string;
    expires_at: string | null;
    status: string;
  };
};

export type CareRecipient = {
  id: number;
  user_id: number;
  name: string;
  relationship: string | null;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Medication = {
  id: number;
  care_recipient_id: number;
  name: string;
  dosage: string | null;
  instructions: string | null;
  times_of_day: string[] | null;
  frequency: 'daily' | 'weekly' | 'as_needed';
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CareTeamMember = {
  id: number;
  care_recipient_id: number;
  user_id: number | null;
  invited_email: string | null;
  role: 'owner' | 'member';
  accepted_at: string | null;
  user?: { id: number; name: string; email: string } | null;
};

/** A pending invitation addressed to the current user (from GET /invitations). */
export type TeamInvitation = {
  id: number;
  care_recipient_id: number;
  invited_email: string | null;
  role: string;
  accepted_at: string | null;
  care_recipient?: {
    id: number;
    name: string;
    user?: { id: number; name: string } | null;
  } | null;
};

export type Explanation = {
  id: number;
  care_recipient_id: number | null;
  prompt: string | null;
  response: string;
  image_url: string | null;
  language: string;
  created_at: string;
};

export type Appointment = {
  id: number;
  care_recipient_id: number;
  title: string;
  doctor: string | null;
  location: string | null;
  scheduled_at: string;
  suggested_questions: string[] | null;
  summary: string | null;
  recording_path: string | null;
  created_at: string;
};

export type Document = {
  id: number;
  care_recipient_id: number;
  user_id: number;
  title: string;
  type: string | null;
  file_path: string;
  mime: string | null;
  size: number | null;
  notes: string | null;
  created_at: string;
};

export type MedicationLog = {
  id: number;
  medication_id: number;
  user_id: number;
  status: 'taken' | 'skipped' | 'missed';
  taken_at: string;
  notes: string | null;
};
