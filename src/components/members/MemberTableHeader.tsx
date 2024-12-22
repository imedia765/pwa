import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function MemberTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Member Number</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Password Status</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}