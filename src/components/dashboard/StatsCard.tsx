import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  trend: { value: string; positive: boolean } 
}

export function StatsCard({ icon, title, value, trend }: StatsCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`flex items-center text-sm ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.positive ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            {trend.value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}