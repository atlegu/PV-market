# PV Market - Deployment Guide

## Oversikt
PV Market bruker:
- **Frontend**: React + TypeScript + Vite (hostet på Vercel)
- **Backend**: Supabase (Database + Auth + Realtime)
- **Styling**: Tailwind CSS

## Steg 1: Sett opp Supabase

### 1.1 Opprett Supabase-prosjekt
1. Gå til [supabase.com](https://supabase.com) og opprett en konto
2. Opprett et nytt prosjekt
3. Noter ned:
   - Project URL (f.eks. `https://xxxxx.supabase.co`)
   - Anon/Public API Key

### 1.2 Sett opp database
1. Gå til SQL Editor i Supabase Dashboard
2. Kjør SQL-skriptet fra `supabase/schema.sql`
3. Verifiser at tabellene er opprettet:
   - `poles`
   - `user_profiles`
   - `pole_requests`
   - `saved_searches`

### 1.3 Konfigurer Authentication
1. Gå til Authentication > Providers
2. Aktiver Email/Password authentication
3. (Valgfritt) Aktiver Google OAuth:
   - Følg instruksjonene for å sette opp Google OAuth
   - Legg til redirect URL: `https://din-app.vercel.app/auth/callback`

### 1.4 Konfigurer Storage (valgfritt)
Hvis du vil støtte bildeopplasting:
1. Gå til Storage
2. Opprett en bucket kalt `pole-images`
3. Sett den til public eller konfigurer RLS policies

## Steg 2: Forbered prosjektet for deployment

### 2.1 Opprett `.env.local` fil
```bash
cp .env.example .env.local
```

### 2.2 Rediger `.env.local` med dine Supabase-detaljer:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=din-anon-key-her
```

### 2.3 Test lokalt
```bash
npm install
npm run dev:vercel
```

Besøk http://localhost:5173 og verifiser at:
- Du kan registrere en ny bruker
- Du kan logge inn
- Du kan se poles (hvis det finnes noen)

## Steg 3: Deploy til Vercel

### 3.1 Push koden til GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 3.2 Koble til Vercel
1. Gå til [vercel.com](https://vercel.com)
2. Opprett konto/logg inn
3. Klikk "Add New Project"
4. Importer ditt GitHub repository

### 3.3 Konfigurer miljøvariabler i Vercel
I Vercel Dashboard:
1. Gå til Project Settings > Environment Variables
2. Legg til:
   - `VITE_SUPABASE_URL`: Din Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Din Supabase Anon Key

### 3.4 Deploy
1. Vercel vil automatisk detektere `vercel.json` konfigurasjonen
2. Klikk "Deploy"
3. Vent på at build fullføres

## Steg 4: Post-deployment

### 4.1 Oppdater Supabase redirect URLs
1. Gå tilbake til Supabase Dashboard
2. Under Authentication > URL Configuration
3. Legg til din Vercel URL til:
   - Site URL: `https://din-app.vercel.app`
   - Redirect URLs: `https://din-app.vercel.app/auth/callback`

### 4.2 Test produksjon
1. Besøk din Vercel URL
2. Test all funksjonalitet:
   - Registrering
   - Innlogging
   - CRUD-operasjoner på poles
   - Søkefunksjonalitet

## Feilsøking

### Problem: "Missing Supabase environment variables"
**Løsning**: Sjekk at miljøvariablene er satt riktig i Vercel Dashboard

### Problem: Authentication fungerer ikke
**Løsning**: 
- Verifiser at redirect URLs er konfigurert i Supabase
- Sjekk at Email/Password provider er aktivert

### Problem: Database queries feiler
**Løsning**:
- Sjekk Row Level Security (RLS) policies
- Verifiser at tabellene er opprettet korrekt
- Se på Supabase logs for feilmeldinger

### Problem: Build feiler på Vercel
**Løsning**:
- Kjør `npm run build:vercel` lokalt for å se feil
- Sjekk TypeScript errors med `npx tsc`
- Se på Vercel build logs

## Vedlikehold

### Oppdatere database schema
1. Lag migrasjonsfiler i `supabase/migrations/`
2. Kjør migrasjoner via Supabase Dashboard SQL Editor

### Overvåke applikasjonen
- Vercel Dashboard: Se deployment logs og analytics
- Supabase Dashboard: Se database metrics og logs

## Sikkerhet

- **Aldri** commit `.env.local` til Git
- Bruk Supabase RLS policies for å sikre data
- Aktiver 2FA på både GitHub og Vercel kontoer
- Roter API keys regelmessig

## Support

For problemer med:
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Prosjekt-spesifikt**: Opprett issue på GitHub