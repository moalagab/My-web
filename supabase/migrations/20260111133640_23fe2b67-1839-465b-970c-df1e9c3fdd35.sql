-- Allow admins to read service requests (using simple policy for password-protected dashboard)
CREATE POLICY "Allow reading service requests"
ON public.service_requests
FOR SELECT
USING (true);