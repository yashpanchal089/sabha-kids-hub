import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarIcon, ClipboardCheck, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Kid {
  id: string;
  registration_id: string;
  full_name: string;
  standard: number;
}

interface AttendanceRecord {
  kidId: string;
  status: "present" | "absent" | null;
}

export default function MarkAttendance() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | null>>({});

  const formattedDate = format(date, "yyyy-MM-dd");

  // Fetch all kids
  const { data: kids = [], isLoading: kidsLoading } = useQuery({
    queryKey: ["kids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kids")
        .select("id, registration_id, full_name, standard")
        .order("registration_id", { ascending: true });
      if (error) throw error;
      return data as Kid[];
    },
  });

  // Check if attendance exists for this date
  const { data: existingAttendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance-check", formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("kid_id, status")
        .eq("attendance_date", formattedDate);
      if (error) throw error;
      return data;
    },
  });

  // Pre-fill attendance if exists
  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const existing: Record<string, "present" | "absent"> = {};
      existingAttendance.forEach((a) => {
        existing[a.kid_id] = a.status as "present" | "absent";
      });
      setAttendance(existing);
    } else {
      setAttendance({});
    }
  }, [existingAttendance]);

  const hasExistingAttendance = existingAttendance && existingAttendance.length > 0;

  // Save attendance mutation
  const mutation = useMutation({
    mutationFn: async () => {
      // Validate all kids have attendance marked
      const unmarkedKids = kids.filter((kid) => !attendance[kid.id]);
      if (unmarkedKids.length > 0) {
        throw new Error(
          `Please mark attendance for all kids. ${unmarkedKids.length} remaining.`
        );
      }

      // Delete existing attendance for this date if any
      if (hasExistingAttendance) {
        await supabase
          .from("attendance")
          .delete()
          .eq("attendance_date", formattedDate);
      }

      // Insert new attendance records
      const records = Object.entries(attendance).map(([kidId, status]) => ({
        kid_id: kidId,
        attendance_date: formattedDate,
        status: status!,
      }));

      const { error } = await supabase.from("attendance").insert(records);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-check"] });
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] });
      toast.success(
        hasExistingAttendance
          ? "Attendance updated successfully!"
          : "Attendance saved successfully!"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAttendanceChange = (kidId: string, status: "present" | "absent") => {
    setAttendance((prev) => ({ ...prev, [kidId]: status }));
  };

  const markedCount = Object.values(attendance).filter(Boolean).length;
  const presentCount = Object.values(attendance).filter((s) => s === "present").length;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                  <ClipboardCheck className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-heading">
                    Mark Attendance
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select date and mark attendance for all kids
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
            {/* Status Bar */}
            {hasExistingAttendance && (
              <div className="mb-4 p-3 rounded-xl bg-warning/10 border border-warning/30 text-warning-foreground">
                ⚠️ Attendance already exists for this date. You can update it.
              </div>
            )}

            <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-secondary">
              <span className="text-sm text-secondary-foreground">
                Marked: {markedCount} / {kids.length} | Present: {presentCount}
              </span>
              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || markedCount !== kids.length}
                className="btn-primary"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {hasExistingAttendance ? "Update" : "Save"} Attendance
                  </>
                )}
              </Button>
            </div>

            {/* Attendance Table */}
            {kidsLoading || attendanceLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : kids.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No kids registered yet. Please register kids first.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead>Reg ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead className="text-center">Std</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kids.map((kid, index) => (
                      <TableRow
                        key={kid.id}
                        className={cn(
                          "animate-fade-in",
                          attendance[kid.id] === "present" && "bg-success/5",
                          attendance[kid.id] === "absent" && "bg-destructive/5"
                        )}
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <TableCell className="font-medium text-primary">
                          {kid.registration_id}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {kid.full_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            {kid.standard}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <RadioGroup
                            value={attendance[kid.id] || ""}
                            onValueChange={(value) =>
                              handleAttendanceChange(
                                kid.id,
                                value as "present" | "absent"
                              )
                            }
                            className="flex justify-center"
                          >
                            <div className="flex items-center">
                              <RadioGroupItem
                                value="present"
                                id={`present-${kid.id}`}
                                className="border-success text-success"
                              />
                              <Label
                                htmlFor={`present-${kid.id}`}
                                className="sr-only"
                              >
                                Present
                              </Label>
                            </div>
                          </RadioGroup>
                        </TableCell>
                        <TableCell className="text-center">
                          <RadioGroup
                            value={attendance[kid.id] || ""}
                            onValueChange={(value) =>
                              handleAttendanceChange(
                                kid.id,
                                value as "present" | "absent"
                              )
                            }
                            className="flex justify-center"
                          >
                            <div className="flex items-center">
                              <RadioGroupItem
                                value="absent"
                                id={`absent-${kid.id}`}
                                className="border-destructive text-destructive"
                              />
                              <Label
                                htmlFor={`absent-${kid.id}`}
                                className="sr-only"
                              >
                                Absent
                              </Label>
                            </div>
                          </RadioGroup>
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
