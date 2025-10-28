# Vite + React + Orchard Core REST API

A full-stack application combining a modern React frontend (Vite + TypeScript) with an Orchard Core CMS backend exposing a custom REST API with role-based permissions.

## Features

- 🔐 **Session-based Authentication** - Login/logout/register with username/password
- 🛡️ **Fine-grained Permissions System** - Control API access per user role, content type, and HTTP method
- 🎨 **Dynamic Admin UI** - Enhanced Orchard admin with JavaScript-powered field editors
- 📦 **Seed System** - Database seeding for easy project setup and reset
- ⚡ **REST API** - Full CRUD operations with relationship expansion, filtering, sorting, and pagination

# Important
The admin user name is "tom" with the password "Abcd1234!"

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the application**
   ```bash
   npm start
   ```

   This will:
   - Auto-restore the database from seed (first time only)
   - Start the Orchard Core backend on http://localhost:5001
   - Start the Vite dev server on http://localhost:5173

3. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5001/api
   - **Admin UI**: http://localhost:5001/admin (username: `admin`, password: `Password123!`)

## Authentication System

The backend uses **session-based authentication** (not JWT). Users must log in to receive session cookies, which are then used for subsequent requests.

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "username": "admin",
  "roles": ["Administrator"]
}
```

The server sets a session cookie (`.AspNetCore.Identity.Application`) that must be included in subsequent requests.

### Get Current User

```bash
GET /api/auth/login
```

**Response (authenticated):**
```json
{
  "isAuthenticated": true,
  "username": "admin",
  "roles": ["Administrator"]
}
```

**Response (not authenticated):**
```json
{
  "isAuthenticated": false,
  "username": null,
  "roles": ["Anonymous"]
}
```

### Logout

```bash
DELETE /api/auth/login
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Register

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

**Response:**
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

New users are automatically assigned the **Customer** role. The `firstName`, `lastName`, and `phone` fields are optional.

## REST API

The application provides a custom REST API for all Orchard Core content types. All endpoints (except authentication) are protected by the permissions system.

### Content Type: Pet

#### Get All Pets

```bash
GET /api/Pet
```

**Response:**
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

#### Get Single Pet

```bash
GET /api/Pet/4h72v3vvnffvzyjjyny8xgc2xz
```

**Response:**
```json
{
  "id": "4h72v3vvnffvzyjjyny8xgc2xz",
  "title": "Fido",
  "species": "dog",
  "ownerId": "4hef7jjdb26sdxshq3ddg87mm1"
}
```

#### Create Pet

```bash
POST /api/Pet
Content-Type: application/json

{
  "title": "Buddy",
  "species": "dog"
}
```

**Response:**
```json
{
  "id": "4new1234example5678id",
  "title": "Buddy"
}
```

**Supported Field Types:**

When creating or updating content, use the **same format** you receive from `GET /api/{contentType}` (not the raw format from `/api/raw/{contentType}`). The API automatically unwraps single-property fields for cleaner JSON:

- **TextField** - Plain string: `"species": "dog"`
- **NumericField** - Plain number: `"age": 5`
- **BooleanField** - Plain boolean: `"isActive": true`
- **DateField** - ISO 8601 string: `"birthDate": "2020-01-15T00:00:00Z"`
- **DateTimeField** - ISO 8601 string: `"createdAt": "2025-10-28T10:30:00Z"`
- **HtmlField** - Plain HTML string: `"description": "<p>A friendly dog</p>"`
- **MarkdownField** - Plain markdown string: `"bio": "# Fido\nA good boy"`

Multi-property fields (like LinkField and MediaField) are best created through the admin UI.

#### Update Pet

```bash
PUT /api/Pet/4new1234example5678id
Content-Type: application/json

{
  "title": "Buddy Updated",
  "species": "wolf"
}
```

**Response:**
```json
{
  "id": "4new1234example5678id",
  "title": "Buddy Updated"
}
```

**Note:** PUT accepts the same field format as POST (see Supported Field Types above).

#### Delete Pet

```bash
DELETE /api/Pet/4new1234example5678id
```

**Response:**
```json
{
  "message": "Item deleted successfully"
}
```

### API Endpoint Variants

The REST API provides three different endpoint variants for GET requests, each serving different use cases:

#### Standard Endpoints: `/api/{contentType}`
Clean, minimal JSON structure with only the essential fields.

```bash
GET /api/Pet
GET /api/Pet/{id}
```

#### Expand Endpoints: `/api/expand/{contentType}`
Same clean structure, but with relationship fields automatically populated.

```bash
GET /api/expand/Pet
GET /api/expand/Pet/{id}
```

#### Raw Endpoints: `/api/raw/{contentType}`
Returns the raw Orchard Core ContentItem structure without cleanup or population. Useful for debugging, advanced queries, or when you need access to Orchard Core metadata.

```bash
GET /api/raw/Pet
GET /api/raw/Pet/{id}
```

**Raw endpoint response includes:**
- Full ContentItem structure
- Orchard Core metadata (ContentItemId, ContentItemVersionId, ContentType, etc.)
- All part and field data in Orchard's native format
- Publication status, creation/modification dates
- Display text and other system fields

**Note:** Raw endpoints support all query parameters (where, orderby, limit, offset) just like standard endpoints.

### Expanding Relationships

For content types with relationships (like Pet → PetOwner), you can expand related content using the expand endpoints.

#### Get Pet with Expanded Owner

```bash
GET /api/expand/Pet
```

**Response:**
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

**Using standard endpoint (no expansion):**
```bash
GET /api/Pet
```

Returns only the owner ID (relationship not expanded):
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

### Filtering, Sorting, and Pagination

The REST API supports powerful query parameters for filtering, sorting, and pagination on all GET endpoints.

#### Filtering with WHERE

Use the `where` parameter to filter results. Supports deep property paths with dot notation.

**Supported Operators:**
- `=` - Equals
- `!=` - Not equals
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `LIKE` - Case-insensitive substring match

**Examples:**

```bash
# Filter by species
GET /api/Pet?where=species=dog

# Filter with deep property path
GET /api/expand/Pet?where=owner.title=John Doe

# Multiple conditions (use AND)
GET /api/Pet?where=species=dog AND ownerId!=null

# LIKE for substring matching
GET /api/expand/Pet?where=owner.title LIKE Smith
```

#### Sorting with ORDER BY

Use the `orderby` parameter to sort results. Prefix with `-` for descending order.

**Examples:**

```bash
# Sort by title (ascending)
GET /api/Pet?orderby=title

# Sort by title (descending)
GET /api/Pet?orderby=-title

# Multiple sort fields
GET /api/Pet?orderby=-species,title

# Sort by deep property path
GET /api/expand/Pet?orderby=owner.title
```

#### Pagination with LIMIT and OFFSET

Use `limit` and `offset` parameters for pagination.

**Examples:**

```bash
# Get first 10 items
GET /api/Pet?limit=10

# Get next 10 items (skip first 10)
GET /api/Pet?limit=10&offset=10

# Offset without limit (skip first 5 items)
GET /api/Pet?offset=5
```

#### Combining Query Parameters

All query parameters can be combined for powerful queries:

```bash
# Filter dogs, sort by title, paginate
GET /api/Pet?where=species=dog&orderby=title&limit=10&offset=0

# Filter by owner name with expansion, sort, and limit
GET /api/expand/Pet?where=owner.title LIKE Doe&orderby=-species&limit=5
```

**Complex Example:**

```bash
GET /api/expand/Pet?where=species=cat AND owner.email LIKE example.com&orderby=-title&limit=10&offset=0
```

This query:
1. Expands the owner relationship
2. Filters for cats whose owner's email contains "example.com"
3. Sorts by title (descending)
4. Returns 10 results, starting from the first

## Permissions System

Access to REST endpoints is controlled by **RestPermissions** - a custom content type that defines which roles can perform which HTTP methods on which content types.

### How It Works

1. **Every API request** (except auth) checks permissions before processing
2. Permissions are defined by creating **RestPermissions items** in the admin UI
3. Each permission specifies:
   - **Roles** - Which roles this permission applies to (comma-separated)
   - **Content Types** - Which content types this permission covers (comma-separated)
   - **REST Methods** - Which HTTP methods are allowed (checkboxes: GET, POST, PUT, DELETE)

### Example Permission

**Title:** "Anonymous can view pets"
- **Roles:** `Anonymous`
- **Content Types:** `Pet,PetOwner`
- **REST Methods:** `GET`

This allows unauthenticated users to read Pet and PetOwner data, but not create, update, or delete.

### Special Cases

- **Anonymous Role:** All users (authenticated or not) are in the `Anonymous` role
- **Administrator Bypass:** Users with the `Administrator` role always have access to system endpoints (`/api/system/*`)
- **Multiple Permissions:** If a user has multiple roles, they get the combined permissions of all their roles

### Managing Permissions

1. Log in to the admin UI: http://localhost:5001/admin
2. Navigate to Content → Content Items
3. Create a new **RestPermissions** item
4. Use the enhanced UI with checkboxes (automatically populated from your content types and roles)

### Permission Check Flow

```
Request: GET /api/Pet
   ↓
1. Extract user roles from session
   - Authenticated: ["Customer", "Anonymous"]
   - Not authenticated: ["Anonymous"]
   ↓
2. Query RestPermissions for: contentType="Pet", method="GET"
   ↓
3. Check if any user role has permission
   - If YES → Allow request
   - If NO → Return 403 Forbidden
```

## Database Seed System

The project uses a seed system to manage the Orchard Core database, making it easy for students to get started or reset their environment.

### Available Commands

```bash
# Save current database state as seed
npm run save

# Restore database from seed
npm run restore

# Start backend (auto-restores if no database exists)
npm run backend
```

### How It Works

- **Seed Location:** `backend/App_Data.seed/` (committed to git)
- **Runtime Database:** `backend/App_Data/` (ignored by git)
- **First Run:** When you run `npm start` or `npm run backend` for the first time, the seed is automatically restored
- **Logs:** Log files are excluded from the seed (they're runtime artifacts)

### When to Save

As a teacher/maintainer, run `npm run save` after making changes you want students to have:
- Adding new content types
- Creating sample data
- Modifying roles or permissions
- Uploading media files

Students will get these changes when they clone the repo and run `npm start`.

## Project Structure

```
vite-and-react-and-orchard-core/
├── backend/
│   ├── RestRoutes/              # Custom REST API implementation
│   │   ├── AuthEndpoints.cs     # Login/logout endpoints
│   │   ├── GetRoutes.cs         # GET endpoints with expand support
│   │   ├── PostRoutes.cs        # POST endpoints
│   │   ├── PutRoutes.cs         # PUT endpoints
│   │   ├── DeleteRoutes.cs      # DELETE endpoints
│   │   ├── PermissionsACL.cs    # Permission checking logic
│   │   ├── SystemRoutes.cs      # Admin UI helper endpoints
│   │   ├── SetupRoutes.cs       # Route registration
│   │   └── admin-script.js      # Admin UI enhancements
│   ├── App_Data/                # Runtime database (git ignored)
│   └── App_Data.seed/           # Seed database (committed)
├── scripts/
│   ├── save-seed.js             # Save database to seed
│   ├── restore-seed.js          # Restore database from seed
│   └── ensure-setup.js          # Auto-restore on first run
├── src/                         # React frontend
└── package.json
```

## Default Credentials

- **Username:** `admin`
- **Password:** `Password123!`
- **Roles:** Administrator

## Sample Data

The seed includes:
- **Content Types:** Pet, PetOwner, RestPermissions
- **Sample Pets:** Fido, Garfield, Snoopy, etc.
- **Sample Owners:** John Doe
- **Roles:** Administrator, Customer, Anonymous, and others
- **Default Permissions:** Examples showing how to configure API access

## Development Workflow

### Frontend Development
```bash
npm run dev          # Start only Vite dev server
```

### Backend Development
```bash
npm run backend      # Start only backend server
```

### Full Stack
```bash
npm start           # Start both frontend and backend
```

### Reset Database
```bash
npm run restore     # Reset to seed state
```

## Troubleshooting

### Port Already in Use
If port 5001 is busy:

**macOS/Linux:**
```bash
lsof -ti:5001 | xargs kill -9
```

**Windows (PowerShell):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force
```

**Windows (Command Prompt):**
```cmd
for /f "tokens=5" %a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /F /PID %a
```

### Database Issues
Reset to a clean (initial / last saved) state:
```bash
npm run restore
```
