-- Create service_requests table for storing service request form submissions
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_category TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  budget TEXT,
  timeline TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public form)
CREATE POLICY "Anyone can submit service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_service_requests_created_at ON public.service_requests(created_at DESC);