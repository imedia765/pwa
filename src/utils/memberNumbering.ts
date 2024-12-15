interface CollectorPrefix {
  name: string;
  prefix: string;
  number: string;
}

// Mapping of collectors to their prefixes
const collectorPrefixes: CollectorPrefix[] = [
  { name: "Anjum Riaz", prefix: "AR", number: "01" },
  { name: "Sajid M", prefix: "SM", number: "02" },
  { name: "Saleem Raza", prefix: "SR", number: "03" },
  { name: "Asif R-Nadeem", prefix: "AN", number: "04" },
  { name: "Faisal", prefix: "F", number: "05" },
  { name: "Azhar Gaf", prefix: "AG", number: "06" }
];

export const getCollectorPrefix = (collectorName: string): CollectorPrefix | undefined => {
  return collectorPrefixes.find(c => c.name === collectorName);
};

export const generateMemberNumber = (collector: string, sequence: number): string => {
  const collectorInfo = getCollectorPrefix(collector);
  if (!collectorInfo) {
    console.warn(`No prefix found for collector: ${collector}`);
    return `XX${String(sequence).padStart(5, '0')}`;
  }
  return `${collectorInfo.prefix}${collectorInfo.number}${String(sequence).padStart(3, '0')}`;
};