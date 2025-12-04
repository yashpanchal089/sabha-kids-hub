import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sabha_name: "",
    karyakar_number: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sabha_name || !form.karyakar_number || !form.username || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Check if username exists
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", form.username)
        .limit(1);
      if (existing && existing.length > 0) {
        toast.error("Username already exists");
        return;
      }

      // For demo, store password in a simple field; in production, store a salted hash server-side
      const { error } = await supabase.from("users").insert({
        sabha_name: form.sabha_name,
        karyakar_number: form.karyakar_number,
        username: form.username,
        password_hash: form.password,
      } as any);
      if (error) throw error;

      toast.success("Account created. Please login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-heading">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sabha_name">Sabha Name</Label>
                <Input id="sabha_name" name="sabha_name" value={form.sabha_name} onChange={onChange} className="input-styled" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="karyakar_number">Karyakar Number</Label>
                <Input id="karyakar_number" name="karyakar_number" value={form.karyakar_number} onChange={onChange} className="input-styled" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={form.username} onChange={onChange} className="input-styled" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={onChange} className="input-styled" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Re-enter Password</Label>
                <Input id="confirm" name="confirm" type="password" value={form.confirm} onChange={onChange} className="input-styled" />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? "Signing up..." : "Create Account"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account? <Link to="/login" className="underline">Login</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
