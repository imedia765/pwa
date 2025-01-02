export type UserRole = 'member' | 'collector' | 'admin';

export interface MemberRole {
  id: string;
  profile_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}