import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './services/erpStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer } from './components/ToastContainer';
import { A4InvoicePrint } from './components/print/A4InvoicePrint';
import { ThermalReceiptPrint } from './components/print/ThermalReceiptPrint';
import { EMIAgreementPrint } from './components/print/EMIAgreementPrint';
import { BarcodeLabelPrint } from './components/print/BarcodeLabelPrint';
import { LoginScreen } from './components/auth/LoginScreen';
import { LockScreenModal } from './components/auth/LockScreenModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShieldAlert } from 'lucide-react';

// Modules
import { DashboardModule } from './modules/DashboardModule';
import { POSModule } from './modules/POSModule';
import { SalesModule } from './modules/SalesModule';
import { EMIModule } from './modules/EMIModule';
import { InventoryModule } from './modules/InventoryModule';
import { PurchaseModule } from './modules/PurchaseModule';
import { ProductsModule } from './modules/ProductsModule';
import { CustomerModule } from './modules/CustomerModule';
import { SupplierModule } from './modules/SupplierModule';
import { ServiceModule } from './modules/ServiceModule';
import { WarrantyModule } from './modules/WarrantyModule';
import { AccountingModule } from './modules/AccountingModule';
import { LedgersModule } from './modules/LedgersModule';
import { ExpenseModule } from './modules/ExpenseModule';
import { ReportsModule } from './modules/ReportsModule';
import { EmployeeModule } from './modules/EmployeeModule';
import { BranchModule } from './modules/BranchModule';
import { RolesModule } from './modules/RolesModule';
import { AuditModule } from './modules/AuditModule';
import { SettingsModule } from './modules/SettingsModule';
import { ReturnsModule } from './modules/ReturnsModule';
import { ControlCenterModule } from './modules/ControlCenterModule';

import { InitialSetupModal } from './components/auth/InitialSetupModal';

const MainAppLayout: React.FC = () => {
  const { 
    settings, activeInvoiceToPrint, setActiveInvoiceToPrint,
    activeThermalReceiptToPrint, setActiveThermalReceiptToPrint,
    activeEmiAgreementToPrint, setActiveEmiAgreementToPrint,
    activeBarcodeToPrint, setActiveBarcodeToPrint,
    isAuthenticated, isLocked, currentUser, hasPermission, setupStatus
  } = useERP();

  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [moduleInitialParam, setModuleInitialParam] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (module: string, targetId?: string) => {
    setActiveModule(module);
    setModuleInitialParam(targetId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section 51: First installation with no Super Admin / Initial Setup not completed
  if (!setupStatus?.initialSetupCompleted) {
    return (
      <>
        <InitialSetupModal isOpen={true} />
        <ToastContainer />
      </>
    );
  }

  // If not authenticated, present the enterprise branded Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  const renderActiveModule = () => {
    // Role-based access control check
    if (!hasPermission(activeModule)) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <ShieldAlert size={32} />
            </div>
            
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Access Restricted
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your current account role (<strong style={{ color: 'var(--brand-primary)' }}>{currentUser?.role}</strong>) does not have authorization to view or manage the <strong style={{ color: 'var(--text-primary)' }}>{activeModule.toUpperCase()}</strong> module.
            </p>

            <div style={{
              background: 'var(--bg-card-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1.75rem',
              textAlign: 'left'
            }}>
              💡 <em>Enterprise Security Policy:</em> If you require access to this section, contact your System Administrator or switch to a role with higher clearance via the top-right profile menu.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary"
                onClick={() => handleNavigate('dashboard')}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule onNavigate={handleNavigate} />;
      case 'pos':
        return <POSModule onNavigate={handleNavigate} />;
      case 'sales':
        return <SalesModule onNavigate={handleNavigate} />;
      case 'returns':
        return <ReturnsModule onNavigate={handleNavigate} />;
      case 'emi':
        return <EMIModule initialMode={moduleInitialParam} onNavigate={handleNavigate} />;
      case 'inventory':
        return <InventoryModule onNavigate={handleNavigate} />;
      case 'purchases':
        return <PurchaseModule onNavigate={handleNavigate} />;
      case 'products':
        return <ProductsModule onNavigate={handleNavigate} />;
      case 'customers':
        return <CustomerModule onNavigate={handleNavigate} />;
      case 'suppliers':
        return <SupplierModule onNavigate={handleNavigate} />;
      case 'service':
        return <ServiceModule onNavigate={handleNavigate} />;
      case 'warranty':
        return <WarrantyModule onNavigate={handleNavigate} />;
      case 'accounting':
        return <AccountingModule onNavigate={handleNavigate} />;
      case 'ledgers':
        return <LedgersModule onNavigate={handleNavigate} />;
      case 'expenses':
        return <ExpenseModule onNavigate={handleNavigate} />;
      case 'reports':
        return <ReportsModule onNavigate={handleNavigate} />;
      case 'employees':
        return <EmployeeModule onNavigate={handleNavigate} />;
      case 'branches':
        return <BranchModule onNavigate={handleNavigate} />;
      case 'roles':
        return <RolesModule onNavigate={handleNavigate} />;
      case 'audit':
        return <AuditModule onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsModule onNavigate={handleNavigate} />;
      case 'control_center':
        return <ControlCenterModule onNavigate={handleNavigate} />;
      default:
        return <DashboardModule onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <div className="main-viewport">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateToModule={handleNavigate}
          toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        <main className="content-scrollable">
          <ErrorBoundary fallbackTitle="Module Error">
            {renderActiveModule()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToModule={handleNavigate}
      />

      {/* Toast Feedback */}
      <ToastContainer />

      {/* Lock Screen Security Overlay */}
      {isLocked && <LockScreenModal />}

      {/* Active Print Overlays */}
      {activeInvoiceToPrint && (
        <ErrorBoundary onReset={() => setActiveInvoiceToPrint(null)}>
          <A4InvoicePrint
            sale={activeInvoiceToPrint}
            settings={settings}
            onClose={() => setActiveInvoiceToPrint(null)}
            onSwitchToThermal={() => {
              const currentSale = activeInvoiceToPrint;
              setActiveInvoiceToPrint(null);
              setActiveThermalReceiptToPrint(currentSale);
            }}
          />
        </ErrorBoundary>
      )}

      {activeThermalReceiptToPrint && (
        <ErrorBoundary onReset={() => setActiveThermalReceiptToPrint(null)}>
          <ThermalReceiptPrint
            sale={activeThermalReceiptToPrint}
            settings={settings}
            onClose={() => setActiveThermalReceiptToPrint(null)}
            onSwitchToA4={() => {
              const currentSale = activeThermalReceiptToPrint;
              setActiveThermalReceiptToPrint(null);
              setActiveInvoiceToPrint(currentSale);
            }}
          />
        </ErrorBoundary>
      )}

      {activeEmiAgreementToPrint && (
        <ErrorBoundary onReset={() => setActiveEmiAgreementToPrint(null)}>
          <EMIAgreementPrint
            account={activeEmiAgreementToPrint}
            settings={settings}
            onClose={() => setActiveEmiAgreementToPrint(null)}
          />
        </ErrorBoundary>
      )}

      {/* Barcode & Serial Label Print Overlay */}
      {activeBarcodeToPrint && (
        <ErrorBoundary onReset={() => setActiveBarcodeToPrint(null)}>
          <BarcodeLabelPrint
            product={activeBarcodeToPrint.product}
            serials={activeBarcodeToPrint.serials}
            settings={settings}
            onClose={() => setActiveBarcodeToPrint(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export function App() {
  return (
    <ERPProvider>
      <MainAppLayout />
    </ERPProvider>
  );
}

export default App;
