-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.generate_kid_registration_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.registration_id := 'KID' || LPAD(nextval('public.kid_registration_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;