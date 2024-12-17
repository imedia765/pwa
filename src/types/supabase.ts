export interface Database {
  public: {
    Tables: {
      registrations: {
        Row: {
          id: string;
          member_id: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [{
          foreignKeyName: "registrations_member_id_fkey";
          columns: ["member_id"];
          isOneToOne: false;
          referencedRelation: "members";
          referencedColumns: ["id"];
        }];
      };
      members: {
        Row: {
          id: string;
          member_number: string;
          collector_id: string | null;
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
          verified: boolean | null;
          created_at: string;
          updated_at: string;
          membership_type: string | null;
          collector: string | null;
          cors_enabled: boolean | null;
        };
      };
      // Add other tables as needed
    };
  };
}