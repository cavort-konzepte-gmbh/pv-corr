-- Grant additional permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.places TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Recreate policies with public schema specified
DROP POLICY IF EXISTS "places_select_policy" ON public.places;
DROP POLICY IF EXISTS "places_insert_policy" ON public.places;
DROP POLICY IF EXISTS "places_update_policy" ON public.places;
DROP POLICY IF EXISTS "places_delete_policy" ON public.places;

CREATE POLICY "places_select_policy"
  ON public.places FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "places_insert_policy"
  ON public.places FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "places_update_policy"
  ON public.places FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "places_delete_policy"
  ON public.places FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled but policies are properly applied
ALTER TABLE public.places DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;