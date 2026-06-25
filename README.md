# TicketBari – Online Ticket Booking Platform

### **Programming Hero | Assignment-10 | CAT_05**
- **Project Name:** TicketBari – Online Ticket Booking Platform
- **Client Live Site:** [https://ticket-bari-client.vercel.app/](https://ticket-bari-client.vercel.app/)
- **Client GitHub Repository:** [https://github.com/rahad404/ticketbari-client](https://github.com/rahad404/ticket-bari-client)
- **Server Live API:** [https://ticket-bari-server.vercel.app/](https://ticket-bari-server.vercel.app/)

---

## Project Description
**TicketBari** is a fully responsive MERN stack online ticket booking platform where users can discover and book travel tickets for Bus, Train, Launch, and Flight. The platform supports three user roles — **User**, **Vendor**, and **Admin** — each with dedicated dashboards. Users can browse approved tickets with advanced search, filter, sort, and pagination, book tickets with a modal, pay via Stripe, download PDF tickets, and manage bookings. Vendors can add, update, and delete tickets, manage booking requests, and view revenue charts. Admins can manage users, verify tickets, and promote tickets on the homepage advertisement section.

---

## Key Features

1. **Role-Based Dashboards:**
   Dedicated dashboards for User (Profile, My Bookings, Transactions), Vendor (Profile, Add Ticket, My Tickets, Requests, Revenue), and Admin (Profile, Manage Tickets, Manage Users, Advertise Tickets).

2. **Advanced Ticket Discovery:**
   Search by title, filter by From/To locations, filter by transport type (Bus/Train/Flight/Launch), sort by price (Low to High / High to Low), and paginated results (6 per page).

3. **Seamless Booking & Payment:**
   One-click "Book Now" modal with quantity validation, Stripe Checkout Sessions for secure payments, automated ticket quantity deduction on payment, and PDF ticket download after successful payment.

4. **Vendor Revenue Analytics:**
   Interactive revenue overview with Bar chart (tickets added vs sold), Donut chart (booking statuses), and Line chart (daily revenue for last 7 days) using Recharts.

5. **Admin Moderation Tools:**
   Approve/Reject pending tickets, promote users to Admin/Vendor roles, toggle fraud status on vendors (hides all their tickets), and advertise up to 6 tickets on the homepage.

6. **Secure Authentication:**
   Powered by **Better Auth** with JWT plugin, Email/Password signup with profile image upload (ImgBB), Google social login, and automatic session persistence.

---

## Tech Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **Styling & Components:** TailwindCSS 4, Shadcn UI Components
- **Authentication:** Better Auth, Google OAuth, Email/Password Provider
- **Icons & Animation:** Lucide React, React Icons (FaGoogle), Motion (Framer Motion)
- **Charts:** Recharts
- **Forms:** React Hook Form
- **PDF Generation:** jsPDF
- **Notifications:** Sonner
- **Payments:** Stripe Checkout Sessions
- **Image Hosting:** ImgBB

---

## NPM Packages Used

| Package | Purpose |
|---|---|
| `next` | React framework with App Router |
| `react`, `react-dom` | UI library |
| `tailwindcss` | Utility-first CSS framework |
| `lucide-react` | Icon library |
| `react-icons` | Additional icons (FaGoogle) |
| `motion` | Animations (Framer Motion) |
| `recharts` | Charting library for revenue analytics |
| `react-hook-form` | Form state management |
| `jspdf` | PDF ticket generation |
| `sonner` | Toast notifications |
| `stripe` | Payment processing |
| `@better-auth` | Authentication (Next.js client) |

---

## Frontend Routes

### Public Routes:
- `/` — Landing page with Hero section, Popular Routes, Latest Tickets, Advertised Tickets, Why Choose Us.
- `/login` — Login with Email/Password or Google.
- `/signup` — Registration with profile image upload and role selection.
- `/all-tickets` — Browse, search, filter, sort, and paginate approved tickets.

### Private Routes (Requires Login):
- `/all-tickets/[id]` — Ticket details page with Book Now modal and countdown timer.
- `/dashboard/user/profile` — View and edit user profile.
- `/dashboard/user/my-bookings` — Manage bookings, Pay Now, Cancel, download PDF ticket.
- `/dashboard/user/transactions` — View Stripe payment history.
- `/dashboard/vendor/profile` — View vendor profile.
- `/dashboard/vendor/add-ticket` — Add new ticket with image upload.
- `/dashboard/vendor/my-tickets` — View, update, or delete own tickets.
- `/dashboard/vendor/requests` — Accept or reject booking requests.
- `/dashboard/vendor/revenue` — Revenue analytics with charts.
- `/dashboard/admin/profile` — View admin profile.
- `/dashboard/admin/manage-tickets` — Approve or reject vendor tickets.
- `/dashboard/admin/manage-users` — Manage roles and fraud status.
- `/dashboard/admin/advertise` — Toggle ticket advertisement (max 6).

---

## Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/rahad404/ticketbari-client.git
cd ticketbari-client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root folder and add the following keys:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_IMAGE_UPLOAD_API=your_imgbb_api_key
```

### 4. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Run the backend server
Clone and set up the server from [ticket-bari-server](https://github.com/rahad404/ticket-bari-server) with its own `.env` file.
