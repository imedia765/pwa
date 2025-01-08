import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Table } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateCSVContent, generateTSVContent } from "@/utils/exportFormatters";

interface DownloadButtonsProps {
  members: Member[];
  collectorName?: string;
}

const DownloadButtons = ({ members, collectorName }: DownloadButtonsProps) => {
  const { toast } = useToast();

  const downloadExcel = async () => {
    try {
      const csvContent = generateCSVContent(members);
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
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

  const downloadCSV = async () => {
    try {
      const csvContent = generateCSVContent(members);
      const blob = new Blob([csvContent], { type: 'text/csv' });
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

  const openInGoogleSheets = () => {
    try {
      const tsvContent = generateTSVContent(members);
      const encodedData = encodeURIComponent(tsvContent);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2 bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
          disabled={!members.length}
        >
          <Download className="w-4 h-4" />
          Download As
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={downloadExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadCSV}>
          <Table className="w-4 h-4 mr-2" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openInGoogleSheets}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Open in Google Sheets
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadButtons;