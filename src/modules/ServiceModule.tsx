import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { ServiceJob, ServiceType, ServiceStatus, PaymentMethod } from '../types';
import { 
  Wrench, Plus, Search, CheckCircle2, Clock, UserCheck, 
  MapPin, Phone, Laptop, AlertCircle, X, Check, Printer 
} from 'lucide-react';

interface ServiceModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const ServiceModule: React.FC<ServiceModuleProps> = ({ onNavigate }) => {
  const { 
    services, technicians, customers, products, 
    createServiceJob, updateServiceStatus, currentUser 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'jobs' | 'technicians' | 'new_job'>('jobs');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Job for Status Update Modal
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState<ServiceStatus>('In Progress');
  const [updateLaborCost, setUpdateLaborCost] = useState<number>(0);
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState<'UNPAID' | 'PAID'>('PAID');
  const [updatePaymentMethod, setUpdatePaymentMethod] = useState<PaymentMethod>('bKash');

  // New Job Form State
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || '');
  const [serviceType, setServiceType] = useState<ServiceType>('Laptop Service');
  const [deviceOrSite, setDeviceOrSite] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [reportedIssue, setReportedIssue] = useState('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>(technicians[0]?.id || '');
  const [laborCost, setLaborCost] = useState<number>(1000);
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const filteredJobs = services.filter(j => {
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = j.jobCardNumber.toLowerCase().includes(q) ||
                         j.customerName.toLowerCase().includes(q) ||
                         j.deviceOrSite.toLowerCase().includes(q) ||
                         (j.serialNumber && j.serialNumber.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust) {
      alert('Please select a customer.');
      return;
    }
    const tech = technicians.find(t => t.id === assignedTechnicianId);

    const res = await createServiceJob({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      serviceType,
      deviceOrSite: deviceOrSite.trim() || 'Equipment Servicing',
      serialNumber: serialNumber.trim() || undefined,
      reportedIssue: reportedIssue.trim(),
      assignedTechnicianId: tech?.id,
      assignedTechnicianName: tech?.name,
      status: 'Assigned',
      laborCost,
      scheduledDate
    });

    if (res.success) {
      setActiveTab('jobs');
      setDeviceOrSite('');
      setSerialNumber('');
      setReportedIssue('');
    } else {
      alert(`Error creating job: ${res.error}`);
    }
  };

  const handleSaveStatusUpdate = async () => {
    if (!selectedJob) return;
    await updateServiceStatus(
      selectedJob.id,
      updateStatusVal,
      undefined,
      updateLaborCost,
      updatePaymentStatus,
      updatePaymentMethod
    );
    setSelectedJob(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Wrench size={28} color="var(--brand-primary)" />
            Electrical & Technical Service Management
          </h1>
          <p>
            Service job cards, technician task assignment, site visits, repair progress tracking, and service billing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'new_job' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('new_job')}
          >
            <Plus size={16} /> Create Service Job Card
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Service Job Cards ({services.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'technicians' ? 'active' : ''}`}
          onClick={() => setActiveTab('technicians')}
        >
          Technicians & Electricians ({technicians.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'new_job' ? 'active' : ''}`}
          onClick={() => setActiveTab('new_job')}
        >
          + New Service Ticket
        </button>
      </div>

      {/* TAB 1: SERVICE JOBS */}
      {activeTab === 'jobs' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Job Card, Customer, Device..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
              {(['ALL', 'Pending', 'Assigned', 'In Progress', 'Completed'] as const).map(s => (
                <button
                  key={s}
                  className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Job Card #</th>
                  <th>Customer & Site</th>
                  <th>Service Type</th>
                  <th>Device / Serial</th>
                  <th>Assigned Technician</th>
                  <th style={{ textAlign: 'right' }}>Total Bill</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>
                      {job.jobCardNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{job.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {job.customerPhone} • {job.customerAddress}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{job.serviceType}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{job.deviceOrSite}</div>
                      {job.serialNumber && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SN: {job.serialNumber}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{job.assignedTechnicianName || 'Unassigned'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {job.scheduledDate}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>
                      ৳{job.totalBill.toLocaleString()}
                      <div style={{ fontSize: '0.65rem', color: job.paymentStatus === 'PAID' ? '#10b981' : '#ef4444' }}>
                        {job.paymentStatus}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${job.status === 'Completed' ? 'badge-success' : job.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setUpdateStatusVal(job.status);
                          setUpdateLaborCost(job.laborCost);
                          setUpdatePaymentStatus(job.paymentStatus);
                        }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICIANS */}
      {activeTab === 'technicians' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {technicians.map(tech => (
            <div key={tech.id} className="erp-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{tech.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tech.phone}</div>
                    </div>
                  </div>
                  <span className="badge badge-success">⭐ {tech.rating}</span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Specializations:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {tech.specialization.map((s, idx) => (
                      <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Active Tasks:</span>
                  <div style={{ fontWeight: 'bold', color: tech.activeJobsCount > 0 ? '#f59e0b' : 'inherit' }}>
                    {tech.activeJobsCount} Active
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Completed Jobs:</span>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                    {tech.completedJobsCount} Jobs
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: NEW SERVICE JOB */}
      {activeTab === 'new_job' && (
        <div className="erp-card" style={{ maxWidth: '650px', padding: '1.5rem', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--brand-primary)" />
            Create Service Ticket / Job Card
          </h3>

          <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Client Customer *</label>
              <select 
                className="form-select"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — {c.address}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Service Category *</label>
                <select 
                  className="form-select"
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value as ServiceType)}
                >
                  <optgroup label="Official NEED ELECTRO Core Services">
                    <option value="Laptops, Computers, CCTV, Computer Accessories">💻 Laptops, Computers, CCTV, Computer Accessories</option>
                    <option value="Complete electrical work of the house">🏠 Complete electrical work of the house</option>
                    <option value="Safe and modern smart electric solutions">💡 Safe and modern smart electric solutions</option>
                    <option value="CCTV camera installation and setup services">📹 CCTV camera installation and setup services</option>
                  </optgroup>
                  <optgroup label="Additional Technical Services">
                    <option value="Laptop Service">Laptop Service & Chip Repair</option>
                    <option value="Electrical Installation">General Electrical Installation</option>
                    <option value="Electrical Repair">Electrical Wiring & DB Repair</option>
                    <option value="CCTV Installation">CCTV Surveillance Upgrade</option>
                    <option value="Networking">Networking & Structured Cabling</option>
                    <option value="Home Service">Home / Office Service Visit</option>
                    <option value="Maintenance">Annual Maintenance Contract (AMC)</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Technician *</label>
                <select 
                  className="form-select"
                  value={assignedTechnicianId}
                  onChange={e => setAssignedTechnicianId(e.target.value)}
                >
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Device or Site Description *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HP EliteBook 840 or Banani Showroom DB Box"
                  value={deviceOrSite}
                  onChange={e => setDeviceOrSite(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Device Serial Number (if applicable)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HP840-77901-BD"
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reported Issue & Customer Complaints *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe the problem, symptoms, or installation requirements..."
                value={reportedIssue}
                onChange={e => setReportedIssue(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Estimated Labor Cost (৳)</label>
                <input
                  type="number"
                  className="form-input"
                  value={laborCost}
                  onChange={e => setLaborCost(Number(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
              Create Job Card & Dispatch Technician
            </button>
          </form>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {selectedJob && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Wrench size={18} color="var(--brand-primary)" />
                Update Job Card: {selectedJob.jobCardNumber}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedJob(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: '700' }}>{selectedJob.customerName} — {selectedJob.deviceOrSite}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedJob.reportedIssue}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Progress Status</label>
                <select 
                  className="form-select"
                  value={updateStatusVal}
                  onChange={e => setUpdateStatusVal(e.target.value as ServiceStatus)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="On The Way">On The Way</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Labor Charge (৳)</label>
                <input
                  type="number"
                  className="form-input"
                  value={updateLaborCost}
                  onChange={e => setUpdateLaborCost(Number(e.target.value) || 0)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select 
                    className="form-select"
                    value={updatePaymentStatus}
                    onChange={e => setUpdatePaymentStatus(e.target.value as any)}
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select 
                    className="form-select"
                    value={updatePaymentMethod}
                    onChange={e => setUpdatePaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJob(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveStatusUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
