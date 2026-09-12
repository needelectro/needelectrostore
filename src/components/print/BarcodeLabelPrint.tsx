import React, { useState, useRef } from 'react';
import { Product, SystemSettings } from '../../types';
import { Printer, X, Tag, Sliders, Check } from 'lucide-react';

// Standard Code 128 patterns (107 patterns: 0-106)
// Each number corresponds to bar/space module widths
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

function generateCode128Bars(text: string): boolean[] {
  const clean = text.trim() || 'PROD-000';
  let checksum = 104; // Start Code B
  const codes: number[] = [104];

  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const val = charCode - 32;
    if (val >= 0 && val <= 95) {
      codes.push(val);
      checksum += val * (i + 1);
    }
  }

  const checkCode = checksum % 103;
  codes.push(checkCode);
  codes.push(106); // Stop Code

  const bits: boolean[] = [];
  for (const c of codes) {
    const pattern = CODE128_PATTERNS[c] || '212222';
    let isBar = true;
    for (const w of pattern) {
      const width = parseInt(w, 10);
      for (let k = 0; k < width; k++) {
        bits.push(isBar);
      }
      isBar = !isBar;
    }
  }

  return bits;
}

export interface BarcodePrintProps {
  product: Product;
  serials?: string[];
  settings: SystemSettings;
  onClose: () => void;
}

export const BarcodeLabelPrint: React.FC<BarcodePrintProps> = ({
  product,
  serials = [],
  settings,
  onClose,
}) => {
  const [labelFormat, setLabelFormat] = useState<'thermal_50x25' | 'thermal_40x30' | 'a4_sheet'>('thermal_50x25');
  const [copies, setCopies] = useState<number>(serials.length > 0 ? serials.length : 4);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showCompany, setShowCompany] = useState<boolean>(true);
  const [showSpecs, setShowSpecs] = useState<boolean>(false);
  const [selectedSerialIndex, setSelectedSerialIndex] = useState<number>(-1); // -1 for SKU, >=0 for specific serial

  const activeCode = selectedSerialIndex >= 0 && serials[selectedSerialIndex]
    ? serials[selectedSerialIndex]
    : product.sku;

  const barcodeBars = generateCode128Bars(activeCode);

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    document.body.classList.add('is-printing-barcode');
    return () => {
      document.body.classList.remove('is-printing-barcode');
    };
  }, []);

  const labelsToRender = [];
  if (serials.length > 0 && selectedSerialIndex === -1) {
    // Print each serial individually
    for (const s of serials) {
      labelsToRender.push({ code: s, isSerial: true });
    }
  } else {
    // Print repeated copies of active code
    for (let i = 0; i < copies; i++) {
      labelsToRender.push({ code: activeCode, isSerial: selectedSerialIndex >= 0 });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto modal-overlay print-active-modal">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header Controls (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Barcode & Serial Sticker Generator
              </h2>
              <p className="text-xs text-slate-400">
                {product.name} ({product.sku})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              <Printer size={16} />
              Print Labels
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Configuration Bar (Hidden on Print) */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center gap-6 text-xs no-print">
          {/* Label Presets */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Format:</span>
            <select
              value={labelFormat}
              onChange={(e: any) => setLabelFormat(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="thermal_50x25">Thermal Roll (50mm × 25mm)</option>
              <option value="thermal_40x30">Thermal Roll (40mm × 30mm)</option>
              <option value="a4_sheet">A4 Sheet Grid (24 Labels / Page)</option>
            </select>
          </div>

          {/* Serial vs SKU Selector */}
          {serials.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Target:</span>
              <select
                value={selectedSerialIndex}
                onChange={(e) => setSelectedSerialIndex(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="-1">All Serial Units ({serials.length} stickers)</option>
                {serials.map((s, idx) => (
                  <option key={s} value={idx}>
                    Serial: {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          {(serials.length === 0 || selectedSerialIndex !== -1) && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Copies:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-center text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Toggle Switches */}
          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
              />
              Show Price
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showCompany}
                onChange={(e) => setShowCompany(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
              />
              Company Name
            </label>
          </div>
        </div>

        {/* Label Preview Container */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950 flex justify-center items-start">
          <div
            className={`barcode-print-canvas bg-white text-black p-4 rounded-lg shadow-xl ${
              labelFormat === 'a4_sheet' ? 'w-[210mm] min-h-[297mm] a4-grid' : 'thermal-roll'
            }`}
          >
            {labelFormat === 'a4_sheet' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8mm',
                  padding: '5mm',
                }}
              >
                {labelsToRender.map((item, idx) => (
                  <SingleLabelItem
                    key={idx}
                    product={product}
                    code={item.code}
                    isSerial={item.isSerial}
                    settings={settings}
                    showPrice={showPrice}
                    showCompany={showCompany}
                    height="32mm"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 items-center">
                {labelsToRender.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-dashed border-slate-300 p-2 break-after-page"
                    style={{
                      width: labelFormat === 'thermal_50x25' ? '50mm' : '40mm',
                      height: labelFormat === 'thermal_50x25' ? '25mm' : '30mm',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    <SingleLabelItem
                      product={product}
                      code={item.code}
                      isSerial={item.isSerial}
                      settings={settings}
                      showPrice={showPrice}
                      showCompany={showCompany}
                      isCompact={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Print CSS for Exact Physical Calibration */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .barcode-print-canvas, .barcode-print-canvas * {
            visibility: visible;
          }
          .barcode-print-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
          .break-after-page {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
};

interface SingleLabelProps {
  product: Product;
  code: string;
  isSerial?: boolean;
  settings: SystemSettings;
  showPrice: boolean;
  showCompany: boolean;
  height?: string;
  isCompact?: boolean;
}

const SingleLabelItem: React.FC<SingleLabelProps> = ({
  product,
  code,
  isSerial,
  settings,
  showPrice,
  showCompany,
  isCompact = false,
}) => {
  const bars = generateCode128Bars(code);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1.15,
        color: '#000000',
        padding: isCompact ? '1px 2px' : '6px 8px',
        border: isCompact ? 'none' : '1px solid #e2e8f0',
        borderRadius: isCompact ? '0' : '4px',
      }}
    >
      {/* Brand Header */}
      {showCompany && (
        <div style={{ fontSize: isCompact ? '7px' : '9px', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
          {settings.companyName || 'NEED ELECTRO'}
        </div>
      )}

      {/* Product Title */}
      <div
        style={{
          fontSize: isCompact ? '7.5px' : '10px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          marginTop: '1px',
        }}
        title={product.name}
      >
        {product.name}
      </div>

      {/* SVG Barcode Bars */}
      <div style={{ margin: isCompact ? '2px 0' : '4px 0', width: '92%', display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={`0 0 ${bars.length} 32`}
          style={{ width: '100%', height: isCompact ? '22px' : '32px' }}
          preserveAspectRatio="none"
        >
          {bars.map((isBlack, i) =>
            isBlack ? (
              <rect
                key={i}
                x={i}
                y={0}
                width={1}
                height={32}
                fill="#000000"
              />
            ) : null
          )}
        </svg>
      </div>

      {/* Code Text (Serial or SKU) */}
      <div
        style={{
          fontSize: isCompact ? '7px' : '9px',
          fontFamily: 'monospace',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        {isSerial ? `SN: ${code}` : code}
      </div>

      {/* Price Footer */}
      {showPrice && (
        <div
          style={{
            fontSize: isCompact ? '8.5px' : '11px',
            fontWeight: 800,
            marginTop: '1px',
          }}
        >
          ৳ {Number(product.retailPrice).toLocaleString('en-IN')}
        </div>
      )}
    </div>
  );
};

export default BarcodeLabelPrint;
