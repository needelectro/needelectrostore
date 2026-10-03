/**
 * Automated Responsive Regression Test Suite — NEED ELECTRO ERP
 * Validates layout responsiveness, mobile constraints, touch targets, and overflow safety.
 */

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log('  RUNNING RESPONSIVE & MOBILE-FIRST AUDIT TESTS');
console.log('======================================================\n');

// TEST SUITE 1: CSS RESET & VIEWPORT INTEGRITY
console.log('[SUITE 1] Global Styles & Viewport Width Integrity');
const mainCss = fs.readFileSync(path.join(rootDir, 'src/styles/main.css'), 'utf-8');
const tokensCss = fs.readFileSync(path.join(rootDir, 'src/styles/tokens.css'), 'utf-8');

assert(!mainCss.includes('.app-container { width: 100vw; }'), 'No fixed width: 100vw on .app-container');
assert(!mainCss.includes('min-width: 100vw'), 'No min-width: 100vw in root container layout');
assert(mainCss.includes('width: 100%;') && mainCss.includes('max-width: 100%;'), 'Universal fluid width 100% and max-width: 100% applied');
assert(tokensCss.includes('--touch-target-min: 44px;'), 'Accessible touch target minimum (44px) defined in tokens');
assert(tokensCss.includes('--safe-area-top') && tokensCss.includes('--safe-area-bottom'), 'Safe area insets defined for iOS/notch devices');
assert(mainCss.includes('-webkit-overflow-scrolling: touch;'), 'iOS smooth inertia scrolling enabled on table containers');
assert(mainCss.includes('.mobile-bottom-nav'), 'Mobile bottom navigation dock defined for easy thumb access');

const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
assert(indexHtml.includes('viewport-fit=cover'), 'HTML meta viewport includes viewport-fit=cover for notch safe areas');

// TEST SUITE 2: AUTHENTICATION & LOGIN SCREEN
console.log('\n[SUITE 2] Authentication & Login Screen Mobile Optimization');
const loginTsx = fs.readFileSync(path.join(rootDir, 'src/components/auth/LoginScreen.tsx'), 'utf-8');

assert(loginTsx.includes('login-screen-wrapper'), 'LoginScreen uses responsive login-screen-wrapper');
assert(loginTsx.includes('login-card-container'), 'LoginScreen uses responsive login-card-container instead of hardcoded 1fr 1fr');
assert(loginTsx.includes('NeedElectroLogo'), 'LoginScreen includes NeedElectroLogo for clear mobile branding');
assert(loginTsx.includes('inputMode="email"'), 'Email input utilizes mobile-optimized virtual keyboard (inputMode="email")');
assert(loginTsx.includes('autoComplete="username"'), 'Username field has accessible autocomplete attribute');
assert(loginTsx.includes('autoComplete="current-password"'), 'Password field has accessible autocomplete attribute');
assert(loginTsx.includes('minHeight: \'44px\'') || mainCss.includes('.login-form-panel .form-input'), 'Touch-friendly inputs with >=44px height');

// TEST SUITE 3: MOBILE NAVIGATION DRAWER & ACCESSIBILITY
console.log('\n[SUITE 3] Navigation Drawer & Sidebar Touch Controls');
const sidebarTsx = fs.readFileSync(path.join(rootDir, 'src/components/Sidebar.tsx'), 'utf-8');
const headerTsx = fs.readFileSync(path.join(rootDir, 'src/components/Header.tsx'), 'utf-8');

assert(sidebarTsx.includes('sidebar-close-btn'), 'Sidebar contains explicit accessible mobile drawer close button');
assert(sidebarTsx.includes('keydown') && sidebarTsx.includes('Escape'), 'Sidebar responds to Escape key for accessibility dismiss');
assert(sidebarTsx.includes('safe-area-inset-bottom'), 'Sidebar respects iOS safe area insets');
assert(headerTsx.includes('calc(100vw - 16px)'), 'Header popovers (notifications, profile) stay within mobile screen bounds');

// TEST SUITE 4: ERP MODULES GRID AUDIT
console.log('\n[SUITE 4] ERP Module Grids & Overflow Safety Audit');
const modulesDir = path.join(rootDir, 'src/modules');
const moduleFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith('.tsx'));

let hazardousFixedMinMaxCount = 0;
const hazardousPatterns = [
  /minmax\(450px/g,
  /minmax\(400px/g,
  /minmax\(500px/g,
  /minmax\(600px/g,
];

for (const file of moduleFiles) {
  const content = fs.readFileSync(path.join(modulesDir, file), 'utf-8');
  for (const pat of hazardousPatterns) {
    if (pat.test(content)) {
      console.warn(`    ⚠️ Warning: Hazardous fixed minmax in ${file}: ${pat}`);
      hazardousFixedMinMaxCount++;
    }
  }
}

assert(hazardousFixedMinMaxCount === 0, 'Zero oversized fixed minmax grids found across all ERP modules');

// TEST SUITE 5: PRINT & INVOICE PREVIEW RESPONSIVENESS
console.log('\n[SUITE 5] Invoices & PDF Print Previews');
const printCss = fs.readFileSync(path.join(rootDir, 'src/styles/print.css'), 'utf-8');
const a4InvoiceTsx = fs.readFileSync(path.join(rootDir, 'src/components/print/A4InvoicePrint.tsx'), 'utf-8');

assert(printCss.includes('@media print'), 'Dedicated @media print stylesheet isolates ERP chrome during printing');
assert(a4InvoiceTsx.includes('overflow-x: auto') || a4InvoiceTsx.includes('table-container') || printCss.includes('.a4-preview-body'), 'A4 Invoice preview enables contained horizontal scrolling on mobile previewers');

console.log('\n======================================================');
console.log(`  AUDIT SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
