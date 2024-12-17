import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, DollarSign } from "lucide-react";

export function QuickActions() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
            <Users className="h-6 w-6 mb-2" />
            Export Member List
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
            <ClipboardList className="h-6 w-6 mb-2" />
            Review Pending Applications
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
            <DollarSign className="h-6 w-6 mb-2" />
            Financial Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}