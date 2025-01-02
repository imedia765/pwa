export interface Profile {
  id: string;
  auth_user_id: string;
  member_number: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  marital_status: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  town: string | null;
  status: string | null;
  membership_type: string | null;
  created_at: string;
  updated_at: string;
}