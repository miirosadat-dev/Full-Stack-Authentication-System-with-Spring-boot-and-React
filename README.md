# Anchor — Full-Stack Authentication System

A production-grade authentication system built from scratch with **Spring Boot**, **React**, and **PostgreSQL** — covering everything a real-world auth service needs: JWT sessions with refresh-token rotation, email OTP verification, account lockout, password/email recovery, and hardened security defaults.

**🔗 Live demo:** [authentication-system-spring-boot.vercel.app](https://authentication-system-spring-boot.vercel.app/)

> Free-tier hosting note: the backend (Render) spins down after periods of inactivity, so the first request after a while may take 30–60 seconds to wake up. Every request after that is fast.

![Anchor homepage](docs/screenshot-home.png)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Security Highlights](#security-highlights)
- [What I Learned](#what-i-learned)
- [Roadmap / Possible Extensions](#roadmap--possible-extensions)
- [License](#license)
- [Contact](#contact)

---

## Overview

Anchor isn't a toy "login form" project — it's a full authentication *system*, built the way a real backend service would be: every protected endpoint independently re-validates the JWT server-side (frontend route guards are UX only, never the real security boundary), every sensitive account change requires re-authentication, and every user-enumeration angle (login errors, resend-verification, forgot-password) returns identical responses whether or not the email exists.

It was built end-to-end, one deliberate phase at a time — database and entities first, then registration and email verification, then JWT login and route protection, then a hardening pass (account lockout, CORS, secrets management), then refresh tokens, then account management (reset/change password, change email), then unit tests, then deployment.

## Features

**Core authentication**
- User registration with hashed passwords (BCrypt, work factor 12) and strength validation
- Email verification via a 6-digit OTP (hashed at rest, time-limited, cooldown-protected, max-attempt-limited)
- JWT-based login with short-lived access tokens
- Refresh tokens with rotation and server-side revocation — sessions survive access-token expiry without forcing re-login, but can be instantly killed on logout or password change
- Protected routes and endpoints, validated independently on every request via a custom Spring Security filter chain

**Account management**
- Forgot/reset password via a time-limited, single-use emailed link
- Change password (requires current password re-entry)
- Change email (requires current password + OTP verification of the new address before it takes effect)
- All sensitive changes revoke existing sessions, forcing re-login everywhere

**Security hardening**
- Account lockout after repeated failed login attempts, with user-facing "attempts remaining" messaging
- CORS restricted to known origins (no wildcard)
- Security headers (clickjacking protection, MIME-sniffing protection, HSTS)
- Zero hardcoded secrets — all credentials and keys via environment variables, both locally and in production

**Frontend experience**
- Auth-aware UI: header, avatar, and account menu adapt automatically based on session state
- Toast notifications, inline validation, and a dashboard reflecting real account status
- Fully responsive

## Tech Stack

**Backend**
- Java 21, Spring Boot
- Spring Security (custom JWT filter chain)
- Spring Data JPA / Hibernate
- PostgreSQL
- JJWT (JSON Web Tokens)
- Resend (transactional email API)
- JUnit 5 + Mockito (unit tests)
- Maven

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Context API for global auth state

**Infrastructure**
- [Neon](https://neon.tech) — managed PostgreSQL
- [Render](https://render.com) — Spring Boot API hosting
- [Vercel](https://vercel.com) — React frontend hosting
- [Resend](https://resend.com) — transactional email delivery on a verified custom domain

## Architecture

```
┌─────────────┐      HTTPS       ┌──────────────────┐      JDBC      ┌────────────┐
│   React     │ ───────────────► │   Spring Boot     │ ─────────────► │ PostgreSQL │
│  (Vercel)   │ ◄─────────────── │   (Render)         │ ◄───────────── │  (Neon)    │
└─────────────┘    JSON / JWT    └──────────────────┘                └────────────┘
                                          │
                                          │ HTTPS
                                          ▼
                                   ┌─────────────┐
                                   │   Resend     │
                                   │  (email API) │
                                   └─────────────┘
```

**Key design decisions:**

- **Frontend route protection is UX only.** `ProtectedRoute` in React redirects an unauthenticated user for a clean experience, but the *real* security boundary is the backend: every protected endpoint validates the JWT independently via a custom `OncePerRequestFilter`, regardless of what the frontend believes.
- **Stateless access tokens, stateful refresh tokens.** Access tokens are short-lived JWTs (15 minutes) and cannot be revoked before they expire — that's the trade-off of statelessness. Refresh tokens are stored server-side (hashed with SHA-256, not BCrypt, since they need deterministic lookup-by-value) specifically so they *can* be revoked instantly on logout or a security-sensitive change.
- **Every enumeration-sensitive endpoint returns a generic response.** Login errors, resend-verification, and forgot-password all respond identically whether or not the account exists, so an attacker can't use response differences to discover which emails are registered.
- **Re-authentication before sensitive changes.** Changing a password or email requires re-entering the current password, even with a valid JWT already present — a valid session alone isn't treated as sufficient authorization for high-impact account changes.

## Project Structure

This is a monorepo with two top-level folders:

```
.
├── Authentication-backend/
│   └── auth/                  # Spring Boot application
│       ├── src/main/java/com/sadat/auth/
│       │   ├── config/        # Security & CORS configuration
│       │   ├── controller/    # REST controllers
│       │   ├── dto/           # Request/response records
│       │   ├── entity/        # JPA entities
│       │   ├── exception/     # Custom exceptions + global handler
│       │   ├── repository/    # Spring Data repositories
│       │   ├── security/      # JWT service & auth filter
│       │   └── service/       # Business logic
│       └── src/test/java/     # Unit tests
│
└── Authentication-frontend/
    └── src/
        ├── components/        # Modals, header, profile menu, etc.
        ├── context/           # AuthContext (global auth state)
        ├── layouts/           # Public & authenticated app shells
        ├── pages/             # Route-level pages
        └── services/          # API client functions
```

## Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL (local instance, or a connection string from a host like Neon)
- A [Resend](https://resend.com) account and API key (or adapt `EmailService` back to SMTP if preferred)

### Clone

```bash
git clone https://github.com/miirosadat-dev/Full-Stack-Authentication-System-with-Spring-boot-and-React.git
cd Full-Stack-Authentication-System-with-Spring-boot-and-React
```

### Backend setup

```bash
cd Authentication-backend/auth
```

Create `src/main/resources/application-local.properties` with your local secrets (see [Environment Variables](#environment-variables) below) — this file is gitignored and never committed.

Run:

```bash
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

### Frontend setup

```bash
cd Authentication-frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

## Environment Variables

None of these are committed — set them via your IDE's run configuration locally, and via your hosting platform's dashboard in production.

**Backend**

| Variable | Description |
|---|---|
| `DB_PASSWORD` / `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | PostgreSQL connection (local vs. production naming) |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `JWT_SECRET` | Signing secret for JWTs |
| `app.frontend-url` | Base URL of the frontend (used to build reset-password links) |
| `app.cors.allowed-origins` | Comma-separated list of allowed frontend origins |

**Frontend**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the deployed backend API |

## API Endpoints

All endpoints are prefixed with `/api/auth`.

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/register` | No | Create a new account |
| POST | `/verify-email` | No | Verify email with OTP; returns tokens and logs the user in |
| POST | `/resend-verification` | No | Resend OTP (enumeration-safe, cooldown-limited) |
| POST | `/login` | No | Authenticate and receive tokens |
| POST | `/refresh` | No | Exchange a refresh token for a new access token (rotates the refresh token) |
| POST | `/logout` | Yes | Revoke all refresh tokens for the current user |
| GET | `/me` | Yes | Get the current authenticated user |
| POST | `/forgot-password` | No | Request a password reset link (enumeration-safe) |
| POST | `/reset-password` | No | Reset password using a valid reset token |
| POST | `/change-password` | Yes | Change password (requires current password) |
| POST | `/change-email/request` | Yes | Request an email change (sends OTP to the new address) |
| POST | `/change-email/confirm` | Yes | Confirm the email change with the OTP |

## Security Highlights

- Passwords hashed with BCrypt (work factor 12); OTPs and refresh/reset tokens hashed before storage
- JWT-based stateless sessions validated on every request by a custom Spring Security filter
- Account lockout after repeated failed login attempts
- Rate-limited OTP resend with a cooldown and a maximum-attempts cap
- CORS restricted to explicitly allowed origins — no wildcards
- Security headers: clickjacking protection, MIME-sniffing protection, HSTS
- No secrets committed to source control at any point — environment variables throughout, both locally and in production

## What I Learned

This project was my first time working with Java, Spring Boot, and PostgreSQL, built specifically to develop real backend engineering skills toward ecommerce and fintech-style systems. Along the way it covered:

- Designing a layered Spring Boot backend (controller/service/repository/DTO) from scratch
- JWT structure, signing, and stateless authentication vs. stateful refresh-token revocation
- Writing a custom `OncePerRequestFilter` and understanding the Spring Security filter chain
- Real-world debugging: diagnosing a Gmail SMTP STARTTLS failure, a missing `@EnableAsync`, DNS resolution failures against a third-party API, and Hibernate schema-sync behavior
- Migrating from SMTP to a transactional email API (Resend) for reliable delivery
- Deploying a full-stack app across three separate free-tier platforms (Neon, Render, Vercel) and configuring production CORS, environment variables, and SPA routing rewrites
- Unit testing service-layer logic in isolation with JUnit and Mockito

## Roadmap / Possible Extensions

- Integration and end-to-end test coverage (current test suite covers backend unit tests for the core authentication logic only)
- Role-based authorization (admin vs. standard user)
- Two-factor authentication (TOTP)
- Session/device management UI (view and revoke individual active sessions)
- Rate limiting at the infrastructure level (e.g. per-IP)

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

**Miiro Sadat**
Full-stack developer

- Portfolio: [miirosadat.com](https://miirosadat.com)
- Email: miirosadat0@gmail.com
- LinkedIn: [linkedin.com/in/sadat-miiro](https://www.linkedin.com/in/sadat-miiro)
