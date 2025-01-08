import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateMembersPDF, generateCollectorZip } from '@/utils/pdfGenerator';
import PDFGenerationProgress from "./PDFGenerationProgress";
import { Database } from '@/integrations/supabase/types';
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Table } from "lucide-react";

type Member = Database['public']['Tables']['members']['Row'];

interface PrintButtonsProps {
  allMembers?: Member[] | undefined;
  collectorName?: string;
  onGenerateStart?: () => void;
  onGenerateComplete?: () => void;
}

const BATCH_SIZE = 100;

const PrintButtons = ({ 
  allMembers, 
  collectorName,
  onGenerateStart,
  onGenerateComplete 
}: PrintButtonsProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, collector: '' });

  const fetchMembersInBatches = async (name: string) => {
    let allCollectorMembers: Member[] = [];
    let hasMore = true;
    let page = 0;

    while (hasMore) {
      const { data: collectorMembers, error } = await supabase
        .from('members')
        .select('*')
        .eq('collector', name)
        .order('member_number', { ascending: true })
        .range(page * BATCH_SIZE, (page + 1) * BATCH_SIZE - 1);
      
      if (error) throw error;

      if (collectorMembers && collectorMembers.length > 0) {
        allCollectorMembers = [...allCollectorMembers, ...collectorMembers];
        page++;
        hasMore = collectorMembers.length === BATCH_SIZE;
        console.log(`Fetched batch ${page} for ${name}, total: ${allCollectorMembers.length}`);
      } else {
        hasMore = false;
      }
    }

    return allCollectorMembers;
  };

  const handlePrintAll = async () => {
    if (!allMembers) {
      toast({
        title: "Error",
        description: "No members data available to print",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      onGenerateStart?.();

      await generateCollectorZip(allMembers, (current, total, collector) => {
        setProgress({ current, total, collector });
        console.log(`Processing collector ${collector} (${current}/${total})`);
      });

      toast({
        title: "Success",
        description: "ZIP file with all collector reports generated successfully",
      });
    } catch (error) {
      console.error('Error generating ZIP:', error);
      toast({
        title: "Error",
        description: "Failed to generate ZIP file",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      onGenerateComplete?.();
    }
  };

  const handlePrintCollector = async (name: string) => {
    try {
      console.log(`Fetching members for collector: ${name}`);
      const allCollectorMembers = await fetchMembersInBatches(name);

      if (!allCollectorMembers.length) {
        toast({
          title: "Error",
          description: "No members found for this collector",
          variant: "destructive",
        });
        return;
      }

      console.log(`Generating PDF for ${name} with ${allCollectorMembers.length} members`);
      const doc = generateMembersPDF(allCollectorMembers, `Members List - Collector: ${name}`);
      doc.save();
      toast({
        title: "Success",
        description: "PDF report generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const downloadExcel = async (members: Member[]) => {
    try {
      // Create Excel-compatible CSV content
      const headers = Object.keys(members[0] || {}).join(',');
      const rows = members.map(row => 
        Object.values(row).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      // Create and trigger download
      const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectorName || 'all'}-members.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Excel File Downloaded",
        description: "The Excel file has been downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the Excel file",
        variant: "destructive",
      });
    }
  };

  const downloadCSV = async (members: Member[]) => {
    try {
      const headers = Object.keys(members[0] || {}).join(',');
      const rows = members.map(row => 
        Object.values(row).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectorName || 'all'}-members.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "CSV File Downloaded",
        description: "The CSV file has been downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the CSV file",
        variant: "destructive",
      });
    }
  };

  const openInGoogleSheets = (members: Member[]) => {
    try {
      const headers = Object.keys(members[0] || {}).join('\t');
      const rows = members.map(row => 
        Object.values(row).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        ).join('\t')
      );
      const tsv = [headers, ...rows].join('\n');
      
      const encodedData = encodeURIComponent(tsv);
      const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/create?usp=sharing&content=${encodedData}`;
      
      window.open(googleSheetsUrl, '_blank');

      toast({
        title: "Opening Google Sheets",
        description: "The data will open in a new Google Sheets document",
      });
    } catch (error) {
      console.error('Google Sheets error:', error);
      toast({
        title: "Error",
        description: "Failed to open in Google Sheets",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {isGenerating && (
        <PDFGenerationProgress 
          current={progress.current}
          total={progress.total}
          currentCollector={progress.collector}
        />
      )}
      
      {collectorName ? (
        <div className="flex gap-2">
          <Button
            onClick={() => handlePrintCollector(collectorName)}
            className="flex items-center gap-2 bg-dashboard-accent2 hover:bg-dashboard-accent2/80"
            disabled={isGenerating}
          >
            <Printer className="w-4 h-4" />
            Print Members
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex items-center gap-2 bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
                disabled={!allMembers?.length}
              >
                <Download className="w-4 h-4" />
                Download As
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => allMembers && downloadExcel(allMembers)}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => allMembers && downloadCSV(allMembers)}>
                <Table className="w-4 h-4 mr-2" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => allMembers && openInGoogleSheets(allMembers)}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Open in Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            onClick={handlePrintAll}
            className="flex items-center gap-2 bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
            disabled={isGenerating}
          >
            <Printer className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Print All Members'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex items-center gap-2 bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
                disabled={!allMembers?.length}
              >
                <Download className="w-4 h-4" />
                Download As
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => allMembers && downloadExcel(allMembers)}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => allMembers && downloadCSV(allMembers)}>
                <Table className="w-4 h-4 mr-2" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => allMembers && openInGoogleSheets(allMembers)}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Open in Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default PrintButtons;