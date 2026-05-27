
DROP POLICY IF EXISTS wishlist_self_all ON public.wishlist;
CREATE POLICY wishlist_self_select ON public.wishlist
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY wishlist_self_insert ON public.wishlist
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY wishlist_self_delete ON public.wishlist
  FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS customer_profiles_self_all ON public.customer_profiles;
CREATE POLICY customer_profiles_self_select ON public.customer_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY customer_profiles_self_insert ON public.customer_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY customer_profiles_self_update ON public.customer_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
