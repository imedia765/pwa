import { Member } from "@/types/member";

export const formatMemberData = (members: Member[]) => {
  // Get all possible keys from members
  const allKeys = Array.from(
    new Set(members.flatMap(member => Object.keys(member)))
  );

  // Format each member's data, excluding empty/null values
  const formattedMembers = members.map(member => {
    const formattedMember: Record<string, string> = {};
    
    allKeys.forEach(key => {
      const value = member[key as keyof Member];
      if (value !== null && value !== undefined && value !== '') {
        formattedMember[key] = typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
      }
    });
    
    return formattedMember;
  });

  return {
    headers: allKeys,
    rows: formattedMembers
  };
};

export const generateCSVContent = (members: Member[]) => {
  const { headers, rows } = formatMemberData(members);
  const csvRows = rows.map(row => 
    headers.map(header => row[header] || '').join(',')
  );
  
  return [headers.join(','), ...csvRows].join('\n');
};

export const generateTSVContent = (members: Member[]) => {
  const { headers, rows } = formatMemberData(members);
  const tsvRows = rows.map(row => 
    headers.map(header => row[header] || '').join('\t')
  );
  
  return [headers.join('\t'), ...tsvRows].join('\n');
};