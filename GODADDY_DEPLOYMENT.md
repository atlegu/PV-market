# GoDaddy Deployment Guide for PV Market

## ✅ Forutsetninger
- GoDaddy Shared Hosting konto
- FTP-tilgang til din GoDaddy hosting
- Supabase backend allerede konfigurert

## 📋 Steg-for-steg deployment

### 1. Bygg applikasjonen lokalt
```bash
npm run build:godaddy
```

Eller bruk det automatiske scriptet:
```bash
npm run deploy:godaddy
```

### 2. FTP-opplasting

#### FTP-innstillinger (finn disse i GoDaddy cPanel):
- **Host**: ftp.yourdomain.com eller IP-adresse fra GoDaddy
- **Username**: Din FTP-bruker
- **Password**: Ditt FTP-passord  
- **Port**: 21 (standard)

#### Filer som skal lastes opp:
Last opp ALT innhold fra `dist/` mappen til:
- `public_html/` (for hoveddomeneet)
- eller `public_html/subdomain/` (for subdomene)

**VIKTIG**: Sørg for at `.htaccess` filen også lastes opp (kan være skjult i FTP-klienten)

### 3. Verifiser deployment

Etter opplasting, sjekk at:
1. Hjemmesiden laster korrekt
2. React Router fungerer (test forskjellige ruter)
3. Supabase-tilkobling fungerer

## 🔧 Feilsøking

### Problem: "404 Not Found" på React-ruter
**Løsning**: Sjekk at `.htaccess` er lastet opp og at mod_rewrite er aktivert

### Problem: Supabase fungerer ikke
**Løsning**: Verifiser at miljøvariablene i `.env` er korrekte før build

### Problem: Blank side
**Løsning**: 
1. Sjekk browser console for feil
2. Verifiser at alle filer ble lastet opp
3. Sjekk at base URL er korrekt

## 📝 Oppdatere applikasjonen

For å oppdatere appen:
1. Gjør endringer lokalt
2. Kjør `npm run build:godaddy`
3. Last opp nye filer fra `dist/` via FTP
4. Tøm browser cache

## 🚀 Automatisering (valgfritt)

For å automatisere FTP-opplasting, kan du bruke verktøy som:
- `ftp-deploy` npm pakke
- GitHub Actions med FTP deploy
- FileZilla's site manager for rask tilkobling

## 📊 Overvåking

GoDaddy tilbyr grunnleggende statistikk i cPanel:
- Besøkstall
- Båndbreddebruk
- Feillogger (under Metrics → Errors)

## 🔒 Sikkerhet

1. Aktiver SSL-sertifikat i GoDaddy cPanel
2. Sett opp automatisk backup i cPanel
3. Hold Supabase API-nøkler sikre (aldri commit .env fil)