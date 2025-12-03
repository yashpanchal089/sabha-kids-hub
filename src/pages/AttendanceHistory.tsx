import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, History, Loader2, UserCheck, UserX, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceWithKid {
  id: string;
  status: string;
  kid_id: string;
  kids: {
    registration_id: string;
    full_name: string;
    standard: number;
  };
}

export default function AttendanceHistory() {
  const [date, setDate] = useState<Date>(new Date());
  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["attendance-history", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          status,
          kid_id,
          kids (
            registration_id,
            full_name,
            standard
          )
        `)
        .eq("attendance_date", formattedDate)
        .order("kid_id", { ascending: true });
      if (error) throw error;
      return data as unknown as AttendanceWithKid[];
    },
  });

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const totalCount = attendance.length;

  const presentPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                  <History className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-heading">
                    Attendance History
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    View attendance records by date
                  </p>
                </div>
              </div>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="input-styled w-[200px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold font-heading">{totalCount}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <UserCheck className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold font-heading text-success">
                      {presentCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <UserX className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold font-heading text-destructive">
                      {absentCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-info/10 border border-info/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <div className="h-5 w-5 flex items-center justify-center text-info font-bold text-sm">
                      %
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-2xl font-bold font-heading text-info">
                      {presentPercentage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No attendance records found for {format(date, "PPP")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead>Reg ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead className="text-center">Standard</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className={cn(
                          "animate-fade-in",
                          record.status === "present" && "bg-success/5",
                          record.status === "absent" && "bg-destructive/5"
                        )}
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <TableCell className="font-medium text-primary">
                          {record.kids.registration_id}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {record.kids.full_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            {record.kids.standard}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                              record.status === "present"
                                ? "bg-success/20 text-success"
                                : "bg-destructive/20 text-destructive"
                            )}
                          >
                            {record.status === "present" ? (
                              <>
                                <UserCheck className="h-4 w-4" />
                                Present
                              </>
                            ) : (
                              <>
                                <UserX className="h-4 w-4" />
                                Absent
                              </>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
