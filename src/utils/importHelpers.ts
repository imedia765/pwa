import { supabase } from "@/integrations/supabase/client";
import { transformMemberForSupabase, transformCollectorForSupabase } from "@/utils/dataCleanup";

interface CsvData {
  collector: string;
  [key: string]: any;
}

export async function processCollectors(validData: CsvData[], userId: string) {
  const uniqueCollectors = [...new Set(validData.map(item => {
    // Handle both formats - direct collector field and Collector header
    return (item.Collector || item.collector)?.trim();
  }).filter(Boolean))];
  
  console.log('Processing collectors:', uniqueCollectors);
  
  const collectorIdMap = new Map<string, string>();

  for (const collectorName of uniqueCollectors) {
    try {
      console.log('Processing collector:', collectorName);
      
      // First try to find existing collector
      const { data: existingCollectors, error: selectError } = await supabase
        .from('collectors')
        .select('id, name')
        .or(`name.ilike.${collectorName},name.ilike.${collectorName.toLowerCase()}`);

      if (selectError) {
        console.error('Error finding collector:', selectError);
        continue;
      }

      if (existingCollectors && existingCollectors.length > 0) {
        collectorIdMap.set(collectorName, existingCollectors[0].id);
        console.log('Using existing collector:', { id: existingCollectors[0].id, name: collectorName });
        continue;
      }

      // If no existing collector, create new one
      // Generate prefix from collector name (first letters of each word)
      const prefix = collectorName
        .split(/\s+/)
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('');

      // Get the next available number for this prefix
      const { data: existingCollectorNumbers } = await supabase
        .from('collectors')
        .select('number')
        .ilike('prefix', prefix);

      const nextNumber = String(
        Math.max(0, ...existingCollectorNumbers?.map(c => parseInt(c.number)) || [0]) + 1
      ).padStart(2, '0');

      // Create the new collector
      const { data: newCollector, error: insertError } = await supabase
        .from('collectors')
        .insert({
          name: collectorName,
          prefix: prefix,
          number: nextNumber,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting collector:', insertError);
        continue;
      }

      collectorIdMap.set(collectorName, newCollector.id);
      console.log('Created new collector:', { id: newCollector.id, name: collectorName });
    } catch (error) {
      console.error(`Error processing collector ${collectorName}:`, error);
    }
  }

  return collectorIdMap;
}

export async function processMembers(validData: CsvData[], collectorIdMap: Map<string, string>, userId: string) {
  let processedCount = 0;
  const batchSize = 50; // Process members in smaller batches
  
  for (let i = 0; i < validData.length; i += batchSize) {
    const batch = validData.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(validData.length / batchSize)}`);
    
    for (const member of batch) {
      try {
        const collectorName = (member.Collector || member.collector)?.trim();
        if (!collectorName) {
          console.warn('Member has no collector:', member);
          continue;
        }

        const collectorId = collectorIdMap.get(collectorName);
        if (!collectorId) {
          console.error(`No collector ID found for ${collectorName}`);
          continue;
        }

        // Check for existing member
        const { data: existingMembers, error: selectError } = await supabase
          .from('members')
          .select('id')
          .eq('member_number', member.member_number);

        if (selectError) {
          console.error('Error checking existing member:', selectError);
          continue;
        }

        const memberData = transformMemberForSupabase(member);

        if (existingMembers && existingMembers.length > 0) {
          // Update existing member
          const { error: updateError } = await supabase
            .from('members')
            .update({
              ...memberData,
              collector_id: collectorId,
              collector: collectorName,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingMembers[0].id);

          if (updateError) {
            console.error('Error updating member:', updateError);
            continue;
          }
        } else {
          // Insert new member
          const { error: insertError } = await supabase
            .from('members')
            .insert({
              ...memberData,
              collector_id: collectorId,
              collector: collectorName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error inserting member:', insertError);
            continue;
          }
        }
        
        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount} members so far...`);
        }
      } catch (error) {
        console.error('Error processing member:', error);
      }
    }
    
    // Add a small delay between batches to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('Total members processed:', processedCount);
  return processedCount;
}