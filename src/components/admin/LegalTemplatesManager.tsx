import React, { useState, useEffect, useMemo } from 'react';
import { 
  LegalClause, 
  LegalTemplateVersion, 
  DEFAULT_20_COMPANY_CLAUSES, 
  DEFAULT_25_EMI_CLAUSES, 
  INITIAL_LEGAL_TEMPLATE_VERSION,
  interpolateClauseText,
  getCombinedContractClauses 
} from '../../services/legalTermsService';
import { useERP } from '../../services/erpStore';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Trash2, 
  MoveUp, MoveDown, Save, Eye, History, RotateCcw, Check, Lock, 
  Globe, Search, Filter, Sparkles, Building2, Calendar, UserCheck, 
  HelpCircle, ChevronRight, Download, RefreshCw
} from 'lucide-react';

interface LegalTemplatesManagerProps {
  onNavigate?: (module: string) => void;
}

export const LegalTemplatesManager: React.FC<LegalTemplatesManagerProps> = ({ onNavigate }) => {
  const { currentUser, settings, addToast } = useERP();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'EMI' | 'PREVIEW' | 'VERSIONS'>('COMPANY');
  const [languageMode, setLanguageMode] = useState<'EN' | 'BN' | 'BOTH'>('BOTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Stored state
  const [activePublishedVersion, setActivePublishedVersion] = useState<LegalTemplateVersion>(INITIAL_LEGAL_TEMPLATE_VERSION);
  const [draft, setDraft] = useState<LegalTemplateVersion>(INITIAL_LEGAL_TEMPLATE_VERSION);
  const [versions, setVersions] = useState<LegalTemplateVersion[]>([INITIAL_LEGAL_TEMPLATE_VERSION]);

  // Editing state
  const [editingClause, setEditingClause] = useState<LegalClause | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishVersionNumber, setPublishVersionNumber] = useState('v1.1');
  const [publishEffectiveDate, setPublishEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [publishNotes, setPublishNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New Clause State
  const [isAddClauseModalOpen, setIsAddClauseModalOpen] = useState(false);
  const [newClauseSection, setNewClauseSection] = useState<'COMPANY' | 'EMI'>('COMPANY');
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseTitleBn, setNewClauseTitleBn] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');
  const [newClauseContentBn, setNewClauseContentBn] = useState('');
  const [newClauseCategory, setNewClauseCategory] = useState('GENERAL');
  const [newClauseMandatory, setNewClauseMandatory] = useState(false);
  const [newClauseAppliesToEmi, setNewClauseAppliesToEmi] = useState(true);

  // Fetch templates from API
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/legal-templates');
      const json = await res.json();
      if (json.success && json.data) {
        setActivePublishedVersion(json.data.activeVersion || INITIAL_LEGAL_TEMPLATE_VERSION);
        setDraft(json.data.draft || json.data.activeVersion || INITIAL_LEGAL_TEMPLATE_VERSION);
        setVersions(json.data.versions || [INITIAL_LEGAL_TEMPLATE_VERSION]);

        // Suggest next version number
        const count = (json.data.versions || []).length;
        setPublishVersionNumber(`v${(1 + count * 0.1).toFixed(1)}`);
      }
    } catch (e: any) {
      console.error('Failed to load legal templates:', e);
      addToast('error', 'Load Error', 'Failed to fetch legal templates. Default templates loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/legal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_DRAFT',
          draft,
          notes: 'Draft updated from Admin Control Center.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Draft Saved', 'Legal terms draft saved successfully.');
      } else {
        addToast('error', 'Save Failed', json.error || 'Failed to save draft.');
      }
    } catch (e: any) {
      addToast('error', 'Network Error', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish New Version
  const handlePublishSubmit = async () => {
    if (!publishVersionNumber.trim()) {
      alert('Please enter a version number (e.g. v1.1, v2.0).');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/legal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PUBLISH',
          draft,
          newVersionNumber: publishVersionNumber.trim(),
          effectiveDate: publishEffectiveDate,
          notes: publishNotes.trim() || 'Published by administrator.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Version Published!', `Version ${publishVersionNumber} is now live and binding for all new EMI contracts.`);
        setIsPublishModalOpen(false);
        fetchTemplates();
      } else {
        addToast('error', 'Publish Error', json.error || 'Failed to publish version.');
      }
    } catch (e: any) {
      addToast('error', 'Network Error', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all draft clauses back to the standard institutional starter templates (20 Company Clauses + 25 EMI Clauses)? Any unsaved custom clauses will be refreshed.')) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/legal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_DEFAULTS' }),
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Defaults Restored', 'Draft reset to 20 company and 25 EMI standard clauses.');
        fetchTemplates();
      }
    } catch (e: any) {
      addToast('error', 'Error', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Revert active to a previous version
  const handleRevertVersion = async (targetVerId: string, verNum: string) => {
    if (!window.confirm(`Activate previous version ${verNum} as the binding legal template?`)) return;
    try {
      const res = await fetch('/api/legal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REVERT_TO_VERSION', targetVersionId: targetVerId }),
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Version Activated', `Activated ${verNum} as active legal standard.`);
        fetchTemplates();
      }
    } catch (e: any) {
      addToast('error', 'Error', e.message);
    }
  };

  // Reordering
  const handleMoveClause = (section: 'COMPANY' | 'EMI', index: number, direction: 'UP' | 'DOWN') => {
    const key = section === 'COMPANY' ? 'companyClauses' : 'emiClauses';
    const list = [...draft[key]];
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === list.length - 1)) return;

    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // re-number
    const renumbered = list.map((c, idx) => ({ ...c, number: idx + 1, order: idx + 1 }));
    setDraft(prev => ({ ...prev, [key]: renumbered }));
  };

  // Toggle Mandatory
  const handleToggleMandatory = (section: 'COMPANY' | 'EMI', clauseId: string) => {
    const key = section === 'COMPANY' ? 'companyClauses' : 'emiClauses';
    setDraft(prev => ({
      ...prev,
      [key]: prev[key].map(c => c.id === clauseId ? { ...c, isMandatory: !c.isMandatory } : c),
    }));
  };

  // Toggle Applies to EMI
  const handleToggleAppliesToEmi = (section: 'COMPANY' | 'EMI', clauseId: string) => {
    const key = section === 'COMPANY' ? 'companyClauses' : 'emiClauses';
    setDraft(prev => ({
      ...prev,
      [key]: prev[key].map(c => c.id === clauseId ? { ...c, appliesToEmi: !c.appliesToEmi } : c),
    }));
  };

  // Delete clause
  const handleDeleteClause = (section: 'COMPANY' | 'EMI', clauseId: string) => {
    const key = section === 'COMPANY' ? 'companyClauses' : 'emiClauses';
    const clause = draft[key].find(c => c.id === clauseId);
    if (clause?.isMandatory) {
      alert('Mandatory legal clauses cannot be deleted. Uncheck mandatory first if appropriate.');
      return;
    }
    if (!window.confirm(`Delete clause "${clause?.title}"?`)) return;

    const remaining = draft[key].filter(c => c.id !== clauseId).map((c, idx) => ({
      ...c,
      number: idx + 1,
      order: idx + 1,
    }));
    setDraft(prev => ({ ...prev, [key]: remaining }));
  };

  // Save edited clause
  const handleSaveEditedClause = () => {
    if (!editingClause) return;
    const key = editingClause.section === 'COMPANY' ? 'companyClauses' : 'emiClauses';
    setDraft(prev => ({
      ...prev,
      [key]: prev[key].map(c => c.id === editingClause.id ? editingClause : c),
    }));
    setEditingClause(null);
    addToast('success', 'Clause Updated', 'Clause updated in draft working copy.');
  };

  // Add new clause submit
  const handleAddClauseSubmit = () => {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) {
      alert('Please provide clause title and English text.');
      return;
    }
    const key = newClauseSection === 'COMPANY' ? 'companyClauses' : 'emiClauses';
    const count = draft[key].length;
    const newClause: LegalClause = {
      id: `custom-${Date.now()}`,
      number: count + 1,
      section: newClauseSection,
      category: newClauseCategory,
      title: newClauseTitle.trim(),
      titleBn: newClauseTitleBn.trim() || newClauseTitle.trim(),
      content: newClauseContent.trim(),
      contentBn: newClauseContentBn.trim() || newClauseContent.trim(),
      isMandatory: newClauseMandatory,
      appliesToEmi: newClauseAppliesToEmi,
      order: count + 1,
    };

    setDraft(prev => ({
      ...prev,
      [key]: [...prev[key], newClause],
    }));

    setIsAddClauseModalOpen(false);
    setNewClauseTitle('');
    setNewClauseTitleBn('');
    setNewClauseContent('');
    setNewClauseContentBn('');
    addToast('success', 'Clause Added', `New clause added to Section ${newClauseSection === 'COMPANY' ? 'A (Company)' : 'B (EMI)'}.`);
  };

  // Current clauses to display
  const currentClauses = useMemo(() => {
    const list = activeTab === 'COMPANY' ? draft.companyClauses : draft.emiClauses;
    return list.filter(c => {
      const matchesSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contentBn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [draft, activeTab, searchQuery, categoryFilter]);

  // Combined preview data
  const previewData = useMemo(() => {
    return getCombinedContractClauses(draft.companyClauses, draft.emiClauses, []);
  }, [draft]);

  // Sample context for live preview interpolation
  const sampleContext = useMemo(() => ({
    customerName: 'MD. ABDUR RAHMAN',
    customerPhone: '+880 1712-345678',
    customerAddress: 'House 14, Road 3, Kusumbag, Moulvibazar',
    customerNid: '19925812345678901',
    guarantorName: 'MR. TARIQUL ISLAM',
    guarantorPhone: '+880 1819-876543',
    guarantorRelation: 'Brother',
    guarantorNid: '19885898765432109',
    productName: 'HP ProBook 450 G10 (Core i5 13th Gen, 16GB, 512GB SSD)',
    serialNumber: '5CD3428XYZ',
    contractNumber: 'EMI-2026-7890',
    agreementDate: new Date().toISOString().split('T')[0],
    contractPrice: 75000,
    downPayment: 25000,
    financedAmount: 50000,
    interestRate: 0,
    isInterestFree: true,
    interestMethod: '0% Interest-Free Scheme',
    durationMonths: 6,
    monthlyInstallment: 8333,
    finalInstallment: 8335,
    firstDueDate: '2026-11-10',
    finalDueDate: '2027-04-10',
    gracePeriodDays: 5,
    lateFeePerDay: 50,
    companyName: settings?.companyName || 'NEED ELECTRO',
    companyPhone: settings?.phone || '+880 1733-983752',
    companyAddress: settings?.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh',
    companyEmail: settings?.email || 'info.needelectro@gmail.com',
  }), [settings]);

  return (
    <div className="module-container" style={{ padding: '1.25rem' }}>
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={24} color="var(--brand-primary)" />
            NEED ELECTRO Legal & Contract Templates
          </h2>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Centralized management of General Company Policies (Section A) & EMI Financing Terms (Section B)
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-sm btn-secondary" 
            onClick={fetchTemplates}
            disabled={isLoading}
            title="Refresh templates from server"
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            Refresh
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-secondary" 
            onClick={handleResetDefaults}
            disabled={isSaving}
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-primary" 
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save size={14} />
            Save Draft
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-success" 
            onClick={() => setIsPublishModalOpen(true)}
            disabled={isSaving}
            style={{ fontWeight: 800 }}
          >
            <ShieldCheck size={14} />
            Publish New Version
          </button>
        </div>
      </div>

      {/* Active Version Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(0, 140, 255, 0.08), rgba(16, 185, 129, 0.08))', 
        border: '1px solid rgba(0, 140, 255, 0.25)', 
        borderRadius: '10px', 
        padding: '0.85rem 1.25rem', 
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#10b981', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
            LIVE ACTIVE
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>{activePublishedVersion.versionNumber}: {activePublishedVersion.title}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Effective Date: {activePublishedVersion.effectiveDate} • Published By: {activePublishedVersion.publishedBy || 'System Admin'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Company Clauses:</span>{' '}
            <strong style={{ color: 'var(--brand-primary)' }}>{draft.companyClauses.length}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>EMI Clauses:</span>{' '}
            <strong style={{ color: '#10b981' }}>{draft.emiClauses.length}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Combined Contract Total:</span>{' '}
            <strong style={{ color: '#f59e0b' }}>{draft.companyClauses.filter(c => c.appliesToEmi !== false).length + draft.emiClauses.length} Clauses</strong>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'COMPANY' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('COMPANY')}
          style={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }}
        >
          <Building2 size={15} />
          Section A: General Company Terms ({draft.companyClauses.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'EMI' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('EMI')}
          style={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }}
        >
          <FileText size={15} />
          Section B: EMI-Specific Terms ({draft.emiClauses.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'PREVIEW' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('PREVIEW')}
          style={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }}
        >
          <Eye size={15} />
          Complete Agreement Preview (A + B)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'VERSIONS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('VERSIONS')}
          style={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }}
        >
          <History size={15} />
          Version History & Audit Log ({versions.length})
        </button>
      </div>

      {/* FILTER & TOOLBAR (For Tab COMPANY & EMI) */}
      {(activeTab === 'COMPANY' || activeTab === 'EMI') && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search clauses..."
                style={{ paddingLeft: '30px', fontSize: '0.8rem', height: '34px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Language Toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                type="button"
                className={`btn btn-xs ${languageMode === 'EN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLanguageMode('EN')}
              >
                English
              </button>
              <button
                type="button"
                className={`btn btn-xs ${languageMode === 'BN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLanguageMode('BN')}
              >
                বাংলা
              </button>
              <button
                type="button"
                className={`btn btn-xs ${languageMode === 'BOTH' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLanguageMode('BOTH')}
              >
                Dual View
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              setNewClauseSection(activeTab);
              setIsAddClauseModalOpen(true);
            }}
          >
            <Plus size={14} />
            Add Clause to Section {activeTab === 'COMPANY' ? 'A' : 'B'}
          </button>
        </div>
      )}

      {/* TAB 1 & 2: CLAUSE LIST */}
      {(activeTab === 'COMPANY' || activeTab === 'EMI') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentClauses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              No clauses matched the search filter.
            </div>
          ) : (
            currentClauses.map((clause, idx) => (
              <div 
                key={clause.id}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}
              >
                {/* Number & Reorder Handles */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '40px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: activeTab === 'COMPANY' ? 'rgba(0, 140, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: activeTab === 'COMPANY' ? 'var(--brand-primary)' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    {clause.number}
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      style={{ padding: '2px 4px' }}
                      disabled={idx === 0}
                      onClick={() => handleMoveClause(activeTab, idx, 'UP')}
                      title="Move Up"
                    >
                      <MoveUp size={11} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      style={{ padding: '2px 4px' }}
                      disabled={idx === currentClauses.length - 1}
                      onClick={() => handleMoveClause(activeTab, idx, 'DOWN')}
                      title="Move Down"
                    >
                      <MoveDown size={11} />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        {clause.number}. {clause.title}
                      </span>
                      {clause.isMandatory && (
                        <span className="badge badge-danger" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> MANDATORY
                        </span>
                      )}
                      {activeTab === 'COMPANY' && clause.appliesToEmi && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                          ✓ INCLUDED IN EMI CONTRACTS
                        </span>
                      )}
                      {activeTab === 'COMPANY' && !clause.appliesToEmi && (
                        <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                          OPTIONAL (RETAIL ONLY)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-xs btn-secondary"
                        onClick={() => handleToggleMandatory(activeTab, clause.id)}
                        title="Toggle mandatory requirement"
                      >
                        {clause.isMandatory ? 'Make Optional' : 'Make Mandatory'}
                      </button>
                      {activeTab === 'COMPANY' && (
                        <button
                          type="button"
                          className="btn btn-xs btn-secondary"
                          onClick={() => handleToggleAppliesToEmi(activeTab, clause.id)}
                          title="Toggle whether clause applies to EMI agreements"
                        >
                          {clause.appliesToEmi ? 'Exclude from EMI' : 'Include in EMI'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-xs btn-primary"
                        onClick={() => setEditingClause(clause)}
                      >
                        Edit
                      </button>
                      {!clause.isMandatory && (
                        <button
                          type="button"
                          className="btn btn-xs btn-secondary"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDeleteClause(activeTab, clause.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bilingual Content View */}
                  {(languageMode === 'EN' || languageMode === 'BOTH') && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: languageMode === 'BOTH' ? '6px' : '0' }}>
                      {clause.content}
                    </div>
                  )}

                  {(languageMode === 'BN' || languageMode === 'BOTH') && (
                    <div style={{ fontSize: '0.8rem', color: languageMode === 'BOTH' ? '#0284c7' : 'var(--text-main)', lineHeight: 1.5, background: languageMode === 'BOTH' ? 'rgba(0, 140, 255, 0.04)' : 'transparent', padding: languageMode === 'BOTH' ? '6px 8px' : '0', borderRadius: '4px' }}>
                      <span style={{ fontWeight: 700 }}>বাংলা:</span> {clause.titleBn} — {clause.contentBn}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETE AGREEMENT PREVIEW (A + B) */}
      {activeTab === 'PREVIEW' && (
        <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: '10px', padding: '2rem', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #008CFF', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#002B5B', margin: 0 }}>
              {settings?.companyName || 'NEED ELECTRO'}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '3px' }}>
              Trusted Electrical and Technological Solutions • Moulvibazar, Sylhet, Bangladesh
            </div>
            <div style={{ display: 'inline-block', background: '#002B5B', color: '#fff', fontSize: '0.8rem', fontWeight: 700, padding: '3px 12px', borderRadius: '4px', marginTop: '8px' }}>
              MASTER COMMERCIAL HIRE-PURCHASE & COMPLETE TERMS AGREEMENT
            </div>
          </div>

          {/* Sample Meta Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', fontSize: '0.8rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div><strong>Customer:</strong> {sampleContext.customerName} (NID: {sampleContext.customerNid})</div>
              <div><strong>Contact:</strong> {sampleContext.customerPhone} • {sampleContext.customerAddress}</div>
              <div><strong>Guarantor:</strong> {sampleContext.guarantorName} ({sampleContext.guarantorRelation})</div>
            </div>
            <div>
              <div><strong>Product:</strong> {sampleContext.productName}</div>
              <div><strong>Serial Number / IMEI:</strong> {sampleContext.serialNumber}</div>
              <div><strong>Contract Price:</strong> ৳{sampleContext.contractPrice.toLocaleString()} (Down Payment: ৳{sampleContext.downPayment.toLocaleString()})</div>
            </div>
          </div>

          {/* SECTION A */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ background: '#002B5B', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>SECTION A: NEED ELECTRO GENERAL COMPANY TERMS & CONDITIONS</span>
              <span>{previewData.sectionA.length} Standard Policies</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {previewData.sectionA.map(c => (
                <div key={c.id} style={{ fontSize: '0.8rem', lineHeight: 1.55 }}>
                  <div style={{ fontWeight: 800, color: '#002B5B' }}>
                    {c.number}. {languageMode === 'BN' ? c.titleBn : c.title}
                  </div>
                  <div style={{ color: '#334155', textAlign: 'justify' }}>
                    {interpolateClauseText(languageMode === 'BN' ? c.contentBn : c.content, sampleContext)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ background: '#10b981', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>SECTION B: HIRE-PURCHASE & EMI FINANCING SPECIFIC TERMS</span>
              <span>{previewData.sectionB.length} Contractual Clauses</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {previewData.sectionB.map(c => (
                <div key={c.id} style={{ fontSize: '0.8rem', lineHeight: 1.55 }}>
                  <div style={{ fontWeight: 800, color: '#065f46' }}>
                    {c.number}. {languageMode === 'BN' ? c.titleBn : c.title}
                  </div>
                  <div style={{ color: '#334155', textAlign: 'justify' }}>
                    {interpolateClauseText(languageMode === 'BN' ? c.contentBn : c.content, sampleContext)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '0.75rem' }}>
            <div>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '28px' }}></div>
              <strong>{sampleContext.customerName}</strong>
              <div>Customer Signature & Acceptance</div>
            </div>
            <div>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '28px' }}></div>
              <strong>{sampleContext.guarantorName}</strong>
              <div>Guarantor Signature</div>
            </div>
            <div>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '28px' }}></div>
              <strong>Authorized Signatory</strong>
              <div>For {settings?.companyName || 'NEED ELECTRO'}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERSION HISTORY */}
      {activeTab === 'VERSIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {versions.map(v => (
            <div 
              key={v.versionId}
              style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '1rem' }}>{v.versionNumber}: {v.title}</strong>
                  <span className={`badge ${v.status === 'PUBLISHED' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.65rem' }}>
                    {v.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Effective: <strong>{v.effectiveDate}</strong> • Published by: <strong>{v.publishedBy || 'System Admin'}</strong> ({v.publishedAt ? new Date(v.publishedAt).toLocaleString() : 'Baseline'})
                </div>
                {v.notes && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px', fontStyle: 'italic' }}>
                    Notes: {v.notes}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Clauses: {v.companyClauses?.length || 0} Company + {v.emiClauses?.length || 0} EMI
                </div>
              </div>

              <div>
                {v.status !== 'PUBLISHED' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleRevertVersion(v.versionId, v.versionNumber)}
                  >
                    Activate This Version
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT CLAUSE MODAL */}
      {editingClause && (
        <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ maxWidth: '700px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Edit Clause #{editingClause.number} ({editingClause.section === 'COMPANY' ? 'Section A: Company' : 'Section B: EMI'})</h3>
              <button type="button" className="btn btn-xs btn-secondary" onClick={() => setEditingClause(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Clause Title (English)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingClause.title}
                  onChange={e => setEditingClause({ ...editingClause, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clause Title (বাংলা)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingClause.titleBn}
                  onChange={e => setEditingClause({ ...editingClause, titleBn: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clause Content (English)</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={editingClause.content}
                  onChange={e => setEditingClause({ ...editingClause, content: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clause Content (বাংলা)</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={editingClause.contentBn}
                  onChange={e => setEditingClause({ ...editingClause, contentBn: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingClause.isMandatory}
                    onChange={e => setEditingClause({ ...editingClause, isMandatory: e.target.checked })}
                  />
                  <span>Mandatory Legal Clause</span>
                </label>
                {editingClause.section === 'COMPANY' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingClause.appliesToEmi}
                      onChange={e => setEditingClause({ ...editingClause, appliesToEmi: e.target.checked })}
                    />
                    <span>Automatically Applies to EMI Contracts</span>
                  </label>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingClause(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEditedClause}>Update Clause</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW CLAUSE MODAL */}
      {isAddClauseModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ maxWidth: '700px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Add New Clause to Section {newClauseSection === 'COMPANY' ? 'A (General Company Terms)' : 'B (EMI Terms)'}</h3>
              <button type="button" className="btn btn-xs btn-secondary" onClick={() => setIsAddClauseModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Section</label>
                <select
                  className="form-select"
                  value={newClauseSection}
                  onChange={e => setNewClauseSection(e.target.value as any)}
                >
                  <option value="COMPANY">Section A: General Company Terms</option>
                  <option value="EMI">Section B: EMI Financing Terms</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Title (English)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Courier Transit Insurance & Claims"
                  value={newClauseTitle}
                  onChange={e => setNewClauseTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Title (বাংলা)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. কুরিয়ার পরিবহন বীমা ও ক্লেইম নীতিমালা"
                  value={newClauseTitleBn}
                  onChange={e => setNewClauseTitleBn(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content (English)</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Clause text in English. Supports placeholders like {COMPANY_NAME}, {CUSTOMER_NAME}, {CONTRACT_PRICE}"
                  value={newClauseContent}
                  onChange={e => setNewClauseContent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content (বাংলা)</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="বাংলায় চুক্তির শর্তাবলি"
                  value={newClauseContentBn}
                  onChange={e => setNewClauseContentBn(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newClauseMandatory}
                    onChange={e => setNewClauseMandatory(e.target.checked)}
                  />
                  <span>Mandatory Clause</span>
                </label>
                {newClauseSection === 'COMPANY' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newClauseAppliesToEmi}
                      onChange={e => setNewClauseAppliesToEmi(e.target.checked)}
                    />
                    <span>Automatically Include in EMI Contracts</span>
                  </label>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddClauseModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAddClauseSubmit}>Add Clause</button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH VERSION MODAL */}
      {isPublishModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ maxWidth: '520px', width: '95%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="#10b981" />
                Publish Institutional Terms Version
              </h3>
              <button type="button" className="btn btn-xs btn-secondary" onClick={() => setIsPublishModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Publishing will activate this template for all <strong>future</strong> EMI contracts and customer acceptance forms. Existing accepted contracts will preserve their historical immutable terms.
              </div>

              <div className="form-group">
                <label className="form-label">Version Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={publishVersionNumber}
                  onChange={e => setPublishVersionNumber(e.target.value)}
                  placeholder="e.g. v1.1 or v2.0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Effective Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={publishEffectiveDate}
                  onChange={e => setPublishEffectiveDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Audit Notes / Release Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={publishNotes}
                  onChange={e => setPublishNotes(e.target.value)}
                  placeholder="e.g. Added transit insurance and updated consumer rights references."
                />
              </div>

              <div style={{ background: 'rgba(0, 140, 255, 0.08)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                Author: <strong>{currentUser?.name || 'Administrator'} ({currentUser?.role || 'SUPER_ADMIN'})</strong>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPublishModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-success" onClick={handlePublishSubmit} disabled={isSaving}>
                Confirm & Publish Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
