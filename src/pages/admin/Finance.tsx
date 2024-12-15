import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinanceHeader } from "@/components/finance/FinanceHeader";
import { FinanceStats } from "@/components/finance/FinanceStats";
import { SearchTransactions } from "@/components/finance/SearchTransactions";
import { FinanceTabs } from "@/components/finance/FinanceTabs";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 container px-4">
      <FinanceHeader />
      <FinanceStats />

      <div className="flex flex-col sm:flex-row gap-2">
        <SearchTransactions searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Button variant="outline" size="icon" className="w-full sm:w-auto">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <FinanceTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}