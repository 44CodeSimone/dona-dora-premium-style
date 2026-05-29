-- Admin-only SELECT on site_settings (server-side reads continue via service role)
CREATE POLICY "site_settings_admin_select"
ON public.site_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to delete their own virtual try-on consent
CREATE POLICY "vtoc_self_delete"
ON public.virtual_try_on_consents
FOR DELETE
TO authenticated
USING (user_id = auth.uid());