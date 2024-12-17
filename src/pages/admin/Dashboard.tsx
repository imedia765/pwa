import React from 'react';
import { Users, UserCheck, ClipboardList, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MembershipChart } from "@/components/dashboard/MembershipChart";
import { MembershipDistribution } from "@/components/dashboard/MembershipDistribution";
import { QuickActions } from "@/components/dashboard/QuickActions";

type Registration = Database['public']['Tables']['registrations']['Row'];
type Member = Database['public']['Tables']['members']['Row'];

export default function Dashboard() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeCollectors, setActiveCollectors] = useState(0);
  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [membershipTypeData, setMembershipTypeData] = useState<Array<{ name: string; value: number }>>([]);
  const [membershipData, setMembershipData] = useState<Array<{ month: string; members: number; revenue: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total members using count
        const { count: membersCount, error: membersError } = await supabase
          .from("members")
          .select('*', { count: 'exact', head: true });
        
        if (membersError) throw membersError;
        setTotalMembers(membersCount || 0);

        // Fetch active collectors
        const { data: collectorsData, error: collectorsError } = await supabase
          .from("collectors")
          .select("*", { count: 'exact' })
          .eq('active', true);
        if (collectorsError) throw collectorsError;
        setActiveCollectors(collectorsData.length);

        // Fetch pending registrations
        const { data: registrationsData, error: registrationsError } = await supabase
          .from("registrations")
          .select("*", { count: 'exact' })
          .eq('status', 'pending');
        if (registrationsError) throw registrationsError;
        setPendingRegistrations(registrationsData.length);

        // Fetch monthly revenue
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

        if (paymentsError) throw paymentsError;
        const totalRevenue = paymentsData.reduce((sum, payment) => sum + Number(payment.amount), 0);
        setMonthlyRevenue(totalRevenue);

        // Fetch membership type distribution
        const { data: membershipTypes, error: membershipTypesError } = await supabase
          .from('members')
          .select('membership_type');

        if (membershipTypesError) throw membershipTypesError;

        const typeCounts = membershipTypes.reduce((acc, curr) => {
          const type = curr.membership_type || 'standard';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const formattedMembershipTypeData = Object.entries(typeCounts).map(([name, value]) => ({
          name,
          value,
        }));
        setMembershipTypeData(formattedMembershipTypeData);

        // Fetch membership data for chart
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const monthlyData = [];
        for (let i = 0; i < 5; i++) {
          const month = new Date(currentYear, currentMonth - i);
          const monthName = month.toLocaleString('default', { month: 'short' });
          const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
          const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();

          const { data: monthlyMembers, error: monthlyMembersError } = await supabase
            .from('members')
            .select('*', { count: 'exact' })
            .gte('created_at', firstDayOfMonth)
            .lt('created_at', lastDayOfMonth);

          if (monthlyMembersError) throw monthlyMembersError;

          const { data: monthlyPayments, error: monthlyPaymentsError } = await supabase
            .from('payments')
            .select('amount')
            .gte('created_at', firstDayOfMonth)
            .lt('created_at', lastDayOfMonth);

          if (monthlyPaymentsError) throw monthlyPaymentsError;

          const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

          monthlyData.push({
            month: monthName,
            members: monthlyMembers.length,
            revenue: monthlyRevenue,
          });
        }
        setMembershipData(monthlyData.reverse());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button variant="outline" className="w-full">
            <TrendingUp className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button className="w-full">
            <Activity className="mr-2 h-4 w-4" />
            Quick Analysis
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          icon={<Users className="h-6 w-6" />} 
          title="Total Members" 
          value={totalMembers.toString()}
          trend={{ value: "+10%", positive: true }}
        />
        <StatsCard 
          icon={<UserCheck className="h-6 w-6" />} 
          title="Active Collectors" 
          value={activeCollectors.toString()}
          trend={{ value: "0%", positive: true }}
        />
        <StatsCard 
          icon={<ClipboardList className="h-6 w-6" />} 
          title="Pending Registrations" 
          value={pendingRegistrations.toString()}
          trend={{ value: "-25%", positive: false }}
        />
        <StatsCard 
          icon={<DollarSign className="h-6 w-6" />} 
          title="Monthly Revenue" 
          value={`£${monthlyRevenue.toFixed(2)}`}
          trend={{ value: "+12%", positive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MembershipChart data={membershipData} />
        <MembershipDistribution data={membershipTypeData} />
        <QuickActions />
      </div>
    </div>
  );
}
