






## Local Development
Copy `.env.example` to `.env.local` and fill in the values.
If you see an Azure SQL firewall error, ask the team lead to whitelist your IP.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

——————————————————————————
## Authorization (role-based access control)
Entra ID (Authentication & Authorization)

```bash
npm install next-auth
```
Account：Admin@yun11261016gmail221.onmicrosoft.com
         User@yun11261016gmail221.onmicrosoft.com
Password: Nodeall1000

## Azure Key Vault 
All sensitive configuration values (database connection strings, storage credentials, and Entra application IDs) are stored in Azure Key Vault and accessed securely at runtime using Azure RBAC and Managed Identity.




👤 Person 2 — Azure SQL Database
Owns: Data layer

👤 Person 3 — Azure Key Vault
Owns: Secrets management

👤 Person 4 — Azure Web App & Deployment
Owns: Hosting + runtime


👤 Person 5 — Monitoring, Logs & Alerts
Owns: Observability
