export interface CleanMember {
  member_number?: string;
  full_name: string;
  address?: string;
  collector: string;
  email?: string;
  gender?: string;
  marital_status?: string;
  phone?: string;
  dateOfBirth?: string | null;
  postCode?: string;
  town?: string;
  verified?: boolean;
  notes?: string[];
}

export function transformMemberData(jsonData: any[]): CleanMember[] {
  return jsonData.map(item => {
    // Handle the new CSV format
    const name = item["Name"] || item.name;
    const address = item["Address"] || item.address;
    const collector = item["Collector"] || item.collector;
    const memberNo = item["Member No"] || item.member_number;

    // Create mock data for required fields
    const mockEmail = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const mockPhone = `07${Math.floor(Math.random() * 900000000 + 100000000)}`;
    const mockPostcode = `B${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const mockTown = 'Birmingham';

    return {
      member_number: memberNo,
      full_name: name,
      address: address,
      collector: collector?.trim() || '',
      email: mockEmail,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      marital_status: Math.random() > 0.5 ? 'Married' : 'Single',
      phone: mockPhone,
      dateOfBirth: null,
      postCode: mockPostcode,
      town: mockTown,
      verified: false,
      notes: []
    };
  });
}