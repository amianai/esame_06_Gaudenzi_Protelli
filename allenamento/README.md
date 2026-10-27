# Allenamento · v0

App personale di allenamento a casa, pensata per una persona sola: iniziare ad allenarsi, non mollare e guidare meglio in moto (enduro).
È una web app installabile (PWA) per il Pixel. Funziona offline e i dati restano sul telefono.

Questa è la **v0**: un prototipo da usare per una settimana. Quello che non funziona diventa la base dei wireframe.

## Cosa fa

- **Oggi**: streak, obiettivo della settimana, allenamento del giorno con durata stimata, tasto **Inizia**.
- **Sessione**: pensata per il telefono appoggiato a 2-3 metri.
  - Nome dell'esercizio e numeri enormi, colore per categoria (Stretching, Mobilità, Enduro, Flex).
  - Esercizi a tempo e recuperi vanno avanti da soli. Per quelli a ripetizioni c'è un tasto **Fatto** enorme.
  - Lo schermo resta acceso. Se chiudi l'app, l'allenamento si riprende dalla home.
  - Per ogni esercizio: come si fa, perché serve in moto, link a un video.
- **Fine**: festa con coriandoli, streak aggiornata, "com'è andata?" facoltativo.
- **Giorno no**: prima propone la versione mini. Poi distingue:
  - spostare a un altro giorno, che non è saltare;
  - imprevisto, che usa il freeze;
  - "non mi va", che azzera la streak.
- **Giro in moto**: conta come allenamento, con diario della fatica per zona e "dopo quanti minuti si induriscono gli avambracci".
- **Storico**: calendario del mese, dettagli del giorno, eliminazione.
- **Scheda**: fasi e sessioni, con la scheda dettagliata di ogni esercizio.
- **Impostazioni**: bip e vibrazione a fine timer (spenti di default), backup e ripristino dei dati.
- **Dati di esempio**: circa 3 mesi simulati da caricare e togliere dalle impostazioni, per vedere l'app dopo un po' di uso. Sono segnati come "esempio" e non toccano i dati veri.

### Regole della streak

- Conta gli **allenamenti**, non i giorni: i giorni di riposo non la rompono.
- Ogni settimana (lunedì-domenica) ha un obiettivo, preso dalla fase della scheda. Se a fine settimana allenamenti + freeze sono meno dell'obiettivo, la streak si azzera.
- **1 freeze a settimana**, non si accumula, vale solo per gli imprevisti.
- Saltare perché "non mi va" azzera subito la streak.
- Giro in moto e versione mini contano come allenamento. Al massimo un allenamento al giorno.

La logica è in `src/lib/streak.ts`, con i test in `src/lib/streak.test.ts`.

## Cambiare la scheda

La scheda è scritta nel codice, perché l'app è fatta su misura per una persona:

- `src/data/exercises.ts`: la libreria degli esercizi (nome, categoria, a tempo o a ripetizioni, come si fa, perché).
- `src/data/plan.ts`: fasi (settimane, allenamenti a settimana, ordine delle sessioni) e sessioni (blocchi, giri, recuperi).

Quella di adesso è una **scheda di esempio**, presa dalla ricerca sull'enduro e senza attrezzi.

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # test della logica (vitest)
npm run lint
npm run build    # build di produzione in dist/
```

Stack: Vite, React, TypeScript, Tailwind CSS 4, componenti in stile shadcn/ui (Radix), Zustand (salvataggio in localStorage), vite-plugin-pwa.

I componenti in `src/components/ui` seguono il codice di shadcn/ui ma sono scritti a mano: da questo ambiente il registry di shadcn non era raggiungibile.
Si possono rigenerare con `npx shadcn@latest add <componente>` quando serve.

## Metterla sul Pixel

1. Su [vercel.com](https://vercel.com) importa questo repository da GitHub.
2. In **Root Directory** scegli `allenamento`. Il resto (Vite, `npm run build`, cartella `dist`) Vercel lo riconosce da solo.
3. Apri l'indirizzo dal Chrome del Pixel → menu ⋮ → **Aggiungi a schermata Home** / **Installa app**.

Vercel pubblica in produzione il branch principale. Gli altri branch ricevono un indirizzo di anteprima.

I dati sono legati all'indirizzo dell'app. Prima di cambiarlo (es. spostando l'app in un altro repository o dominio), fai **Scarica backup** dalle impostazioni e poi **Carica backup** nella nuova versione.

## Prossimi passi

- **v0.2**: riconoscimento con la videocamera (pose estimation sul telefono) per contare flessioni e squat. È un'aggiunta: l'app funziona anche senza.
- **v0.3**: voce. Tasto microfono verde, trascrizione e un modello AI con lo storico come contesto, che adatta la scheda entro limiti fissi. Serve un piccolo server per custodire la chiave API.
- Poi: dashboard dei progressi (test alle settimane 1, 4, 8 e 12, diario dei giri), omini o video degli esercizi, scheda vera.
