-- Create kids table with auto-generated registration ID
CREATE TABLE public.kids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  standard INTEGER NOT NULL CHECK (standard >= 1 AND standard <= 12),
  age INTEGER NOT NULL,
  school_name TEXT NOT NULL,
  father_phone TEXT NOT NULL CHECK (father_phone ~ '^\d{10}$'),
  mother_phone TEXT NOT NULL CHECK (mother_phone ~ '^\d{10}$'),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for registration IDs
CREATE SEQUENCE public.kid_registration_seq START 1;

-- Function to generate registration ID (KID001, KID002, etc.)
CREATE OR REPLACE FUNCTION public.generate_kid_registration_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.registration_id := 'KID' || LPAD(nextval('public.kid_registration_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate registration ID
CREATE TRIGGER set_kid_registration_id
  BEFORE INSERT ON public.kids
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_kid_registration_id();

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kid_id UUID NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(kid_id, attendance_date)
);

-- Enable Row Level Security (public access for this app)
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public access for this management system
CREATE POLICY "Allow public read on kids" ON public.kids FOR SELECT USING (true);
CREATE POLICY "Allow public insert on kids" ON public.kids FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on kids" ON public.kids FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on kids" ON public.kids FOR DELETE USING (true);

CREATE POLICY "Allow public read on attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert on attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on attendance" ON public.attendance FOR DELETE USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates on kids
CREATE TRIGGER update_kids_updated_at
  BEFORE UPDATE ON public.kids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();