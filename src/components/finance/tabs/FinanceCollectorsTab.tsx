import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const collectors = [
  { id: 1, name: "Anjum Riaz", members: 161 },
  { id: 2, name: "Zabbie", members: 116 },
];

export function FinanceCollectorsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collector Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input placeholder="Search collectors..." className="max-w-sm" />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collector</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Total Collections</TableHead>
                <TableHead>This Month</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>{collector.name}</TableCell>
                  <TableCell>{collector.members}</TableCell>
                  <TableCell>£{(Math.random() * 10000).toFixed(2)}</TableCell>
                  <TableCell>£{(Math.random() * 1000).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}