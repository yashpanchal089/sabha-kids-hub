import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, password_hash, sabha_name, karyakar_number")
        .eq("username", form.username)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast.error("Invalid username or password");
        return;
      }
      // Simple client-side password check. For production use a proper auth.
      if (data.password_hash !== form.password) {
        toast.error("Invalid username or password");
        return;
      }
      localStorage.setItem(
        "authUser",
        JSON.stringify({ id: data.id, username: data.username, sabha_name: data.sabha_name })
      );
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-heading">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={form.username} onChange={onChange} className="input-styled" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={onChange} className="input-styled" />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account? <Link to="/signup" className="underline">Sign up</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
