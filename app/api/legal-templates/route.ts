// NEED ELECTRO ERP — Centralized Legal & Contract Terms API
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { authenticateRequest } from '@/lib/auth';
import { 
  LegalTemplateVersion, 
  INITIAL_LEGAL_TEMPLATE_VERSION,
  DEFAULT_20_COMPANY_CLAUSES,
  DEFAULT_25_EMI_CLAUSES
} from '@/src/services/legalTermsService';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'legal_templates.json');

interface StoredTemplatesData {
  activeVersionId: string;
  versions: LegalTemplateVersion[];
  draft?: LegalTemplateVersion;
}

function loadTemplatesData(): StoredTemplatesData {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.versions) && parsed.versions.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read legal_templates.json:', e);
  }

  // Initial standard seed
  const initialData: StoredTemplatesData = {
    activeVersionId: INITIAL_LEGAL_TEMPLATE_VERSION.versionId,
    versions: [INITIAL_LEGAL_TEMPLATE_VERSION],
    draft: {
      ...INITIAL_LEGAL_TEMPLATE_VERSION,
      versionId: 'ver-draft',
      versionNumber: 'v1.1-draft',
      status: 'DRAFT',
      title: 'NEED ELECTRO Master Institutional Terms & Conditions (Draft)',
      notes: 'Work in progress draft.',
      companyClauses: JSON.parse(JSON.stringify(DEFAULT_20_COMPANY_CLAUSES)),
      emiClauses: JSON.parse(JSON.stringify(DEFAULT_25_EMI_CLAUSES)),
    },
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write initial legal_templates.json:', err);
  }

  return initialData;
}

function saveTemplatesData(data: StoredTemplatesData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save legal_templates.json:', err);
    throw err;
  }
}

export async function GET() {
  try {
    const data = loadTemplatesData();
    const activeVersion = data.versions.find(v => v.versionId === data.activeVersionId) || data.versions[0] || INITIAL_LEGAL_TEMPLATE_VERSION;

    return NextResponse.json({
      success: true,
      data: {
        activeVersion,
        draft: data.draft || {
          ...activeVersion,
          versionId: 'ver-draft',
          versionNumber: 'v1.1-draft',
          status: 'DRAFT',
        },
        versions: data.versions,
      },
    });
  } catch (err: any) {
    console.error('Fetch legal templates error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, draft, newVersionNumber, effectiveDate, notes } = body;
    const data = loadTemplatesData();

    if (action === 'SAVE_DRAFT') {
      if (!draft || !Array.isArray(draft.companyClauses) || !Array.isArray(draft.emiClauses)) {
        return NextResponse.json({ success: false, error: 'Invalid draft payload.' }, { status: 400 });
      }

      data.draft = {
        ...draft,
        versionId: 'ver-draft',
        status: 'DRAFT',
        author: user.name || 'Administrator',
        notes: notes || draft.notes || 'Updated draft.',
      };

      saveTemplatesData(data);
      return NextResponse.json({ success: true, message: 'Draft saved successfully.', data: data.draft });
    }

    if (action === 'PUBLISH') {
      if (!draft || !Array.isArray(draft.companyClauses) || !Array.isArray(draft.emiClauses)) {
        return NextResponse.json({ success: false, error: 'Draft content required for publishing.' }, { status: 400 });
      }

      // Determine next version number
      const nextVer = newVersionNumber || `v${(data.versions.length + 1).toFixed(1)}`;
      const newVersionId = `ver-${Date.now()}`;

      // Mark current active as ARCHIVED
      data.versions = data.versions.map(v => {
        if (v.versionId === data.activeVersionId) {
          return { ...v, status: 'ARCHIVED' as const };
        }
        return v;
      });

      const publishedVersion: LegalTemplateVersion = {
        versionId: newVersionId,
        versionNumber: nextVer,
        title: draft.title || `NEED ELECTRO Master Terms & Conditions (${nextVer})`,
        description: draft.description || 'Published company and EMI terms & conditions.',
        status: 'PUBLISHED',
        effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
        publishedAt: new Date().toISOString(),
        publishedBy: `${user.name} (${user.role})`,
        author: user.name,
        notes: notes || 'Formally published by authorized administrator.',
        companyClauses: draft.companyClauses,
        emiClauses: draft.emiClauses,
      };

      data.versions.unshift(publishedVersion);
      data.activeVersionId = newVersionId;

      // Reset draft to a clean working copy of the newly published version
      data.draft = {
        ...publishedVersion,
        versionId: 'ver-draft',
        versionNumber: `${nextVer}-draft`,
        status: 'DRAFT',
        notes: 'Working copy for future revisions.',
      };

      saveTemplatesData(data);
      return NextResponse.json({
        success: true,
        message: `Version ${nextVer} successfully published and activated for all new contracts.`,
        data: { activeVersion: publishedVersion, versions: data.versions },
      });
    }

    if (action === 'RESET_DEFAULTS') {
      data.draft = {
        ...INITIAL_LEGAL_TEMPLATE_VERSION,
        versionId: 'ver-draft',
        versionNumber: 'v-reset-draft',
        status: 'DRAFT',
        author: user.name,
        notes: 'Reset to system default standard 20 company and 25 EMI clauses.',
        companyClauses: JSON.parse(JSON.stringify(DEFAULT_20_COMPANY_CLAUSES)),
        emiClauses: JSON.parse(JSON.stringify(DEFAULT_25_EMI_CLAUSES)),
      };

      saveTemplatesData(data);
      return NextResponse.json({ success: true, message: 'Draft reset to default starter templates.', data: data.draft });
    }

    if (action === 'REVERT_TO_VERSION') {
      const { targetVersionId } = body;
      const target = data.versions.find(v => v.versionId === targetVersionId);
      if (!target) {
        return NextResponse.json({ success: false, error: 'Target version not found.' }, { status: 404 });
      }

      data.activeVersionId = target.versionId;
      data.versions = data.versions.map(v => ({
        ...v,
        status: v.versionId === target.versionId ? ('PUBLISHED' as const) : ('ARCHIVED' as const),
      }));

      saveTemplatesData(data);
      return NextResponse.json({
        success: true,
        message: `Active legal terms reverted to ${target.versionNumber}.`,
        data: { activeVersion: target, versions: data.versions },
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Legal template update error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
