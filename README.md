# 🍔 Val - Restaurant Service / Order Food

[![GitHub Repo](https://img.shields.io/badge/GitHub-MMTTSEC%2FOrderapp-blue?style=flat&logo=github)](https://github.com/MMTTSEC/Orderapp)

A food ordering system designed to be implemented on screens at the restaurant entrance. The application aims to streamline the ordering process for customers and simplify order management for staff.

# Figma Mockup

<img width="901" height="922" alt="image" src="https://github.com/user-attachments/assets/0fd93dd3-e0fd-4f51-ad74-0355d3811871" />

---
## 📸 Screenshots

## Order
<p align="center">
  <img src="https://github.com/user-attachments/assets/059893ea-4805-48c1-95c0-383f8206d278" width="200">
  <img src="https://github.com/user-attachments/assets/172ea48f-38b1-434a-be49-7480d8e583d9" width="200">
  <img src="https://github.com/user-attachments/assets/1bfb56a0-238b-4506-99df-be86b52d287b" width="200">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/2fa80f3e-fda2-4884-95ba-0bae79d9d75a" width="200">
  <img src="https://github.com/user-attachments/assets/f9bbf373-6e81-4cf8-b4f1-ac7531d43f6c" width="200">
  <img src="https://github.com/user-attachments/assets/a770a181-f4c0-4a7f-b0b8-ea128c59544a" width="200">
</p>

## backoffice


<p align="center">
  <img src="https://github.com/user-attachments/assets/2edd8081-debf-4852-b2ce-760819c21aca" width="250">
  <img src="https://github.com/user-attachments/assets/e9c94c35-88da-47d7-90c0-25d210e42952" width="250">
  <img src="https://github.com/user-attachments/assets/6b74166a-ee87-4a4e-8f65-d4939b843649" width="250">
</p>



## Order display

<p align="center">
  <img src="https://github.com/user-attachments/assets/5423fe22-7c08-43ac-aaec-3675c327778c" width="300">
  <img src="https://github.com/user-attachments/assets/f2a7c831-f7a6-46b5-a6e7-464fcd216d1f" width="300">
</p>














---

## 💡 Application Functionality

The application is divided into two main views: **Customer View** (ordering screen) and **Staff View** (order management).

### 🛒 Customer Functionality

- **Order Queue/Status:** Clear overview on the index page of ongoing and completed orders (queue list).

- **Ordering Flow:**

  - Choose **Dine In** / **Take Away**.

  - Browse menu via tabs: **Meal**, **Drink**, **Sides**.

  - **Shopping Cart:** Displayed dynamically at the bottom of the page. The customer can modify (add/remove/change quantity) before payment.

  - **Confirmation:** Page to review the order before payment.

  - **Receipt:** Eco-friendly option (receipt/no receipt).

  - **Queue Number:** Generated upon completed payment and reset daily.

  - **Return:** Redirected back to index after ordering (with updated queue list).

### 👩‍🍳 Staff Management

- **Secret Login:** Separate page for staff login (`/staff`).

- **Order Management:**

  - Overview of all orders, sorted in tabs: **New**, **In Progress**, and **Completed**.

  - Detail view with checklist for each order item (to mark what is prepared).

  - Mark order as **'Ready'** when all items are checked.

  - Remove completed orders (when the customer has picked up the food).

  - **Order History:** View all delivered/completed orders, categorized by day.

---

## ⚙️ Technical Documentation

This section fulfills the requirement for technical documentation regarding content structure, user roles, publishing workflow, and integration between frontend and CMS.

### 🧱 Content Structure and Models (Orchard Core CMS)

Content is managed in Orchard Core CMS with the following Content Types, which define the application's data structure:

| Content Type        | Description                                                                                                                                 | Dependencies                   |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------- |
| **Size**            | Defines static sizes (e.g., Small, Medium, Large).                                                                                          | -                              |
| **Product**         | Main catalog for menu items (Name, Category, Price, Image, reference to `Size`).                                                            | `Size`                         |
| **OrderStatus**     | Static lookup list for order status (Pending, In progress, Completed, Cancelled).                                                           | -                              |
| **ProductQuantity** | Intermediate type that holds a specific product and the ordered quantity. Necessary for customers to order the same product multiple times. | `Product`                      |
| **CustomerOrder**   | The complete customer order (Order number, Timestamp, list of `Product Quantity` IDs).                                                      | `ProductQuantity`              |
| **HandleOrder**     | Used by staff. Links a `CustomerOrder` to its current `OrderStatus`.                                                                        | `CustomerOrder`, `OrderStatus` |

### 🔄 Publishing Workflow

The application has three distinct workflows:

1.  **Orchard CMS (Owner/Admin):**

    - The owner logs into Orchard CMS backend.

    - Creates/updates the menu by adding new **Product** items.

    - Creates and manages users/credentials for staff.

    - _Technical note:_ The owner publishes the static types (`Size`, `OrderStatus`) and the product catalog (`Product`).

2.  **Customer Orders (Guest):**

    - The customer navigates linearly through selection of dining location, menu, shopping cart, confirmation, and payment.

    - Upon ordering, the following are dynamically generated and published:

      - New **ProductQuantity** entries.

      - A new **CustomerOrder** that links these quantities.

    - _Technical note:_ The customer indirectly creates content items through the purchase transaction.

3.  **Staff Page (Staff):**

    - Staff logs in on the `/staff` page.

    - Selects an order (`New`) and clicks "Accept" (moved to `In Progress`).

    - Manages the order by checking items in the detail view.

    - Marks order as **'Order Ready'** (moved to `Completed`).

    - _Technical note:_ Staff updates the linked **HandleOrder** item to change `OrderStatus`.

### 🤝 Integration between Frontend (React) and CMS (Orchard Core)

The project uses a **client-server architecture** where a **React frontend** communicates with **OrchardCore CMS** via a **REST API** and **Server-Sent Events (SSE)**.

| Technology                      | Role                                                                                                                                                       |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Frontend** (Port 5173)  | Handles user interface, order logic, and data display.                                                                                                     |
| **OrchardCore CMS** (Port 5001) | Backend, database, and API layer. Handles all data (products, orders, status).                                                                             |
| **REST API**                    | Handles CRUD operations (Get, Create, Update) for all Content Types (`/api/expand/{contentType}`, `/api/{contentType}`).                                   |
| **SSE** (`/api/sse/orders`)     | Provides **real-time updates** of order status to both the Order Display screen and Staff View, without the client needing to reload or continuously poll. |

---

## 🚀 Installation and Start

### Prerequisites

- Node.js (version 18 or later)
- npm (comes with Node.js)
- .NET SDK (for Orchard Core backend)

### Step 1: Install dependencies

```bash
npm install
```

This installs all necessary npm packages for the React frontend.

### Step 2: Start the application

```bash
npm start
```

This command will:

- Automatically restore the database from seed (first time only)
- Start Orchard Core backend on http://localhost:5001
- Start Vite dev server (React frontend) on http://localhost:5173

### Step 3: Open the application

After both servers have started, you can open:

- **Frontend (Customer View)**: http://localhost:5173
- **Frontend (Order Display Page)**: http://localhost:5173/order-display
- **Frontend (Staff View)**: http://localhost:5173/staff
- **Backend API**: http://localhost:5001/api
- **Admin UI**: http://localhost:5001/admin

---

## 🔐 Authentication System

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

---

## ⚡ REST API

The application provides a custom REST API for all Orchard Core content types. All endpoints (except authentication) are protected by the permissions system.

### Content Type: Product

#### Get All Products

```bash
GET /api/Product
```

**Response:**

```json
[
  {
    "id": "4h72v3vvnffvzyjjyny8xgc2xz",
    "title": "Burger",
    "category": "Meal",
    "price": 99.5,
    "sizeId": "4hef7jjdb26sdxshq3ddg87mm1"
  }
]
```

#### Get Single Product

```bash
GET /api/Product/4h72v3vvnffvzyjjyny8xgc2xz
```

**Response:**

```json
{
  "id": "4h72v3vvnffvzyjjyny8xgc2xz",
  "title": "Burger",
  "category": "Meal",
  "price": 99.5,
  "sizeId": "4hef7jjdb26sdxshq3ddg87mm1"
}
```

#### Create Product

```bash
POST /api/Product
Content-Type: application/json

{
  "title": "Pizza",
  "category": "Meal",
  "price": 120.00
}
```

**Response:**

```json
{
  "id": "4new1234example5678id",
  "title": "Pizza"
}
```

---

#### Update Product

```bash
PUT /api/Product/4new1234example5678id
Content-Type: application/json

{
  "title": "Pizza Updated",
  "price": 125.00
}
```

**Response:**

```json
{
  "id": "4new1234example5678id",
  "title": "Pizza Updated"
}
```

**Note:** PUT accepts the same field format as POST (see Supported Field Types above).

#### Delete Product

```bash
DELETE /api/Product/4new1234example5678id
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
GET /api/Product
GET /api/Product/{id}
```

#### Expand Endpoints: `/api/expand/{contentType}`

Same clean structure, but with relationship fields automatically populated.

```bash
GET /api/expand/Product
GET /api/expand/Product/{id}
```

#### Raw Endpoints: `/api/raw/{contentType}`

Returns the raw Orchard Core ContentItem structure without cleanup or population. Useful for debugging, advanced queries, or when you need access to Orchard Core metadata.

```bash
GET /api/raw/Product
GET /api/raw/Product/{id}
```

**Raw endpoint response includes:**

- Full ContentItem structure
- Orchard Core metadata (ContentItemId, ContentItemVersionId, ContentType, etc.)
- All part and field data in Orchard's native format
- Publication status, creation/modification dates
- Display text and other system fields

**Note:** Raw endpoints support all query parameters (where, orderby, limit, offset) just like standard endpoints.

### Expanding Relationships

For content types with relationships (like Product → Size), you can expand related content using the expand endpoints.

#### Get Product with Expanded Size

```bash
GET /api/expand/Product
```

**Response:**

```json
[
  {
    "id": "40sk48hnkka1tsfdkhhk6vprch",
    "title": "Burger",
    "category": "Meal",
    "price": 99.5,
    "sizeId": "4237v01g4sxw41mybx97wg6adf",
    "size": {
      "id": "4237v01g4sxw41mybx97wg6adf",
      "title": "Large"
    }
  }
]
```

**Using standard endpoint (no expansion):**

```bash
GET /api/Product
```

Returns only the size ID (relationship not expanded):

```json
[
  {
    "id": "40sk48hnkka1tsfdkhhk6vprch",
    "title": "Burger",
    "category": "Meal",
    "price": 99.5,
    "sizeId": "4237v01g4sxw41mybx97wg6adf"
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
# Filter by category
GET /api/Product?where=category=Meal

# Filter with deep property path
GET /api/expand/Product?where=size.title=Large

# Multiple conditions (use AND)
GET /api/Product?where=category=Meal AND price>100

# LIKE for substring matching
GET /api/Product?where=title LIKE Burger
```

#### Sorting with ORDER BY

Use the `orderby` parameter to sort results. Prefix with `-` for descending order.

**Examples:**

```bash
# Sort by title (ascending)
GET /api/Product?orderby=title

# Sort by title (descending)
GET /api/Product?orderby=-title

# Multiple sort fields
GET /api/Product?orderby=-category,title

# Sort by deep property path
GET /api/expand/Product?orderby=size.title
```

#### Pagination with LIMIT and OFFSET

Use `limit` and `offset` parameters for pagination.

**Examples:**

```bash
# Get first 10 items
GET /api/Product?limit=10

# Get next 10 items (skip first 10)
GET /api/Product?limit=10&offset=10

# Offset without limit (skip first 5 items)
GET /api/Product?offset=5
```

#### Combining Query Parameters

All query parameters can be combined for powerful queries:

```bash
# Filter meals, sort by price, paginate
GET /api/Product?where=category=Meal&orderby=price&limit=10&offset=0

# Filter by size with expansion, sort, and limit
GET /api/expand/Product?where=size.title=Large&orderby=-price&limit=5
```

**Complex Example:**

```bash
GET /api/expand/Product?where=category=Meal AND price>100&orderby=-title&limit=10&offset=0
```

This query:

1. Expands the size relationship
2. Filters for meals with price greater than 100
3. Sorts by title (descending)
4. Returns 10 results, starting from the first

---

## 🛡️ Permissions System

Access to REST endpoints is controlled by **RestPermissions** - a custom content type that defines which roles can perform which HTTP methods on which content types.

### How It Works

1. **Every API request** (except auth) checks permissions before processing
2. Permissions are defined by creating **RestPermissions items** in the admin UI
3. Each permission specifies:
   - **Roles** - Which roles this permission applies to (comma-separated)
   - **Content Types** - Which content types this permission covers (comma-separated)
   - **REST Methods** - Which HTTP methods are allowed (checkboxes: GET, POST, PUT, DELETE)

### Example Permission

**Title:** "Anonymous can view products"

- **Roles:** `Anonymous`
- **Content Types:** `Product,Size`
- **REST Methods:** `GET`

This allows unauthenticated users to read Product and Size data, but not create, update, or delete.

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
Request: GET /api/Product
   ↓
1. Extract user roles from session
   - Authenticated: ["Customer", "Anonymous"]
   - Not authenticated: ["Anonymous"]
   ↓
2. Query RestPermissions for: contentType="Product", method="GET"
   ↓
3. Check if any user role has permission
   - If YES → Allow request
   - If NO → Return 403 Forbidden
```

---

## 📦 Database Seed System

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

---

## 🔐 Login Credentials

### Admin User

- **Username:** `tom`
- **Password:** `Abcd1234!`

### Staff Login

Staff logs in via the `/staff` page with their personal login credentials.

---

## 🛠️ Development Workflow

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

---

## 📁 Project Structure

```
Orderapp/
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
│   │   └── admin-script.js       # Admin UI enhancements
│   ├── App_Data/                # Runtime database (git ignored)
│   └── App_Data.seed/           # Seed database (committed)
├── scripts/
│   ├── save-seed.js             # Save database to seed
│   ├── restore-seed.js          # Restore database from seed
│   └── ensure-setup.js          # Auto-restore on first run
├── src/                         # React frontend
│   ├── pages/                   # Page components
│   ├── routes.ts                # Centralized route definition
│   └── ...
└── package.json
```

---
