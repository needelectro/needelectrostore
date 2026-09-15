# NEED ELECTRO ERP — Agent Guidelines & Workflow Rules

## Mandatory Deployment Rule
> **IMPORTANT: AUTOMATIC DEPLOYMENT ON ALL UPDATES**
> 
> After updating any code, feature, bug fix, database schema, or information in this codebase:
> 1. Always run static type checks (`npx tsc --noEmit`) to guarantee build integrity.
> 2. Always commit all modified files with a clear, conventional commit message.
> 3. Always push directly to GitHub (`origin main`).
> 
> The repository is configured with automated CI/CD (`.github/workflows/deploy.yml`) and cloud deployment hooks that build and deploy production whenever commits are pushed to `main`.
> 
> **Never finish a task without pushing changes to GitHub.**
