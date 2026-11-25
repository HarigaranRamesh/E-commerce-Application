# Enterprise UI Design System & Style Guide
> **Universal UI Architecture, Color Tokens, Typography, and Component Design Blueprint**  
> *Designed for scalable enterprise SaaS, HRMS (Human Resource Management Systems), dashboards, and modern web applications.*

---

## 1. Visual Philosophy & Core Principles

This design system is built on **modern executive SaaS aesthetics** (inspired by platforms like Linear, Stripe, and SendGrid). It prioritizes clean readability, data density without visual clutter, and micro-interactions that feel responsive and refined.

### Core Tenets:
1. **Background-Free Surfaces over Heavy Boxes**:  
   Instead of enclosing every section or toolbar in heavy, boxed card containers with thick backgrounds and borders, let primary headers and controls sit cleanly on the canvas (`#ffffff` or `#f8fafc`) with subtle bottom dividers (`1px solid #f1f5f9`).
2. **Deep Slate Neutrality (Never Pure Black)**:  
   Pure black (`#000000`) creates harsh eye fatigue. We use deep slate neutrals (`#1e293b` for headings, `#475569` for body text, and `#64748b` for secondary labels).
3. **Tinted Semantic Badges & Live Indicators**:  
   Status values (e.g., *Active*, *On Leave*, *Pending Review*, *Delivered*) use soft pastel background fills with high-contrast saturated text and 8px circular status indicator dots.
4. **Subtle Elevation & Crisp 1px Borders**:  
   Shadows are soft and diffused (`rgba(0, 0, 0, 0.04)` to `rgba(18, 28, 45, 0.08)`). Structural elements rely on 1px borders (`#e2e8f0` or `#f1f5f9`) rather than heavy dropshadows.

---

## 2. Color System & Design Tokens

### 2.1 Primary & Accent Palette
| Token Name | Hex Code | Usage in HRMS / App |
| :--- | :--- | :--- |
| `primary` | `#4f46e5` (Indigo) | Primary buttons, active sidebar tabs, key links |
| `primary-hover` | `#4338ca` | Button hover states |
| `primary-subtle` | `#eef2ff` | Active row tints, primary badge backgrounds |
| `navy-dark` | `#1e293b` | Dark buttons, high-contrast toggle pills |
| `gold-accent` | `#d5a249` | Luxury highlights, premium badges, bookmarks |

### 2.2 Semantic Status Palette (Ideal for HRMS Statuses)
| Status | Background | Text Color | Dot / Border | HRMS Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Active** | `#ecfdf5` | `#047857` | `#10b981` | Active Employee, Present, Approved, Completed |
| **Warning / Pending** | `#fffbeb` | `#b45309` | `#f59e0b` | Pending Approval, In Review, Probational |
| **Info / Progress** | `#eff6ff` | `#1d4ed8` | `#3b82f6` | On Leave, In Progress, Training, In Transit |
| **Danger / Urgent** | `#fef2f2` | `#b91c1c` | `#ef4444` | Terminated, Absent, Rejected, Overdue |

### 2.3 Neutral Scale (Slate)
| Token | Hex | Role |
| :--- | :--- | :--- |
| `slate-50` | `#f8fafc` | Table headers, secondary canvas background, muted cards |
| `slate-100` | `#f1f5f9` | Dividers, count pill backgrounds, inactive pills |
| `slate-200` | `#e2e8f0` | Standard 1px control borders (inputs, selects, cards) |
| `slate-300` | `#cbd5e1` | Hover state for borders, disabled controls |
| `slate-400` | `#94a3b8` | Placeholder text, breadcrumb arrows, secondary icons |
| `slate-500` | `#64748b` | Subtitles, table column headers, helper notes |
| `slate-600` | `#475569` | Body text, unselected tab text, form labels |
| `slate-700` | `#334155` | Strong body text, dropdown select options |
| `slate-800` | `#1e293b` | Main headings (`h1`, `h2`), card titles |
| `slate-900` | `#0f172a` | High-emphasis contrast text, dark toolbars |

---

## 3. Typography Scale & Hierarchy

### Recommended Font Stacks
- **Primary Interface**: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Numbers / Data Tables**: `'Inter', tabular-nums, sans-serif`

### Type Scale
| Role | Size | Weight | Line Height | Letter Spacing | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 Page Title** | `2.25rem` (36px) | `800` | `1.2` | `-0.5px` | `#1e293b` |
| **H2 Section Header** | `1.5rem` (24px) | `700` | `1.3` | `-0.3px` | `#1e293b` |
| **H3 Card Header** | `1.15rem` (18px) | `600` | `1.4` | `0` | `#1e293b` |
| **Eyebrow / Overline** | `0.75rem` (12px) | `700` | `1.0` | `1.2px` (uppercase) | `#64748b` or `#4f46e5` |
| **Body (Default)** | `0.9rem` (14.5px) | `400` / `500`| `1.5` | `0` | `#475569` |
| **Subtitle / Subtext** | `0.95rem` (15px) | `400` | `1.45` | `0` | `#64748b` |
| **Table Header** | `0.75rem` (12px) | `600` | `1.0` | `0.05em` (uppercase) | `#64748b` |
| **Badge / Pill Text** | `0.80rem` (13px) | `600` | `1.0` | `0.3px` | Dynamic semantic |
| **Small / Metadata** | `0.80rem` (13px) | `400` | `1.4` | `0` | `#94a3b8` |

---

## 4. Layout, Spacing & Alignment Blueprint

### 4.1 Page Layout Architecture
- **Max Width**: `1280px` (or `1440px` for dense data tables).
- **Page Container Padding**: `padding: 32px 24px` (or `padding: 100px 0 60px` for fixed top navbars).
- **Section Spacing**: `gap: 24px` to `gap: 32px`.

### 4.2 The Unified Header & Toolbar Pattern
Every major dashboard page (e.g. Employee Directory, Leave Requests, Payroll) follows this exact flex alignment pattern:

```jsx
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end", // Aligns controls nicely with title baseline
  flexWrap: "wrap",
  gap: "1.25rem",
  paddingBottom: "24px",
  marginBottom: "28px",
  borderBottom: "1px solid #f1f5f9"
}}>
  {/* Left: Title + Count Badge + Subtitle */}
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.5px" }}>
        Employee Directory
      </h1>
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        background: "#f1f5f9",
        borderRadius: "20px",
        fontSize: "0.82rem",
        fontWeight: 600,
        color: "#64748b"
      }}>
        142 Active
      </span>
    </div>
    <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
      Manage company staff, employment statuses, roles, and department allocations.
    </p>
  </div>

  {/* Right: Controls Toolbar */}
  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
    {/* Pill Toggles, Dropdown Selects, Export/Action Buttons */}
  </div>
</div>
```

---

## 5. UI Component Library & Code Patterns

### 5.1 Interactive Pill Toggle with Live Status Dot
Used for binary filters (e.g., *"Active Employees Only"*, *"In Stock Only"*, *"My Department"*).

```jsx
<button
  type="button"
  onClick={() => setIsActiveOnly(!isActiveOnly)}
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 16px",
    borderRadius: "20px",
    border: isActiveOnly ? "1px solid #1e293b" : "1px solid #e2e8f0",
    background: isActiveOnly ? "#1e293b" : "#ffffff",
    color: isActiveOnly ? "#ffffff" : "#475569",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease"
  }}
>
  <span style={{
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: isActiveOnly ? "#10b981" : "#94a3b8", // Green when on, muted slate when off
    display: "inline-block"
  }}></span>
  <span>Active Only</span>
</button>
```

---

### 5.2 Filter Bar & Debounced Search Input
Search bar with an embedded left icon and clean slate borders:

```jsx
<div style={{
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  alignItems: "center",
  padding: "1rem 1.25rem",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  marginBottom: "1.5rem"
}}>
  {/* Search with Left Icon */}
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", flex: 1, minWidth: "240px" }}>
    <Search size={16} color="#64748b" style={{ position: "absolute", left: "12px", pointerEvents: "none" }} />
    <input
      type="text"
      placeholder="Search by name, email, department..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 12px 8px 36px",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        fontSize: "0.875rem",
        color: "#1e293b",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#4f46e5";
        e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#e2e8f0";
        e.target.style.boxShadow = "none";
      }}
    />
  </div>

  {/* Styled Dropdown Select */}
  <select
    value={selectedDept}
    onChange={(e) => setSelectedDept(e.target.value)}
    style={{
      padding: "8px 14px",
      borderRadius: "6px",
      border: "1px solid #e2e8f0",
      fontSize: "0.875rem",
      color: "#334155",
      background: "#ffffff",
      cursor: "pointer",
      outline: "none"
    }}
  >
    <option value="">All Departments</option>
    <option value="engineering">Engineering</option>
    <option value="hr">Human Resources</option>
    <option value="finance">Finance</option>
  </select>
</div>
```

---

### 5.3 Semantic Status Badges
Soft pastel background + bold text:

```jsx
// Status Badge Helper
const getStatusBadge = (status) => {
  const styles = {
    Active: { bg: "#ecfdf5", text: "#047857", dot: "#10b981" },
    Pending: { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b" },
    OnLeave: { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
    Terminated: { bg: "#fef2f2", text: "#b91c1c", dot: "#ef4444" }
  };
  const config = styles[status] || { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "9999px",
      background: config.bg,
      color: config.text,
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: 1
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: config.dot }}></span>
      {status}
    </span>
  );
};
```

---

### 5.4 Enterprise Data Table
Crisp header with uppercase tracking, subtle borders, and smooth row hover:

```jsx
<div style={{
  background: "#ffffff",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
  overflow: "hidden"
}}>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <th style={{ padding: "12px 20px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 600, textAlign: "left" }}>Employee</th>
        <th style={{ padding: "12px 20px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 600, textAlign: "left" }}>Department</th>
        <th style={{ padding: "12px 20px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 600, textAlign: "left" }}>Role</th>
        <th style={{ padding: "12px 20px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 600, textAlign: "left" }}>Status</th>
        <th style={{ padding: "12px 20px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 600, textAlign: "right" }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {employees.map((emp) => (
        <tr
          key={emp.id}
          style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s ease" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <td style={{ padding: "14px 20px", fontSize: "0.875rem", color: "#1e293b", fontWeight: 500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#eef2ff", color: "#4f46e5", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                {emp.avatarInitials}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{emp.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{emp.email}</div>
              </div>
            </div>
          </td>
          <td style={{ padding: "14px 20px", fontSize: "0.875rem", color: "#475569" }}>{emp.department}</td>
          <td style={{ padding: "14px 20px", fontSize: "0.875rem", color: "#475569" }}>{emp.role}</td>
          <td style={{ padding: "14px 20px" }}>{getStatusBadge(emp.status)}</td>
          <td style={{ padding: "14px 20px", textAlign: "right" }}>
            <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "6px" }}>
              Edit
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### 5.5 Numbered Pagination Bar
```jsx
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 1.25rem",
  background: "#ffffff",
  borderTop: "1px solid #e2e8f0",
  fontSize: "0.875rem",
  color: "#64748b",
  flexWrap: "wrap",
  gap: "12px"
}}>
  <div>Showing 1 to 10 of 142 employees</div>
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        color: "#1e293b",
        cursor: currentPage === 1 ? "not-allowed" : "pointer",
        opacity: currentPage === 1 ? 0.5 : 1
      }}
    >
      Previous
    </button>
    {[1, 2, 3, 4].map(num => (
      <button
        key={num}
        onClick={() => setCurrentPage(num)}
        style={{
          minWidth: "34px",
          height: "34px",
          borderRadius: "6px",
          border: num === currentPage ? "1px solid #4f46e5" : "1px solid #e2e8f0",
          background: num === currentPage ? "#4f46e5" : "#ffffff",
          color: num === currentPage ? "#ffffff" : "#1e293b",
          fontWeight: num === currentPage ? 600 : 500,
          cursor: "pointer"
        }}
      >
        {num}
      </button>
    ))}
    <button
      disabled={currentPage === 4}
      onClick={() => setCurrentPage(p => p + 1)}
      style={{
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        color: "#1e293b",
        cursor: "pointer"
      }}
    >
      Next
    </button>
  </div>
</div>
```

---

### 5.6 SendGrid-Style Minimalist Toaster Notification
Pure white card, 1px perimeter border, 4px semantic left-accent strip, crisp typography:

```jsx
import { Toaster } from "react-hot-toast";

<Toaster
  position="top-right"
  gutter={10}
  toastOptions={{
    duration: 3000,
    style: {
      background: "#ffffff",
      color: "#121c2d",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: "13.5px",
      fontWeight: "500",
      lineHeight: "1.45",
      padding: "12px 16px",
      borderRadius: "4px",
      boxShadow: "0 4px 16px rgba(18, 28, 45, 0.08), 0 1px 3px rgba(18, 28, 45, 0.05)",
      border: "1px solid #e1e3ea",
      borderLeft: "4px solid #0263e0", // Default Info Blue
      minWidth: "300px",
      maxWidth: "420px",
    },
    success: {
      duration: 2500,
      style: {
        borderLeft: "4px solid #008b5c", // SendGrid Green
      },
      iconTheme: {
        primary: "#008b5c",
        secondary: "#ffffff",
      },
    },
    error: {
      duration: 4000,
      style: {
        borderLeft: "4px solid #d9383a", // SendGrid Red
      },
      iconTheme: {
        primary: "#d9383a",
        secondary: "#ffffff",
      },
    },
  }}
/>
```

---

## 6. Quick Copy-Paste Setup for New HRMS Projects

### Option A: CSS Variables (`:root`)
Add this directly into your global `index.css`:

```css
:root {
  /* Brand Accents */
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-primary-subtle: #eef2ff;

  /* Surfaces & Backgrounds */
  --bg-canvas: #ffffff;
  --bg-subtle: #f8fafc;
  --bg-card: #ffffff;

  /* Borders & Dividers */
  --border-light: #f1f5f9;
  --border-default: #e2e8f0;
  --border-hover: #cbd5e1;

  /* Typography */
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --text-subtle: #94a3b8;

  /* Semantics */
  --status-success: #10b981;
  --status-success-bg: #ecfdf5;
  --status-warning: #f59e0b;
  --status-warning-bg: #fffbeb;
  --status-info: #3b82f6;
  --status-info-bg: #eff6ff;
  --status-danger: #ef4444;
  --status-danger-bg: #fef2f2;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.03);
  --shadow-elevated: 0 4px 12px rgba(18, 28, 45, 0.06);
}
```

### Option B: Tailwind CSS (`tailwind.config.js`)
If your HRMS project uses Tailwind:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          subtle: '#eef2ff',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        status: {
          success: '#10b981',
          'success-bg': '#ecfdf5',
          warning: '#f59e0b',
          'warning-bg': '#fffbeb',
          info: '#3b82f6',
          'info-bg': '#eff6ff',
          danger: '#ef4444',
          'danger-bg': '#fef2f2',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.03)',
        'elevated': '0 4px 12px rgba(18, 28, 45, 0.06)',
      }
    },
  },
  plugins: [],
}
```

---

## 7. Checklist for HRMS Screens

When designing an HRMS screen (Employee List, Attendance Table, Leave Tracker, Payroll Dashboard):
- [ ] **Canvas**: Keep main background pure white (`#ffffff`) or soft slate (`#f8fafc`).
- [ ] **Header**: Use background-free page header with `1px solid #f1f5f9` bottom border; align title on left with count pill (`42 Employees`), and action buttons on bottom-right (`align-items: flex-end`).
- [ ] **Tables**: 
  - Column headers uppercase (`text-transform: uppercase`), tracked (`letterSpacing: 0.05em`), font-size `0.75rem`, color `#64748b`.
  - Row hover background `#f8fafc`.
  - Borders subtle `#f1f5f9`.
- [ ] **Filters**: Round filter search input and dropdown selects with 1px border `#e2e8f0`.
- [ ] **Statuses**: Use pastel backgrounds with 6px status dots instead of plain raw text.
- [ ] **Toasts**: Use the clean SendGrid style with colored left border instead of full-color notification boxes.
