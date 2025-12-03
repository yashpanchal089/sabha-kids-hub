import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, Filter, Loader2, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const [viewKid, setViewKid] = useState<Kid | null>(null);
  const [editKid, setEditKid] = useState<Kid | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    standard: "",
    age: "",
    school_name: "",
    father_phone: "",
    mother_phone: "",
    address: "",
  });
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: async (kidId: string) => {
      const { error } = await supabase.from("kids").delete().eq("id", kidId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kids"] });
      toast.success("Kid deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete kid");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Kid> }) => {
      const { error } = await supabase
        .from("kids")
        .update({
          full_name: data.full_name,
          standard: data.standard,
          age: data.age,
          school_name: data.school_name,
          father_phone: data.father_phone,
          mother_phone: data.mother_phone,
          address: data.address ?? null,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kids"] });
      toast.success("Kid updated successfully");
      setEditKid(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update kid");
    },
  });

  const openEdit = (kid: Kid) => {
    setEditKid(kid);
    setEditForm({
      full_name: kid.full_name || "",
      standard: kid.standard?.toString() || "",
      age: kid.age?.toString() || "",
      school_name: kid.school_name || "",
      father_phone: kid.father_phone || "",
      mother_phone: kid.mother_phone || "",
      address: kid.address || "",
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKid) return;
    updateMutation.mutate({
      id: editKid.id,
      data: {
        full_name: editForm.full_name,
        standard: editForm.standard ? parseInt(editForm.standard) : undefined,
        age: editForm.age ? parseInt(editForm.age) : undefined,
        school_name: editForm.school_name,
        father_phone: editForm.father_phone,
        mother_phone: editForm.mother_phone,
        address: editForm.address || null,
      },
    });
  };

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
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setViewKid(kid)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(kid)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteMutation.isPending}
                              onClick={() => deleteMutation.mutate(kid.id)}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={!!viewKid} onOpenChange={(open) => !open && setViewKid(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kid Details</DialogTitle>
            </DialogHeader>
            {viewKid && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-muted-foreground">Reg ID:</span> {viewKid.registration_id}</p>
                  <p><span className="text-muted-foreground">Name:</span> {viewKid.full_name}</p>
                  <p><span className="text-muted-foreground">Standard:</span> {viewKid.standard}</p>
                  <p><span className="text-muted-foreground">Age:</span> {viewKid.age}</p>
                  <p className="col-span-2"><span className="text-muted-foreground">School:</span> {viewKid.school_name}</p>
                  <p><span className="text-muted-foreground">Father:</span> {viewKid.father_phone}</p>
                  <p><span className="text-muted-foreground">Mother:</span> {viewKid.mother_phone}</p>
                </div>
                {viewKid.address && (
                  <div>
                    <p className="text-muted-foreground">Address:</p>
                    <p>{viewKid.address}</p>
                  </div>
                )}
            </div>
            )}
            <DialogFooter>
              <Button onClick={() => setViewKid(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editKid} onOpenChange={(open) => !open && setEditKid(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Kid</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={editForm.full_name} onChange={handleEditChange} className="input-styled" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standard">Standard</Label>
                  <Input id="standard" name="standard" type="number" min="1" max="12" value={editForm.standard} onChange={handleEditChange} className="input-styled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" min="1" max="20" value={editForm.age} onChange={handleEditChange} className="input-styled" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school_name">School Name</Label>
                <Input id="school_name" name="school_name" value={editForm.school_name} onChange={handleEditChange} className="input-styled" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="father_phone">Father's Phone</Label>
                  <Input id="father_phone" name="father_phone" value={editForm.father_phone} onChange={handleEditChange} className="input-styled" maxLength={10} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_phone">Mother's Phone</Label>
                  <Input id="mother_phone" name="mother_phone" value={editForm.mother_phone} onChange={handleEditChange} className="input-styled" maxLength={10} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={editForm.address} onChange={handleEditChange} className="input-styled min-h-[80px] resize-none" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditKid(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
