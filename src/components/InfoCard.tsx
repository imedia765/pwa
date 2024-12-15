import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <Card className="animate-fade-in hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="space-y-1 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent break-words">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 text-left">
        {children}
      </CardContent>
    </Card>
  );
}