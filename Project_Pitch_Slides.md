---
theme: default
class: text-center
---

# Smart Process Governance System (SPGS)
## Technical Architecture & Implementation Overview

---

## 1. Backend API Development (25 pts)
* **Framework:** High-performance RESTful API built with **FastAPI** (Python).
* **Architecture:** Modular routing structure separating Auth, Requests, and Admin domains (`routers/` directory).
* **Automation:** Integrated `APScheduler` for background tasks, automatically escalating agricultural requests that breach SLA deadlines (e.g., tier timeouts set to 10 minutes).
* **Data Validation:** Strict input/output validation and serialization using **Pydantic** schemas.

---

## 2. Database & Auth Integration (25 pts)
* **Database:** Relational data architecture using **SQLite** managed via **SQLAlchemy ORM**.
* **Authentication:** Secure **JSON Web Token (JWT)** implementation.
    * Access Tokens (Short-lived) & Refresh Tokens (Long-lived) flow.
* **Security:** Cryptographic password hashing using `bcrypt` (via `passlib`).
* **Governance:** Comprehensive 'Audit Logs' table tracking every state change immutably.

---

## 3. Full-Stack CRUD (25 pts)
* **Create:** Farmers submit multi-faceted agricultural applications including dynamic demographics and FPO details.
* **Read:** Complex filtering mechanisms displaying queue vs history across 5 different Role-Based dashboards.
* **Update:** Multi-tier approval workflow (Village -> Block -> District) using `PUT` status mutations.
* **Delete/Admin:** Full user lifecycles managed by Director roles.
* **Frontend Integration:** Seamless React API consumption using a custom `axios` interceptor injecting Bearer tokens.

---

## 4. State Management (15 pts)
* **Global State:** Centralized `AuthContext` managing user sessions, JWT lifecycles, and auto-refresh logic across the application.
* **Component State:** Extensive use of React Hooks (`useState`, `useEffect`) to manage dynamic dashboards, real-time table filtering (e.g., Escalated vs Rejected views), and modal visibility.
* **Routing Security:** `PrivateRoute` wrappers enforcing strict Role-Based Access Control (RBAC) preventing unauthorized navigations.

---

## 5. Error Handling & Security (10 pts)
* **Bot Protection:** Custom-built Python-generated visual CAPTCHA verification required on all sign-ins.
* **Global Catch-All:** FastAPI `@app.exception_handler` intercepts backend crashes, preventing stack-traces from leaking.
* **UI Feedback:** Graceful frontend error catching coupled with `react-hot-toast` notifications providing clear, user-friendly feedback rather than silent failures.
* **Sanitization:** Database abstractions (ORM) naturally preventing SQL Injection vulnerabilities.
