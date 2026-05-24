
-- 1. Remove permissive UPDATE policy on conversations
DROP POLICY IF EXISTS conversations_public_update ON public.conversations;

-- 2. Restrict site_settings public read (server fn uses admin client to expose safe fields)
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;

-- 3. Remove broad storage listing policy on dona-dora bucket (public URLs still work for public buckets)
DROP POLICY IF EXISTS dona_dora_public_read ON storage.objects;

-- 4. Lock down SECURITY DEFINER functions: revoke EXECUTE from anon/authenticated/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
