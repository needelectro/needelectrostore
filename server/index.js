// NEED ELECTRO ERP — Main Backend Server
// Express API Server with Centralized SQLite Database & RBAC Authorization
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

import { authenticate } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { bootstrapRouter } from './routes/bootstrap.js';
import { salesRouter } from './routes/sales.js';
import { emiRouter } from './routes/emi.js';
import { productsRouter } from './routes/products.js';
import { customersRouter } from './routes/customers.js';
import { suppliersRouter } from './routes/suppliers.js';
import { purchasesRouter } from './routes/purchases.js';
import { returnsRouter } from './routes/returns.js';
import { expensesRouter } from './routes/expenses.js';
import { servicesRouter } from './routes/services.js';
import { warrantyRouter } from './routes/warranty.js';
import { accountingRouter } from './routes/accounting.js';
import { reportsRouter } from './routes/reports.js';
import { settingsRouter } from './routes/settings.js';
import { auditRouter } from './routes/audit.js';
import { backupRouter } from './routes/backup.js';
import { importRouter } from './routes/import.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global Authentication Context
app.use(authenticate);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    system: 'NEED ELECTRO ERP API',
    company: 'NEED ELECTRO',
    tagline: 'Trusted Electrical & Technological Solutions',
    timestamp: new Date().toISOString()
  });
});

// Mount Core API Routes
app.use('/api/auth', authRouter);
app.use('/api/bootstrap', bootstrapRouter);
app.use('/api/sales', salesRouter);
app.use('/api/emi', emiRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/warranty', warrantyRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/backup', backupRouter);
app.use('/api/import', importRouter);

// Production Static Serving
const DIST_DIR = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ NEED ELECTRO ERP Backend Server Online`);
  console.log(`📍 Port: ${PORT} | Database: SQLite WAL (need_electro.db)`);
  console.log(`🏢 Business: NEED ELECTRO, Moulvibazar, Bangladesh`);
  console.log(`=======================================================`);
});
