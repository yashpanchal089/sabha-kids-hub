import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

export default function Index() {
  const { data: kidsCount = 0 } = useQuery({
    queryKey: ["kids-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("kids")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: todayStats } = useQuery({
    queryKey: ["today-attendance"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("attendance")
        .select("status")
        .eq("attendance_date", today);
      
      const present = data?.filter((a) => a.status === "present").length || 0;
      const absent = data?.filter((a) => a.status === "absent").length || 0;
      return { present, absent, total: present + absent };
    },
  });

  const stats = [
    {
      title: "Total Kids Registered",
      value: kidsCount,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Present Today",
      value: todayStats?.present || 0,
      icon: UserCheck,
      color: "bg-success/10 text-success",
    },
    {
      title: "Absent Today",
      value: todayStats?.absent || 0,
      icon: UserX,
      color: "bg-destructive/10 text-destructive",
    },
    {
      title: "Attendance Rate",
      value: todayStats?.total
        ? `${Math.round((todayStats.present / todayStats.total) * 100)}%`
        : "N/A",
      icon: TrendingUp,
      color: "bg-info/10 text-info",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-heading font-bold text-foreground">
            Welcome to Bal-Sabha
          </h1>
          <p className="text-lg text-muted-foreground">
            Adarsh Nagar Kids Sabha Management System
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={stat.title}
              className="card-elevated animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-heading">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Quick Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Register new kids for the weekly Sabha sessions.
              </p>
              <NavLink
                to="/register"
                className="btn-primary inline-flex items-center justify-center"
              >
                Register New Kid
              </NavLink>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Mark Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Record today's attendance for all registered kids.
              </p>
              <NavLink
                to="/attendance"
                className="btn-primary inline-flex items-center justify-center"
              >
                Mark Attendance
              </NavLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
