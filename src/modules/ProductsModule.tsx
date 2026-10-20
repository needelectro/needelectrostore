import React, { useState, useEffect } from 'react';
import { useERP } from '../services/erpStore';
import { Product, ProductCategory, LaptopSpecifications } from '../types';
import { isProductInCategory, SHOWROOM_CATEGORIES } from '../services/categoryMatcher';
import { api } from '../services/api';
import { 
  PackageSearch, Plus, Search, Edit2, Laptop, 
  Tag, Layers, Hash, Check, X, ShieldAlert, Trash2,
  UploadCloud, Image as ImageIcon, Link as LinkIcon, Star,
  Eye, EyeOff, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';

interface ProductsModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
  initialProductId?: string;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({ onNavigate, initialProductId }) => {
  const { products, createProduct, updateProduct, deleteProduct, suppliers, serials, setActiveBarcodeToPrint, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState(() => initialProductId || '');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(() => {
    if (initialProductId) {
      return products.find(p => p.id === initialProductId || p.sku === initialProductId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialProductId) {
      const match = products.find(p => p.id === initialProductId || p.sku === initialProductId);
      if (match) {
        setEditingProduct(match);
      } else {
        setSearchQuery(initialProductId);
      }
    }
  }, [initialProductId, products]);

  // Form State - No defaults for new products
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [retailPrice, setRetailPrice] = useState<number | ''>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
  const [emiPrice, setEmiPrice] = useState<number | ''>('');
  const [currentStock, setCurrentStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [warrantyMonths, setWarrantyMonths] = useState<number | ''>('');
  const [isSerialized, setIsSerialized] = useState<boolean>(false);
  const [initialSerialsText, setInitialSerialsText] = useState<string>('');

  // Tech Specs
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [display, setDisplay] = useState('');
  const [batteryCondition, setBatteryCondition] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState('');

  // Product Media & Storefront Visibility
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [urlTestStatus, setUrlTestStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  // Handle Device File Upload (Method A)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadError('');

    // Client-side validations
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('File is too large. Maximum image size is 5MB.');
      return;
    }

    try {
      setIsUploadingImage(true);
      const res = await api.storage.uploadFile(file, 'products');
      if (res && res.success && res.publicUrl) {
        const uploadedUrl = res.publicUrl;
        setImageUrl(prev => prev || uploadedUrl);
        setImages(prev => prev.includes(uploadedUrl) ? prev : [...prev, uploadedUrl]);
        setImageUploadError('');
      } else {
        setImageUploadError(res?.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      setImageUploadError(err.message || 'Error uploading file to storage.');
    } finally {
      setIsUploadingImage(false);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  // Handle External Image URL (Method B)
  const handleApplyExternalUrl = () => {
    const url = externalUrlInput.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setImageUploadError('Please provide a valid URL starting with http:// or https://');
      return;
    }

    setUrlTestStatus('testing');
    setImageUploadError('');

    // Pre-test image loading in browser
    const testImg = new window.Image();
    testImg.onload = () => {
      setUrlTestStatus('valid');
      setImageUrl(prev => prev || url);
      setImages(prev => prev.includes(url) ? prev : [...prev, url]);
      setExternalUrlInput('');
      setTimeout(() => setUrlTestStatus('idle'), 2000);
    };
    testImg.onerror = () => {
      setUrlTestStatus('invalid');
      setImageUploadError('The remote URL could not be loaded as an image. Please verify the URL.');
    };
    testImg.src = url;
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const nextImages = images.filter(u => u !== urlToRemove);
    setImages(nextImages);
    if (imageUrl === urlToRemove) {
      setImageUrl(nextImages[0] || '');
    }
  };

  const handleSetPrimaryImage = (targetUrl: string) => {
    setImageUrl(targetUrl);
    if (!images.includes(targetUrl)) {
      setImages(prev => [targetUrl, ...prev]);
    }
  };

  const categories: ProductCategory[] = [
    'Laptop', 'Desktop', 'Monitor', 'Smartphone', 'Tablet', 'Printer',
    'CCTV', 'Router', 'Networking', 'Computer Accessories', 'Laptop Accessories',
    'Electrical Products', 'Cables', 'Chargers', 'Adapters', 'Other Gadgets'
  ];

  const filteredProducts = products.filter(p => {
    const matchesCat = isProductInCategory(p, categoryFilter);
    const matchesSup = supplierFilter === 'ALL' || p.supplierId === supplierFilter;
    const q = searchQuery.toLowerCase();
    const sup = suppliers.find(s => s.id === p.supplierId);
    const matchesQuery = p.name.toLowerCase().includes(q) || 
                         p.sku.toLowerCase().includes(q) || 
                         p.brand.toLowerCase().includes(q) ||
                         (sup && (sup.name.toLowerCase().includes(q) || (sup.company && sup.company.toLowerCase().includes(q))));
    return matchesCat && matchesSup && matchesQuery;
  });

  const handleOpenAdd = () => {
    setName('');
    setSku('');
    setCategory('');
    setBrand('');
    setModel('');
    setDescription('');
    setPurchasePrice('');
    setCostPrice('');
    setRetailPrice('');
    setWholesalePrice('');
    setEmiPrice('');
    setCurrentStock(1);
    setMinStock(3);
    setSupplierId('');
    setWarrantyMonths('');
    setIsSerialized(false);
    setInitialSerialsText('');
    setCpu('');
    setRam('');
    setStorage('');
    setDisplay('');
    setBatteryCondition('');
    setPhysicalCondition('');
    setImageUrl('');
    setImages([]);
    setIsPublished(true);
    setIsFeatured(false);
    setImageUploadError('');
    setExternalUrlInput('');
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product name is required.');
      return;
    }
    if (!category) {
      alert('Please select a product category.');
      return;
    }

    const finalSku = sku.trim() || `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalBrand = brand.trim() || 'Generic';

    const numPurchase = purchasePrice === '' ? 0 : Number(purchasePrice);
    const numCost = costPrice === '' ? 0 : Number(costPrice);
    const numRetail = retailPrice === '' ? 0 : Number(retailPrice);
    const numWholesale = wholesalePrice === '' ? 0 : Number(wholesalePrice);
    const numEmi = emiPrice === '' ? 0 : Number(emiPrice);
    const numStock = currentStock === '' ? 0 : Number(currentStock);
    const numMinStock = minStock === '' ? 0 : Number(minStock);
    const numWarranty = warrantyMonths === '' ? 0 : Number(warrantyMonths);

    const hasAnyLaptopSpec = !!(cpu.trim() || ram.trim() || storage.trim() || display.trim() || batteryCondition.trim() || physicalCondition.trim());

    const specs: LaptopSpecifications | undefined = (category === 'Laptop' && hasAnyLaptopSpec) ? {
      processor: cpu.trim(),
      ram: ram.trim(),
      storage: storage.trim(),
      display: display.trim(),
      operatingSystem: (editingProduct?.specs as LaptopSpecifications | undefined)?.operatingSystem || '',
      batteryCondition: batteryCondition.trim(),
      physicalCondition: physicalCondition.trim(),
      generation: (editingProduct?.specs as LaptopSpecifications | undefined)?.generation || '',
      color: (editingProduct?.specs as LaptopSpecifications | undefined)?.color || ''
    } : (editingProduct?.specs as LaptopSpecifications | undefined);

    let res;
    if (editingProduct) {
      res = await updateProduct({
        ...editingProduct,
        name: name.trim(),
        sku: finalSku,
        category: category as ProductCategory,
        brand: finalBrand,
        model: model.trim(),
        description: description.trim(),
        purchasePrice: numPurchase,
        costPrice: numCost,
        retailPrice: numRetail,
        wholesalePrice: numWholesale,
        emiPrice: numEmi,
        currentStock: numStock,
        minStock: numMinStock,
        supplierId,
        warrantyPeriodMonths: numWarranty,
        isSerialized,
        imageUrl: imageUrl.trim() || undefined,
        images: images.length > 0 ? images : (imageUrl.trim() ? [imageUrl.trim()] : []),
        isPublished,
        isFeatured,
        specs
      });
    } else {
      res = await createProduct({
        name: name.trim(),
        sku: finalSku,
        category: category as ProductCategory,
        brand: finalBrand,
        model: model.trim(),
        description: description.trim(),
        purchasePrice: numPurchase,
        costPrice: numCost,
        retailPrice: numRetail,
        wholesalePrice: numWholesale,
        emiPrice: numEmi,
        currentStock: numStock,
        minStock: numMinStock,
        supplierId,
        warrantyPeriodMonths: numWarranty,
        isSerialized,
        imageUrl: imageUrl.trim() || undefined,
        images: images.length > 0 ? images : (imageUrl.trim() ? [imageUrl.trim()] : []),
        status: 'ACTIVE',
        isPublished,
        isFeatured,
        specs
      }, initialSerialsText ? initialSerialsText.split(',').map(s => s.trim()).filter(Boolean) : undefined);
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
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by Name, SKU, Brand, Supplier..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: '200px', height: '36px', fontSize: '0.82rem' }}
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              title="Filter catalog by Supplier"
            >
              <option value="ALL">All Suppliers ({suppliers.length})</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.company || s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {['ALL', ...SHOWROOM_CATEGORIES].map(c => {
              const count = c === 'ALL'
                ? products.length
                : products.filter(p => isProductInCategory(p, c)).length;

              return (
                <button
                  key={c}
                  className={`btn btn-sm ${categoryFilter === c ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryFilter(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                    fontWeight: categoryFilter === c ? 700 : 500
                  }}
                >
                  <span>{c}</span>
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        background: categoryFilter === c ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.08)',
                        fontWeight: 700
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product & Specifications</th>
                <th>Category</th>
                <th>Supplier (সরবরাহকারী)</th>
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
              {filteredProducts.map(p => {
                const matchedSupplier = suppliers.find(s => s.id === p.supplierId);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Thumbnail Preview */}
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: 'var(--bg-card-muted)',
                          border: '1px solid var(--border-color)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon size={18} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{p.name}</span>
                            {p.isFeatured && (
                              <span title="Featured in Spotlight" style={{ color: '#f59e0b', display: 'inline-flex' }}>
                                <Star size={13} fill="#f59e0b" />
                              </span>
                            )}
                            {p.isPublished === false && (
                              <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                                Hidden
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            SKU: {p.sku} • Brand: {p.brand}
                          </div>
                          {p.specs && 'processor' in p.specs && (
                            <div style={{ fontSize: '0.7rem', color: '#2563eb', marginTop: '2px' }}>
                              {(p.specs as LaptopSpecifications).processor} | {(p.specs as LaptopSpecifications).ram} | {(p.specs as LaptopSpecifications).storage}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{p.category}</span></td>
                    <td>
                      {matchedSupplier ? (
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {matchedSupplier.company || matchedSupplier.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          — Direct / None —
                        </span>
                      )}
                    </td>
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
                          setDescription(p.description || '');
                          setPurchasePrice(p.purchasePrice || '');
                          setCostPrice(p.costPrice || '');
                          setRetailPrice(p.retailPrice || '');
                          setWholesalePrice(p.wholesalePrice || '');
                          setEmiPrice(p.emiPrice || '');
                          setCurrentStock(p.currentStock || '');
                          setMinStock(p.minStock || '');
                          setSupplierId(p.supplierId || '');
                          setWarrantyMonths(p.warrantyPeriodMonths || '');
                          setIsSerialized(p.isSerialized || false);
                          setInitialSerialsText('');
                          if (p.specs && 'processor' in p.specs) {
                            const s = p.specs as LaptopSpecifications;
                            setCpu(s.processor || '');
                            setRam(s.ram || '');
                            setStorage(s.storage || '');
                            setDisplay(s.display || '');
                            setBatteryCondition(s.batteryCondition || '');
                            setPhysicalCondition(s.physicalCondition || '');
                          } else {
                            setCpu('');
                            setRam('');
                            setStorage('');
                            setDisplay('');
                            setBatteryCondition('');
                            setPhysicalCondition('');
                          }
                          setImageUrl(p.imageUrl || '');
                          setImages(p.images && Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []));
                          setIsPublished(p.isPublished !== undefined ? p.isPublished : true);
                          setIsFeatured(p.isFeatured || false);
                          setImageUploadError('');
                          setExternalUrlInput('');
                          setShowAddModal(true);
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      {currentUser?.role === 'SUPER_ADMIN' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
                          title="Super Admin Delete Product"
                          onClick={async () => {
                            if (window.confirm(`⚠️ SUPER ADMIN ACTION:\nAre you sure you want to permanently delete "${p.name}" (${p.sku})?\n\nThis will remove the product, its serial entries, and stock records.`)) {
                              const res = await deleteProduct(p.id);
                              if (!res.success) {
                                alert('Delete failed: ' + (res.error || 'Unknown error'));
                              }
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <a
                        href={`/product/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${p.sku.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--brand-primary)' }}
                        title="View Live Product on Customer Storefront"
                      >
                        <Eye size={12} />
                      </a>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-xl" style={{ maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="modal-title">
                <PackageSearch size={20} color="var(--brand-primary)" />
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Catalog'}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter product title or model name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Leave blank to auto-generate"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={e => setCategory(e.target.value as ProductCategory)}
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. HP, Dell, Asus, Samsung"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. EliteBook 840 G7"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier (সরবরাহকারী)</label>
                    <select
                      className="form-select"
                      value={supplierId}
                      onChange={e => setSupplierId(e.target.value)}
                    >
                      <option value="">-- Select Supplier (Optional) --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.company || s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warranty Period (Months)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={warrantyMonths}
                      onChange={e => setWarrantyMonths(e.target.value === '' ? '' : Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>

                {/* Multi-Tier Pricing Fields */}
                <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
                    Multi-Tier Commercial Pricing Strategy (৳ BDT)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Purchase Price</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={purchasePrice}
                        onChange={e => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cost (Landed)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={costPrice}
                        onChange={e => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Retail Price</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={retailPrice}
                        onChange={e => setRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Wholesale Price</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={wholesalePrice}
                        onChange={e => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">EMI Price</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={emiPrice}
                        onChange={e => setEmiPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Automatic Procurement Expense Indicator */}
                  {!editingProduct && Number(costPrice || purchasePrice || 0) > 0 && (
                    <div style={{
                      marginTop: '0.85rem',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.15rem' }}>💼</span>
                        <span>
                          <strong>Auto-Calculated Expense:</strong> Registering this product will automatically record{' '}
                          <strong style={{ color: '#2563eb' }}>
                            ৳{((Number(costPrice || purchasePrice || 0)) * (Number(currentStock) > 0 ? Number(currentStock) : 1)).toLocaleString()}
                          </strong>{' '}
                          as an initial procurement voucher under <em>'Purchase Expenses'</em>.
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '4px', fontWeight: 700, color: '#2563eb' }}>
                        AUTO EXPENSE VOUCHER
                      </span>
                    </div>
                  )}
                </div>

                {/* Inventory & Tracking Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Opening Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={currentStock}
                      onChange={e => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low Stock Alert Level</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={minStock}
                      onChange={e => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label className="form-label">Tracking Mode</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '6px' }}>
                      <input
                        type="checkbox"
                        checked={isSerialized}
                        onChange={e => setIsSerialized(e.target.checked)}
                      />
                      <span>Track Individual Serial / Barcode</span>
                    </label>
                  </div>
                </div>

                {/* Optional Initial Serial Numbers when Serialized */}
                {isSerialized && (
                  <div className="form-group" style={{ marginTop: '0.25rem', background: 'rgba(0, 140, 255, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Initial Serial Numbers</span>
                      <span style={{ fontSize: '0.75rem', color: '#008CFF', fontWeight: 600 }}>Optional</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. SN1001, SN1002, SN1003 (Optional — comma-separated)"
                      value={initialSerialsText}
                      onChange={e => setInitialSerialsText(e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Serial numbers are optional. You can enter them now or leave empty and assign later in Purchases or POS.
                    </div>
                  </div>
                )}

                {/* PRODUCT MEDIA & STOREFRONT IMAGE MANAGEMENT */}
                <div style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-muted)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={18} color="var(--brand-primary)" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        Product Photography & Storefront Media
                      </span>
                    </div>

                    {/* Method Switcher Tabs: Device Upload vs External URL */}
                    <div style={{ display: 'inline-flex', background: 'var(--bg-card)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => { setImageInputMode('upload'); setImageUploadError(''); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: imageInputMode === 'upload' ? 'var(--brand-primary)' : 'transparent',
                          color: imageInputMode === 'upload' ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        <UploadCloud size={13} />
                        Method A: Device Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImageInputMode('url'); setImageUploadError(''); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: imageInputMode === 'url' ? 'var(--brand-primary)' : 'transparent',
                          color: imageInputMode === 'url' ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        <LinkIcon size={13} />
                        Method B: External Image URL
                      </button>
                    </div>
                  </div>

                  {/* Method A: Device File Upload */}
                  {imageInputMode === 'upload' && (
                    <div style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      background: 'var(--bg-card)',
                      transition: 'border-color 0.2s',
                    }}>
                      <input
                        type="file"
                        id="product-image-file-input"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="product-image-file-input"
                        style={{ cursor: isUploadingImage ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'rgba(0, 140, 255, 0.1)',
                          color: 'var(--brand-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {isUploadingImage ? <Loader2 size={22} className="spin" /> : <UploadCloud size={22} />}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {isUploadingImage ? 'Uploading & Optimizing image...' : 'Click to Browse from Computer or Phone'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Supports JPEG, PNG, WebP up to 5MB. Multiple uploads will be added to the product gallery.
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Method B: External Image URL */}
                  {imageInputMode === 'url' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="Paste verified image URL (e.g. https://example.com/images/hp-laptop.jpg)"
                          value={externalUrlInput}
                          onChange={e => setExternalUrlInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyExternalUrl();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleApplyExternalUrl}
                          disabled={urlTestStatus === 'testing' || !externalUrlInput.trim()}
                        >
                          {urlTestStatus === 'testing' ? (
                            <>
                              <Loader2 size={13} className="spin" /> Verifying...
                            </>
                          ) : (
                            <>
                              <Check size={13} /> Test & Add
                            </>
                          )}
                        </button>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Secure HTTPS image sources only. Image will be pre-tested for validity before saving.
                      </div>
                    </div>
                  )}

                  {imageUploadError && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ef4444',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}>
                      <ShieldAlert size={14} />
                      <span>{imageUploadError}</span>
                    </div>
                  )}

                  {/* Image Gallery & Primary Selector */}
                  {images.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Uploaded Images ({images.length}) — Click 'Set Primary' to choose storefront thumbnail:
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '0.75rem',
                      }}>
                        {images.map((img, idx) => {
                          const isPrimary = img === imageUrl;
                          return (
                            <div
                              key={idx}
                              style={{
                                position: 'relative',
                                borderRadius: 'var(--radius-md)',
                                border: isPrimary ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                padding: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: isPrimary ? '0 0 0 2px rgba(0, 140, 255, 0.2)' : 'none',
                              }}
                            >
                              {isPrimary && (
                                <span style={{
                                  position: 'absolute',
                                  top: '6px',
                                  left: '6px',
                                  background: 'var(--brand-primary)',
                                  color: '#ffffff',
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  zIndex: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}>
                                  <Star size={9} fill="#fff" /> PRIMARY
                                </span>
                              )}

                              <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <img
                                  src={img}
                                  alt={`Product preview ${idx + 1}`}
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                  onError={(e) => {
                                    (e.target as HTMLElement).setAttribute('src', '/logo-icon.png');
                                  }}
                                />
                              </div>

                              <div style={{ width: '100%', display: 'flex', gap: '3px', marginTop: '4px' }}>
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryImage(img)}
                                    style={{
                                      flex: 1,
                                      padding: '2px 4px',
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      background: 'var(--bg-card-muted)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    Set Primary
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(img)}
                                  title="Remove image"
                                  style={{
                                    padding: '2px 5px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                  }}
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Storefront Publication & Spotlight Settings */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color)',
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={e => setIsPublished(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600 }}>Publish on Customer Website</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Allows customers to view and buy online)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={e => setIsFeatured(e.target.checked)}
                      />
                      <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        Homepage Spotlight Collection
                      </span>
                    </label>
                  </div>
                </div>

                {/* Tech Specs if Laptop */}
                {category === 'Laptop' && (
                  <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Laptop size={16} color="var(--brand-primary)" />
                      Dedicated Laptop Hardware Specifications
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Processor (CPU)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Intel Core i5 11th Gen"
                          value={cpu}
                          onChange={e => setCpu(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">RAM Memory</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 16GB DDR4"
                          value={ram}
                          onChange={e => setRam(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Storage (SSD/HDD)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 512GB NVMe SSD"
                          value={storage}
                          onChange={e => setStorage(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Display Size & Panel</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 14.0&quot; FHD IPS"
                          value={display}
                          onChange={e => setDisplay(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Battery Health</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 92% Health (4-5 hrs)"
                          value={batteryCondition}
                          onChange={e => setBatteryCondition(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Physical Condition Grade</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Grade A+ Pristine"
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
