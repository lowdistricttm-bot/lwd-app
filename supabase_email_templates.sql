-- Tabella per i template email
CREATE TABLE public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT UNIQUE NOT NULL, -- 'approval' o 'rejection'
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere (per le funzioni), solo Admin/Staff possono modificare
CREATE POLICY "Public read email templates" ON public.email_templates FOR SELECT USING (true);
CREATE POLICY "Admin manage email templates" ON public.email_templates
FOR ALL TO authenticated USING (
  ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ANY (ARRAY['admin'::text, 'staff'::text]))
);

-- Inserimento template predefiniti
INSERT INTO public.email_templates (type, subject, body) VALUES 
('approval', 'Candidatura Approvata - Low District', 'Ciao {{user_name}},\n\nSiamo felici di comunicarti che il tuo progetto per l''evento {{event_title}} è stato APPROVATO!\n\nEcco i dettagli logistici per la partecipazione...\n\nCi vediamo nel District!'),
('rejection', 'Aggiornamento Candidatura - Low District', 'Ciao {{user_name}},\n\nTi ringraziamo per aver inviato la tua candidatura per {{event_title}}.\n\nPurtroppo per questa edizione non siamo riusciti a includere il tuo progetto. Ti invitiamo a continuare a seguirci e a candidarti per i prossimi eventi!\n\nA presto.');