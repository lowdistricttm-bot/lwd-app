-- Script per popolare l'Academy con contenuti tecnici di alta qualità
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Cerchiamo il primo admin disponibile per assegnare la paternità dei tutorial
    SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

    -- Se non c'è un admin, usiamo il primo profilo trovato o lasciamo NULL
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM public.profiles LIMIT 1;
    END IF;

    -- Pulizia (opzionale, rimuovi se vuoi mantenere i tutorial esistenti)
    -- DELETE FROM public.academy_tutorials;

    -- 1. Tutorial: Fender Rolling
    INSERT INTO public.academy_tutorials (author_id, title, category, image_url, content)
    VALUES (
        admin_id, 
        'GUIDA AL FENDER ROLLING (ROLLARE I PARAFANGHI)', 
        'bodywork', 
        'https://images.unsplash.com/photo-1486006396193-471e6158cc05?q=80&w=1000', 
        'Il fender rolling è essenziale per chi vuole abbassare l''auto senza che le gomme tocchino i passaruota. Ecco come farlo in sicurezza:

1. Pulizia: Lava accuratamente l''interno del passaruota. Lo sporco intrappolato tra il labbro e la lamiera può causare ruggine o deformazioni irregolari durante la piegatura.

2. Calore (Fondamentale): Questo è il passaggio più importante. Usa una pistola termica per scaldare la vernice finché non è calda al tatto (circa 50-60°C). Questo rende la vernice elastica e impedisce che si crepi o si scagli durante la piegatura.

3. Piegatura: Monta il fender roller sul mozzo e inizia con una pressione leggera. Fai oscillare il braccio avanti e indietro, aumentando gradualmente l''angolo di inclinazione del rullo ad ogni passaggio. Non avere fretta.

4. Protezione: Una volta finito, applica un protettivo per cavità o della cera specifica all''interno della piega per prevenire l''accumulo di umidità e sporco.'
    );

    -- 2. Tutorial: Air Suspension Maintenance
    INSERT INTO public.academy_tutorials (author_id, title, category, image_url, content)
    VALUES (
        admin_id, 
        'MANUTENZIONE IMPIANTO ARIA (AIR SUSPENSION)', 
        'air-suspension', 
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000', 
        'Un assetto a aria richiede cure specifiche per garantire affidabilità e durata nel tempo.

1. Scarico Condensa: L''aria compressa crea naturalmente umidità. Svuota il serbatoio tramite la valvola di scarico inferiore almeno una volta al mese. Questo evita la formazione di ruggine interna e previene malfunzionamenti delle elettrovalvole.

2. Controllo Perdite: Se noti che l''auto scende di livello durante la notte, hai una perdita. Prepara uno spruzzino con acqua e sapone per piatti e spruzzalo su tutti i raccordi e i soffietti; le bolle ti indicheranno esattamente dove intervenire.

3. Protezione Invernale: Se vivi in zone dove le temperature scendono sotto lo zero, utilizza un additivo antigelo specifico per impianti pneumatici (Air Brake Antifreeze). Eviterà che l''umidità ghiacci bloccando le valvole.

4. Pulizia Soffietti: Quando lavi l''auto, alza l''assetto alla massima altezza e sciacqua bene i soffietti in gomma per rimuovere sabbia, sale o detriti stradali che potrebbero abradere la gomma nel tempo.'
    );

    -- 3. Tutorial: Camber Basics
    INSERT INTO public.academy_tutorials (author_id, title, category, image_url, content)
    VALUES (
        admin_id, 
        'GUIDA AL CAMBER NEGATIVO: LOOK E SICUREZZA', 
        'static', 
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000', 
        'Il camber è l''inclinazione della ruota rispetto alla verticale del terreno.

- Camber Negativo: La parte superiore della ruota rientra verso l''interno dell''auto. Nello stance è fondamentale per permettere a cerchi molto larghi di rientrare nel passaruota quando l''auto è bassa.

- Vantaggi: Migliore impronta a terra dello pneumatico esterno durante le curve veloci e un impatto visivo radicale.

- Rischi e Miti: Un camber eccessivo (oltre i -5/-7 gradi) riduce la superficie di contatto in frenata e accelera l''usura interna. Tuttavia, il vero "killer" delle gomme non è il camber, ma la convergenza (Toe) errata.

- Consiglio Pro: Dopo ogni regolazione del camber, è obbligatorio rifare l''allineamento completo (convergenza). Una convergenza a zero aiuterà a preservare la durata delle gomme anche con camber negativo.'
    );

    -- 4. Tutorial: Wheel Fitment
    INSERT INTO public.academy_tutorials (author_id, title, category, image_url, content)
    VALUES (
        admin_id, 
        'FITMENT 101: CAPIRE OFFSET (ET) E CANALE (J)', 
        'wheels', 
        'https://images.unsplash.com/photo-1611859328053-3cbc9f9399f4?q=80&w=1000', 
        'Scegliere le misure corrette dei cerchi è la scienza che sta dietro ad ogni progetto stance di successo.

- Canale (J): Indica la larghezza del cerchio espressa in pollici. Un canale più largo permette di montare gomme più larghe o di ottenere l''effetto "stretch" (gomma tirata) se si monta uno pneumatico più stretto del cerchio.

- Offset (ET): È la distanza in millimetri tra il centro esatto del cerchio e la superficie di appoggio sul mozzo dell''auto.

- La Regola d''Oro: Più il valore ET è basso (o addirittura negativo), più il cerchio sporgerà verso l''esterno della carrozzeria.

- Esempio Pratico: Se passi da un cerchio con ET45 a uno con ET35 (a parità di canale), la tua ruota si sposterà verso l''esterno di esattamente 10mm. Usa sempre un calibro prima di ordinare nuovi cerchi per evitare che tocchino l''ammortizzatore interno o il parafango esterno.'
    );
END $$;