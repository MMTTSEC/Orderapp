# Vite + React + Orchard Core REST API

En fullstack-applikation som kombinerar en modern React-frontend (Vite + TypeScript) med en Orchard Core CMS-backend som exponerar ett anpassat REST API med rollbaserade behörigheter.

## Funktioner

- 🔐 **Sessionsbaserad autentisering** - Logga in/ut/registrera med användarnamn/lösenord
- 🛡️ **Finmaskigt behörighetssystem** - Kontrollera API-åtkomst per användarroll, innehållstyp och HTTP-metod
- 🎨 **Dynamiskt admin-gränssnitt** - Förbättrad Orchard-admin med JavaScript-drivna fältredigerare
- 📦 **Seed-system** - Databasinitiering för enkel projektuppsättning och återställning
- ⚡ **REST API** - Fullständiga CRUD-operationer med relationsexpansion, filtrering, sortering och paginering

# Viktigt
Adminanvändarnamnet är "tom" med lösenordet "Abcd1234!"

## Snabbstart

1. **Installera beroenden**
   ```bash
   npm install
   ```

2. **Starta applikationen**
   ```bash
   npm start
   ```

   Detta kommer att:
   - Automatiskt återställa databasen från seed (endast första gången)
   - Starta Orchard Core-backend på http://localhost:5001
   - Starta Vite-dev-servern på http://localhost:5173

3. **Få åtkomst till applikationen**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5001/api
   - **Admin-gränssnitt**: http://localhost:5001/admin (användarnamn: `admin`, lösenord: `Password123!`)

## Autentiseringssystem

Backend använder **sessionsbaserad autentisering** (inte JWT). Användare måste logga in för att få sessionscookies, som sedan används för efterföljande förfrågningar.

### Logga in

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Password123!"
}
```

**Svar:**
```json
{
  "success": true,
  "username": "admin",
  "roles": ["Administrator"]
}
```

Servern sätter en sessionscookie (`.AspNetCore.Identity.Application`) som måste inkluderas i efterföljande förfrågningar.

### Hämta nuvarande användare

```bash
GET /api/auth/login
```

**Svar (autentiserad):**
```json
{
  "isAuthenticated": true,
  "username": "admin",
  "roles": ["Administrator"]
}
```

**Svar (inte autentiserad):**
```json
{
  "isAuthenticated": false,
  "username": null,
  "roles": ["Anonymous"]
}
```

### Logga ut

```bash
DELETE /api/auth/login
```

**Svar:**
```json
{
  "message": "Logged out successfully"
}
```

### Registrera

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "555-1234"
}
```

**Svar:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "555-1234",
  "role": "Customer",
  "message": "User created successfully"
}
```

Nya användare tilldelas automatiskt rollen **Customer**. Fälten `firstName`, `lastName` och `phone` är valfria.

## REST API

Applikationen tillhandahåller ett anpassat REST API för alla Orchard Core-innehållstyper. Alla endpoints (förutom autentisering) är skyddade av behörighetssystemet.

### Innehållstyp: Pet

#### Hämta alla husdjur

```bash
GET /api/Pet
```

**Svar:**
```json
[
  {
    "id": "4h72v3vvnffvzyjjyny8xgc2xz",
    "title": "Fido",
    "species": "dog",
    "ownerId": "4hef7jjdb26sdxshq3ddg87mm1"
  },
  {
    "id": "40sk48hnkka1tsfdkhhk6vprch",
    "title": "Garfield",
    "species": "cat",
    "ownerId": "4237v01g4sxw41mybx97wg6adf"
  }
]
```

#### Hämta enskilt husdjur

```bash
GET /api/Pet/4h72v3vvnffvzyjjyny8xgc2xz
```

**Svar:**
```json
{
  "id": "4h72v3vvnffvzyjjyny8xgc2xz",
  "title": "Fido",
  "species": "dog",
  "ownerId": "4hef7jjdb26sdxshq3ddg87mm1"
}
```

#### Skapa husdjur

```bash
POST /api/Pet
Content-Type: application/json

{
  "title": "Buddy",
  "species": "dog"
}
```

**Svar:**
```json
{
  "id": "4new1234example5678id",
  "title": "Buddy"
}
```

**Stödda fälttyper:**

När du skapar eller uppdaterar innehåll, använd **samma format** som du får från `GET /api/{contentType}` (inte råformatet från `/api/raw/{contentType}`). API:et packar automatiskt upp enfältsfält för renare JSON:

- **TextField** - Vanlig sträng: `"species": "dog"`
- **NumericField** - Vanligt nummer: `"age": 5`
- **BooleanField** - Vanlig boolean: `"isActive": true`
- **DateField** - ISO 8601-sträng: `"birthDate": "2020-01-15T00:00:00Z"`
- **DateTimeField** - ISO 8601-sträng: `"createdAt": "2025-10-28T10:30:00Z"`
- **HtmlField** - Vanlig HTML-sträng: `"description": "<p>A friendly dog</p>"`
- **MarkdownField** - Vanlig markdown-sträng: `"bio": "# Fido\nA good boy"`

Flerfältsfält (som LinkField och MediaField) skapas bäst genom admin-gränssnittet.

#### Uppdatera husdjur

```bash
PUT /api/Pet/4new1234example5678id
Content-Type: application/json

{
  "title": "Buddy Updated",
  "species": "wolf"
}
```

**Svar:**
```json
{
  "id": "4new1234example5678id",
  "title": "Buddy Updated"
}
```

**Obs:** PUT accepterar samma fältformat som POST (se Stödda fälttyper ovan).

#### Ta bort husdjur

```bash
DELETE /api/Pet/4new1234example5678id
```

**Svar:**
```json
{
  "message": "Item deleted successfully"
}
```

### API-endpoint-varianter

REST API:et tillhandahåller tre olika endpoint-varianter för GET-förfrågningar, var och en tjänar olika användningsområden:

#### Standardendpoints: `/api/{contentType}`
Ren, minimal JSON-struktur med endast de väsentliga fälten.

```bash
GET /api/Pet
GET /api/Pet/{id}
```

#### Expand-endpoints: `/api/expand/{contentType}`
Samma rena struktur, men med relationsfält automatiskt ifyllda.

```bash
GET /api/expand/Pet
GET /api/expand/Pet/{id}
```

#### Rå-endpoints: `/api/raw/{contentType}`
Returnerar den råa Orchard Core ContentItem-strukturen utan rensning eller ifyllning. Användbart för felsökning, avancerade frågor eller när du behöver åtkomst till Orchard Core-metadata.

```bash
GET /api/raw/Pet
GET /api/raw/Pet/{id}
```

**Rå-endpoint-svar inkluderar:**
- Fullständig ContentItem-struktur
- Orchard Core-metadata (ContentItemId, ContentItemVersionId, ContentType, etc.)
- All del- och fältdata i Orchards nativa format
- Publiceringsstatus, skapelse-/modifieringsdatum
- Visningstext och andra systemfält

**Obs:** Rå-endpoints stödjer alla frågeparametrar (where, orderby, limit, offset) precis som standardendpoints.

### Expandera relationer

För innehållstyper med relationer (som Pet → PetOwner) kan du expandera relaterat innehåll med hjälp av expand-endpoints.

#### Hämta husdjur med expanderad ägare

```bash
GET /api/expand/Pet
```

**Svar:**
```json
[
  {
    "id": "40sk48hnkka1tsfdkhhk6vprch",
    "title": "Garfield",
    "species": "cat",
    "ownerId": "4237v01g4sxw41mybx97wg6adf",
    "owner": {
      "id": "4237v01g4sxw41mybx97wg6adf",
      "title": "John Doe",
      "email": "john@example.com"
    }
  },
  {
    "id": "4h72v3vvnffvzyjjyny8xgc2xz",
    "title": "Fido",
    "species": "dog",
    "ownerId": "4hef7jjdb26sdxshq3ddg87mm1",
    "owner": {
      "id": "4hef7jjdb26sdxshq3ddg87mm1",
      "title": "Jane Smith",
      "email": "jane@example.com"
    }
  }
]
```

**Använda standardendpoint (ingen expansion):**
```bash
GET /api/Pet
```

Returnerar endast ägar-ID (relationen expanderas inte):
```json
[
  {
    "id": "40sk48hnkka1tsfdkhhk6vprch",
    "title": "Garfield",
    "species": "cat",
    "ownerId": "4237v01g4sxw41mybx97wg6adf"
  }
]
```

### Filtrering, sortering och paginering

REST API:et stödjer kraftfulla frågeparametrar för filtrering, sortering och paginering på alla GET-endpoints.

#### Filtrering med WHERE

Använd parametern `where` för att filtrera resultat. Stöder djupa egenskapssökvägar med punktnotation.

**Stödda operatorer:**
- `=` - Lika med
- `!=` - Inte lika med
- `>` - Större än
- `<` - Mindre än
- `>=` - Större än eller lika med
- `<=` - Mindre än eller lika med
- `LIKE` - Skiftlägesokänslig delsträng-matchning

**Exempel:**

```bash
# Filtrera efter art
GET /api/Pet?where=species=dog

# Filtrera med djup egenskapssökväg
GET /api/expand/Pet?where=owner.title=John Doe

# Flera villkor (använd AND)
GET /api/Pet?where=species=dog AND ownerId!=null

# LIKE för delsträng-matchning
GET /api/expand/Pet?where=owner.title LIKE Smith
```

#### Sortering med ORDER BY

Använd parametern `orderby` för att sortera resultat. Prefix med `-` för fallande ordning.

**Exempel:**

```bash
# Sortera efter titel (stigande)
GET /api/Pet?orderby=title

# Sortera efter titel (fallande)
GET /api/Pet?orderby=-title

# Flera sorteringsfält
GET /api/Pet?orderby=-species,title

# Sortera efter djup egenskapssökväg
GET /api/expand/Pet?orderby=owner.title
```

#### Paginering med LIMIT och OFFSET

Använd parametrarna `limit` och `offset` för paginering.

**Exempel:**

```bash
# Hämta första 10 objekten
GET /api/Pet?limit=10

# Hämta nästa 10 objekt (hoppa över första 10)
GET /api/Pet?limit=10&offset=10

# Offset utan limit (hoppa över första 5 objekten)
GET /api/Pet?offset=5
```

#### Kombinera frågeparametrar

Alla frågeparametrar kan kombineras för kraftfulla frågor:

```bash
# Filtrera hundar, sortera efter titel, paginera
GET /api/Pet?where=species=dog&orderby=title&limit=10&offset=0

# Filtrera efter ägarnamn med expansion, sortera och begränsa
GET /api/expand/Pet?where=owner.title LIKE Doe&orderby=-species&limit=5
```

**Komplext exempel:**

```bash
GET /api/expand/Pet?where=species=cat AND owner.email LIKE example.com&orderby=-title&limit=10&offset=0
```

Denna fråga:
1. Expanderar ägarrelationen
2. Filtrerar för katter vars ägares e-post innehåller "example.com"
3. Sorterar efter titel (fallande)
4. Returnerar 10 resultat, med start från det första

## Behörighetssystem

Åtkomst till REST-endpoints kontrolleras av **RestPermissions** - en anpassad innehållstyp som definierar vilka roller som kan utföra vilka HTTP-metoder på vilka innehållstyper.

### Hur det fungerar

1. **Varje API-förfrågan** (förutom auth) kontrollerar behörigheter innan bearbetning
2. Behörigheter definieras genom att skapa **RestPermissions-objekt** i admin-gränssnittet
3. Varje behörighet specificerar:
   - **Roller** - Vilka roller denna behörighet gäller för (kommaseparerade)
   - **Innehållstyper** - Vilka innehållstyper denna behörighet täcker (kommaseparerade)
   - **REST-metoder** - Vilka HTTP-metoder som är tillåtna (kryssrutor: GET, POST, PUT, DELETE)

### Exempel på behörighet

**Titel:** "Anonymous can view pets"
- **Roller:** `Anonymous`
- **Innehållstyper:** `Pet,PetOwner`
- **REST-metoder:** `GET`

Detta tillåter oautentiserade användare att läsa Pet- och PetOwner-data, men inte skapa, uppdatera eller ta bort.

### Specialfall

- **Anonymous-roll:** Alla användare (autentiserade eller inte) är i rollen `Anonymous`
- **Administrator-bypass:** Användare med rollen `Administrator` har alltid åtkomst till systemendpoints (`/api/system/*`)
- **Flera behörigheter:** Om en användare har flera roller får de de kombinerade behörigheterna från alla sina roller

### Hantera behörigheter

1. Logga in på admin-gränssnittet: http://localhost:5001/admin
2. Navigera till Content → Content Items
3. Skapa ett nytt **RestPermissions**-objekt
4. Använd det förbättrade gränssnittet med kryssrutor (automatiskt ifyllt från dina innehållstyper och roller)

### Flöde för behörighetskontroll

```
Förfrågan: GET /api/Pet
   ↓
1. Extrahera användarroller från session
   - Autentiserad: ["Customer", "Anonymous"]
   - Inte autentiserad: ["Anonymous"]
   ↓
2. Fråga RestPermissions för: contentType="Pet", method="GET"
   ↓
3. Kontrollera om någon användarroll har behörighet
   - Om JA → Tillåt förfrågan
   - Om NEJ → Returnera 403 Forbidden
```

## Databas-seed-system

Projektet använder ett seed-system för att hantera Orchard Core-databasen, vilket gör det enkelt för studenter att komma igång eller återställa sin miljö.

### Tillgängliga kommandon

```bash
# Spara nuvarande databasstatus som seed
npm run save

# Återställ databas från seed
npm run restore

# Starta backend (återställer automatiskt om ingen databas finns)
npm run backend
```

### Hur det fungerar

- **Seed-plats:** `backend/App_Data.seed/` (committad till git)
- **Körningsdatabas:** `backend/App_Data/` (ignorerad av git)
- **Första körningen:** När du kör `npm start` eller `npm run backend` för första gången återställs seed automatiskt
- **Loggar:** Loggfiler exkluderas från seed (de är körningsartefakter)

### När ska man spara

Som lärare/underhållare, kör `npm run save` efter att ha gjort ändringar du vill att studenter ska ha:
- Lägga till nya innehållstyper
- Skapa exempeldata
- Modifiera roller eller behörigheter
- Ladda upp mediafiler

Studenter kommer att få dessa ändringar när de klonar repot och kör `npm start`.

## Projektstruktur

```
vite-and-react-and-orchard-core/
├── backend/
│   ├── RestRoutes/              # Anpassad REST API-implementation
│   │   ├── AuthEndpoints.cs     # Login/logout-endpoints
│   │   ├── GetRoutes.cs         # GET-endpoints med expand-stöd
│   │   ├── PostRoutes.cs        # POST-endpoints
│   │   ├── PutRoutes.cs         # PUT-endpoints
│   │   ├── DeleteRoutes.cs      # DELETE-endpoints
│   │   ├── PermissionsACL.cs    # Logik för behörighetskontroll
│   │   ├── SystemRoutes.cs      # Admin-gränssnitt hjälp-endpoints
│   │   ├── SetupRoutes.cs       # Ruttregistrering
│   │   └── admin-script.js      # Admin-gränssnitt förbättringar
│   ├── App_Data/                # Körningsdatabas (git ignorerad)
│   └── App_Data.seed/           # Seed-databas (committad)
├── scripts/
│   ├── save-seed.js             # Spara databas till seed
│   ├── restore-seed.js          # Återställ databas från seed
│   └── ensure-setup.js          # Auto-återställ vid första körning
├── src/                         # React-frontend
└── package.json
```

## Standardinloggningsuppgifter

- **Användarnamn:** `admin`
- **Lösenord:** `Password123!`
- **Roller:** Administrator

## Exempeldata

Seed inkluderar:
- **Innehållstyper:** Pet, PetOwner, RestPermissions
- **Exempelhusdjur:** Fido, Garfield, Snoopy, etc.
- **Exempelägare:** John Doe
- **Roller:** Administrator, Customer, Anonymous och andra
- **Standardbehörigheter:** Exempel som visar hur man konfigurerar API-åtkomst

## Utvecklingsarbetsflöde

### Frontend-utveckling
```bash
npm run dev          # Starta endast Vite-dev-server
```

### Backend-utveckling
```bash
npm run backend      # Starta endast backend-server
```

### Fullstack
```bash
npm start           # Starta både frontend och backend
```

### Återställ databas
```bash
npm run restore     # Återställ till seed-tillstånd
```

## Felsökning

### Port redan i bruk
Om port 5001 är upptagen:

**macOS/Linux:**
```bash
lsof -ti:5001 | xargs kill -9
```

**Windows (PowerShell):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force
```

**Windows (Kommandotolk):**
```cmd
for /f "tokens=5" %a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /F /PID %a
```

### Databasproblem
Återställ till ett rent (initialt / senast sparat) tillstånd:
```bash
npm run restore
```