import React from 'react';
import { LegalTemplatesManager } from '../components/admin/LegalTemplatesManager';

interface LegalTemplatesModuleProps {
  onNavigate: (module: string) => void;
}

export const LegalTemplatesModule: React.FC<LegalTemplatesModuleProps> = ({ onNavigate }) => {
  return <LegalTemplatesManager onNavigate={onNavigate} />;
};
