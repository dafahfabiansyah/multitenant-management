# Multi-Tenant Management System - Frontend

## 🚀 Phase 1 Completed

### What's Implemented

✅ **Project Structure & Setup**
- Organized folder structure (pages, stores, types, components)
- Environment configuration (.env)
- TypeScript configuration

✅ **Styling & UI**
- Tailwind CSS v4 with custom color palette (Blue primary, White background)
- CSS variables for easy theme customization
- Clean and modern design system

✅ **Core Infrastructure**
- Axios instance with automatic JWT token injection
- Global 401 error handling and auto-logout
- TypeScript types for all API endpoints
- Zod validation schemas for forms

✅ **State Management (Zustand)**
- `authStore` - Authentication with localStorage persistence
- `tenantStore` - Tenant management operations
- `contactStore` - Contact CRM operations

✅ **Layout Components**
- `AppLayout` - Main application shell with sidebar and header
- `Sidebar` - Navigation with role-based menu visibility
- `Header` - Top bar with tenant info and notifications placeholder
- `ProtectedRoute` - Route guard with role-based access control

✅ **Authentication Pages**
- Login page with email/password and "Remember Me" checkbox
- Register page with user + organization creation
- Error handling and loading states

✅ **Dashboard & Placeholders**
- Dashboard page with statistics cards (UI only, ready for data)
- Contacts page placeholder
- Settings page placeholder

✅ **Routing**
- React Router v7 setup with protected routes
- Auto-redirect based on authentication status
- Role-based access control

---

## 📦 Dependencies

Before running the app, install these dependencies:

```bash
npm install axios react-router-dom@7 react-hook-form @hookform/resolvers
```

### Optional: Install Shadcn Components (for enhanced UI)

```bash
npx shadcn@latest add button input label card form toast avatar dropdown-menu separator skeleton badge select table dialog alert-dialog
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Environment Variables
The `.env` file is already created with:
```
VITE_API_BASE_URL=http://localhost:8080/api
```
Update this if your backend URL is different.

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🎨 Color Customization

All colors are defined in `src/App.css` using CSS variables. To change the color scheme:

1. Open `src/App.css`
2. Update the `:root` section, particularly:
   - `--primary`: Main blue color (used for buttons, links, etc.)
   - `--background`: Page background (currently white)
   - `--sidebar`: Sidebar background
   - Other color variables follow the same pattern

Example: Change to green theme
```css
--primary: oklch(0.58 0.20 150); /* Green instead of blue */
```

---

## 📁 Project Structure

```
client/src/
├── components/
│   ├── common/           # Reusable components (ProtectedRoute)
│   ├── layout/           # Layout components (AppLayout, Sidebar, Header)
│   └── ui/               # Shadcn UI components
├── lib/
│   ├── axios.ts          # Axios instance with interceptors
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Zod schemas
├── pages/
│   ├── auth/             # Login & Register pages
│   ├── dashboard/        # Dashboard home
│   ├── contacts/         # Contact management (placeholder)
│   └── settings/         # Settings page (placeholder)
├── stores/
│   ├── authStore.ts      # Authentication state
│   ├── contactStore.ts   # Contacts state
│   └── tenantStore.ts    # Tenant state
├── types/
│   └── index.ts          # TypeScript interfaces
└── App.tsx               # Router setup
```

---

## 🔐 Authentication Flow

1. User opens app → checks localStorage for token
2. If token exists → validates with `/v1/tenant` endpoint
3. If valid → redirects to `/dashboard`
4. If invalid/no token → redirects to `/login`
5. On 401 error → auto-logout and redirect to login

**Remember Me** feature: Stores token persistently in localStorage

---

## 🎯 Next Steps (Future Phases)

### Phase 2: Enhanced Auth & Settings
- Token refresh mechanism
- Password reset/forgot password
- Tenant settings page (update name, status)

### Phase 3: Contact Management (CRM)
- Contacts table with pagination
- Advanced filters (status, source, tags)
- Search functionality
- Create/Edit/Delete contact forms
- Contact detail view

### Phase 4: User Management
- User list with roles
- Change user roles
- Remove users  
- Audit logs table

### Phase 5: Polish
- Loading skeletons
- Toast notifications
- Error boundaries
- Responsive design improvements
- Testing

---

## 🔑 API Integration

All API calls use the base URL from `.env`:
```
http://localhost:8080/api/v1/...
```

### Available Endpoints (from backend):

**Auth:**
- POST `/auth/register` - Create account
- POST `/auth/login` - Sign in

**Tenant:**
- GET `/tenant` - Get current tenant
- PUT `/tenant` - Update tenant (admin)
- GET `/tenant/users` - List users (admin)
- PUT `/tenant/users/:id/role` - Update role (admin)
- DELETE `/tenant/users/:id` - Remove user (admin)
- GET `/tenant/audit-logs` - View logs (admin)

**Contacts:**
- GET `/contacts` - List with filters
- GET `/contacts/:id` - Get by ID
- POST `/contacts` - Create contact
- PATCH `/contacts/:id` - Update contact
- DELETE `/contacts/:id` - Delete contact
- GET `/contacts/search?q=...` - Search

---

## 🐛 Troubleshooting

### "Module not found" errors
Run `npm install` to ensure all dependencies are installed.

### 401 Unauthorized errors
Make sure the backend server is running on `http://localhost:8080` and the `/api/v1/` endpoints are accessible.

### Styling issues
Clear browser cache and restart dev server (`npm run dev`)

### CORS errors
Backend must enable CORS for `http://localhost:5173`

---

## 💡 Development Tips

1. **Hot Module Replacement (HMR)** is enabled - changes auto-refresh
2. **React Compiler** is enabled for better performance
3. **TypeScript strict mode** - all types are enforced
4. Use Chrome DevTools → Redux for Zustand debugging
5. Check Network tab for API call details

---

## 📝 Technical Stack

- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS v4** - Utility-first CSS
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router v7** - Routing
- **React Hook Form + Zod** - Form validation
- **Lucide React** - Icons
- **Shadcn/UI** - UI components (optional)

---

## 📞 Support

For issues or questions about Phase 1 implementation, check:
1. TypeScript errors in VSCode
2. Browser console for runtime errors
3. Network tab for API errors
4. Backend logs for server-side issues

---

**Status:** ✅ Phase 1 Complete - Ready for Phase 2 implementation!
