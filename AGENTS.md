# NEED ELECTRO ERP — Agent Guidelines & Workflow Rules

## Mandatory Deployment Rule
> **IMPORTANT: ALWAYS UPDATE LIVE WEBSITE ON ALL EDITS**
> 
> After updating or editing any code, UI, feature, bug fix, database schema, or text in this codebase:
> 1. Always run static type checks (`npx tsc --noEmit` / `npx.cmd tsc --noEmit`) to guarantee build integrity.
> 2. Always commit all modified files with a clear, conventional commit message.
> 3. Always push directly to GitHub (`origin main`).
> 
> The repository is configured with automated CI/CD (`.github/workflows/deploy.yml`) and cloud production deployment hooks (e.g. Vercel) that build and deploy to the live website whenever commits are pushed to `main`.
> 
> **CRITICAL: Always update and deploy the website immediately after editing. Never finish any task without pushing changes to GitHub (`origin main`).**
