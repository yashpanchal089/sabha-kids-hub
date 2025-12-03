import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, Filter, Loader2 } from "lucide-react";

interface Kid {
  id: string;
  registration_id: string;
  full_name: string;
  standard: number;
  age: number;
  school_name: string;
  father_phone: string;
  mother_phone: string;
  address: string | null;
}

export default function KidsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [standardFilter, setStandardFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");

  const { data: kids = [], isLoading } = useQuery({
    queryKey: ["kids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kids")
        .select("*")
        .order("registration_id", { ascending: true });
      if (error) throw error;
      return data as Kid[];
    },
  });

  // Get unique schools for filter
  const schools = [...new Set(kids.map((k) => k.school_name))];

  // Filter kids
  const filteredKids = kids.filter((kid) => {
    const matchesSearch = kid.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStandard =
      standardFilter === "all" || kid.standard.toString() === standardFilter;
    const matchesSchool =
      schoolFilter === "all" || kid.school_name === schoolFilter;
    return matchesSearch && matchesStandard && matchesSchool;
  });

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-heading">
                    Registered Kids
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredKids.length} of {kids.length} kids
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-styled pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={standardFilter} onValueChange={setStandardFilter}>
                  <SelectTrigger className="w-[140px] input-styled">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Standards</SelectItem>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Standard {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                  <SelectTrigger className="w-[180px] input-styled">
                    <SelectValue placeholder="School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredKids.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No kids found</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead>Reg ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead className="text-center">Std</TableHead>
                      <TableHead className="text-center">Age</TableHead>
                      <TableHead className="hidden md:table-cell">
                        School
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Father Phone
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Mother Phone
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKids.map((kid, index) => (
                      <TableRow
                        key={kid.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
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
                        <TableCell className="text-center">{kid.age}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {kid.school_name}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {kid.father_phone}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {kid.mother_phone}
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
