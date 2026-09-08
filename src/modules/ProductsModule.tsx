import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { Product, ProductCategory, LaptopSpecifications } from '../types';
import { 
  PackageSearch, Plus, Search, Edit2, Laptop, 
  Tag, Layers, Hash, Check, X, ShieldAlert 
} from 'lucide-react';

interface ProductsModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({ onNavigate }) => {
  const { products, createProduct, updateProduct, suppliers, serials, setActiveBarcodeToPrint } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Laptop');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(30000);
  const [costPrice, setCostPrice] = useState<number>(31500);
  const [retailPrice, setRetailPrice] = useState<number>(38000);
  const [wholesalePrice, setWholesalePrice] = useState<number>(36000);
  const [emiPrice, setEmiPrice] = useState<number>(42000);
  const [currentStock, setCurrentStock] = useState<number>(5);
  const [minStock, setMinStock] = useState<number>(2);
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
  const [isSerialized, setIsSerialized] = useState<boolean>(true);

  // Tech Specs
  const [cpu, setCpu] = useState('Intel Core i5 10th Gen');
  const [ram, setRam] = useState('16GB DDR4');
  const [storage, setStorage] = useState('512GB NVMe SSD');
  const [display, setDisplay] = useState('14.0" FHD IPS');
  const [batteryCondition, setBatteryCondition] = useState('92% Health (4-5 hrs)');
  const [physicalCondition, setPhysicalCondition] = useState('Grade A+ Pristine');

  const categories: ProductCategory[] = [
    'Laptop', 'Desktop', 'Monitor', 'Smartphone', 'Tablet', 'Printer',
    'CCTV', 'Router', 'Networking', 'Computer Accessories', 'Laptop Accessories',
    'Electrical Products', 'Cables', 'Chargers', 'Adapters', 'Other Gadgets'
  ];

  const filteredProducts = products.filter(p => {
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = p.name.toLowerCase().includes(q) || 
                         p.sku.toLowerCase().includes(q) || 
                         p.brand.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleOpenAdd = () => {
    setName('');
    setSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategory('Laptop');
    setBrand('HP');
    setModel('EliteBook');
    setDescription('');
    setIsSerialized(true);
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      alert('Product name and SKU are required.');
      return;
    }

    const specs: LaptopSpecifications | undefined = category === 'Laptop' ? {
      processor: cpu,
      ram,
      storage,
      display,
      operatingSystem: 'Windows 11 Pro Genuine',
      batteryCondition,
      physicalCondition,
      generation: '10th Gen',
      color: 'Silver'
    } : undefined;

    let res;
    if (editingProduct) {
      res = await updateProduct({
        ...editingProduct,
        name,
        sku,
        category,
        brand,
        model,
        description,
        purchasePrice,
        costPrice,
        retailPrice,
        wholesalePrice,
        emiPrice,
        currentStock,
        minStock,
        supplierId,
        warrantyPeriodMonths: warrantyMonths,
        isSerialized,
        specs
      });
    } else {
      res = await createProduct({
        name,
        sku,
        category,
        brand,
        model,
        description,
        purchasePrice,
        costPrice,
        retailPrice,
        wholesalePrice,
        emiPrice,
        currentStock,
        minStock,
        supplierId,
        warrantyPeriodMonths: warrantyMonths,
        isSerialized,
        status: 'ACTIVE',
        specs
      });
    }

    if (res?.success) {
      setShowAddModal(false);
    } else if (res?.error) {
      alert(`Failed to save product: ${res.error}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <PackageSearch size={28} color="var(--brand-primary)" />
            Product & Equipment Catalog
          </h1>
          <p>
            Manage multi-tier pricing (Retail, Wholesale, EMI), specifications (Laptops, CCTV, Electricals), and warranty parameters.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Catalog Table Card */}
      <div className="erp-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Name, SKU, Brand..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            {['ALL', 'Laptop', 'CCTV', 'Router', 'Electrical Products', 'Cables'].map(c => (
              <button
                key={c}
                className={`btn btn-sm ${categoryFilter === c ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product & Specifications</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Cost</th>
                <th style={{ textAlign: 'right' }}>Retail (৳)</th>
                <th style={{ textAlign: 'right' }}>EMI Price (৳)</th>
                <th style={{ textAlign: 'center' }}>Stock</th>
                <th style={{ textAlign: 'center' }}>Warranty</th>
                <th style={{ textAlign: 'center' }}>Tracking</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      SKU: {p.sku} • Brand: {p.brand}
                    </div>
                    {p.specs && 'processor' in p.specs && (
                      <div style={{ fontSize: '0.7rem', color: '#2563eb', marginTop: '2px' }}>
                        {(p.specs as LaptopSpecifications).processor} | {(p.specs as LaptopSpecifications).ram} | {(p.specs as LaptopSpecifications).storage}
                      </div>
                    )}
                  </td>
                  <td><span className="badge badge-neutral">{p.category}</span></td>
                  <td style={{ textAlign: 'right' }}>৳{p.costPrice.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{p.retailPrice.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: '#f59e0b', fontWeight: 'bold' }}>
                    {p.emiPrice > 0 ? `৳${p.emiPrice.toLocaleString()}` : '—'}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: p.currentStock <= p.minStock ? '#ef4444' : '#10b981' }}>
                    {p.currentStock}
                  </td>
                  <td style={{ textAlign: 'center' }}>{p.warrantyPeriodMonths} Months</td>
                  <td style={{ textAlign: 'center' }}>
                    {p.isSerialized ? (
                      <span className="badge badge-info"><Hash size={11} /> Serialized</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quantity</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.3rem' }}
                        title="Print Barcode Labels"
                        onClick={() => {
                          const prodSerials = serials.filter(s => s.productId === p.id && s.status === 'AVAILABLE').map(s => s.serialNumber);
                          setActiveBarcodeToPrint({ product: p, serials: prodSerials });
                        }}
                      >
                        <Tag size={12} /> Barcode
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.3rem' }}
                        onClick={() => {
                          setEditingProduct(p);
                          setName(p.name);
                          setSku(p.sku);
                          setCategory(p.category);
                          setBrand(p.brand);
                          setModel(p.model);
                          setDescription(p.description);
                          setPurchasePrice(p.purchasePrice);
                          setCostPrice(p.costPrice);
                          setRetailPrice(p.retailPrice);
                          setWholesalePrice(p.wholesalePrice);
                          setEmiPrice(p.emiPrice);
                          setCurrentStock(p.currentStock);
                          setMinStock(p.minStock);
                          setSupplierId(p.supplierId);
                          setWarrantyMonths(p.warrantyPeriodMonths);
                          setIsSerialized(p.isSerialized);
                          setShowAddModal(true);
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-xl" style={{ maxHeight: '92vh' }}>
            <div className="modal-header">
              <div className="modal-title">
                <PackageSearch size={20} color="var(--brand-primary)" />
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Catalog'}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={e => setCategory(e.target.value as ProductCategory)}
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      className="form-input"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warranty Period (Months)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={warrantyMonths}
                      onChange={e => setWarrantyMonths(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Multi-Tier Pricing Fields */}
                <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
                    Multi-Tier Commercial Pricing Strategy (৳ BDT)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Purchase Price</label>
                      <input
                        type="number"
                        className="form-input"
                        value={purchasePrice}
                        onChange={e => setPurchasePrice(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cost (Landed)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={costPrice}
                        onChange={e => setCostPrice(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Retail Price</label>
                      <input
                        type="number"
                        className="form-input"
                        value={retailPrice}
                        onChange={e => setRetailPrice(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Wholesale Price</label>
                      <input
                        type="number"
                        className="form-input"
                        value={wholesalePrice}
                        onChange={e => setWholesalePrice(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">EMI Price</label>
                      <input
                        type="number"
                        className="form-input"
                        value={emiPrice}
                        onChange={e => setEmiPrice(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Tech Specs if Laptop */}
                {category === 'Laptop' && (
                  <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Laptop size={16} color="var(--brand-primary)" />
                      Dedicated Laptop Hardware Specifications
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Processor (CPU)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cpu}
                          onChange={e => setCpu(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">RAM Memory</label>
                        <input
                          type="text"
                          className="form-input"
                          value={ram}
                          onChange={e => setRam(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Storage (SSD/HDD)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={storage}
                          onChange={e => setStorage(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Display Size & Panel</label>
                        <input
                          type="text"
                          className="form-input"
                          value={display}
                          onChange={e => setDisplay(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Battery Health</label>
                        <input
                          type="text"
                          className="form-input"
                          value={batteryCondition}
                          onChange={e => setBatteryCondition(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Physical Condition Grade</label>
                        <input
                          type="text"
                          className="form-input"
                          value={physicalCondition}
                          onChange={e => setPhysicalCondition(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
