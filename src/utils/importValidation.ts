export interface ImportData {
  collector: string;
  name?: string;
  address?: string;
  "Member No"?: string;
  "Name"?: string;
  "Address"?: string;
  "Collector"?: string;
}

export const validateJsonData = (data: any[]): ImportData[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid JSON format: expected an array');
  }

  const validData = data.filter((item) => {
    if (typeof item !== 'object' || item === null) {
      console.log('Skipping invalid item:', item);
      return false;
    }
    
    // Check for required fields in both old and new format
    const hasCollector = item.collector || item.Collector;
    const hasName = item.name || item.Name || item.fullName;
    
    if (!hasCollector || !hasName) {
      console.log('Skipping item missing required fields:', item);
      return false;
    }

    return true;
  });

  if (validData.length === 0) {
    throw new Error('No valid data entries found');
  }

  return validData as ImportData[];
};