-- Abilita il Realtime per la tabella messages se non è già attivo
begin;
  -- Rimuove la tabella dalla pubblicazione se esiste già per evitare duplicati
  alter publication supabase_realtime replica identity full;
  
  -- Aggiunge la tabella messages alla pubblicazione realtime
  alter publication supabase_realtime add table messages;
commit;