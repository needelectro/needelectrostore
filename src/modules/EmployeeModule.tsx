import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  UserCheck, Plus, Search, DollarSign, Percent, Award, 
  Calendar, CheckCircle, Clock, AlertCircle, X, Building,
  Briefcase, Phone, Mail, Shield, UserX
} from 'lucide-react';
import { Employee, AttendanceStatus, PaymentMethod, UserRole } from '../types';

interface EmployeeModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const EmployeeModule: React.FC<EmployeeModuleProps> = ({ onNavigate }) => {
  const { 
    employees, attendance, sales, branches, financialAccounts,
    createEmployee, disburseSalary, recordAttendance, selectedBranch 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'staff' | 'attendance'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedEmpToPay, setSelectedEmpToPay] = useState<Employee | null>(null);
  const [salaryMonth, setSalaryMonth] = useState('September 2026');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payAccountId, setPayAccountId] = useState(financialAccounts[0]?.id || '');

  // Add Employee Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');
  const [designation, setDesignation] = useState('');
  const [branchId, setBranchId] = useState(selectedBranch.id);
  const [monthlySalary, setMonthlySalary] = useState<number>(25000);
  const [salesCommissionRate, setSalesCommissionRate] = useState<number>(1.5);
  const [nid, setNid] = useState('');
  const [address, setAddress] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Total KPIs
  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + e.monthlySalary, 0);

  // Calculate live sales commission for each employee
  const employeesWithMetrics = employees.map(emp => {
    const empSales = sales.filter(s => 
      s.salespersonId === emp.id || 
      (s.salespersonName && s.salespersonName.toLowerCase().includes(emp.name.toLowerCase()))
    );
    const salesClosed = empSales.reduce((sum, s) => sum + s.grandTotal, 0);
    const commissionEarned = Math.round((salesClosed * (emp.salesCommissionRate || 0)) / 100);
    const todayAtt = attendance.find(a => a.employeeId === emp.id && a.date === todayStr);

    return {
      ...emp,
      salesClosed,
      commissionEarned,
      attendanceStatus: todayAtt ? todayAtt.status : 'PENDING'
    };
  });

  const totalCommissionPayable = employeesWithMetrics.reduce((sum, e) => sum + e.commissionEarned, 0);
  const presentTodayCount = employeesWithMetrics.filter(e => e.attendanceStatus === 'PRESENT' || e.attendanceStatus === 'LATE').length;

  const filteredEmployees = employeesWithMetrics.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      emp.phone.includes(searchQuery);
    const matchesBranch = selectedBranchFilter === 'ALL' || emp.branchId === selectedBranchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter employee name.');
      return;
    }

    const res = await createEmployee({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@needelectro.com`,
      phone: phone.trim() || '01700000000',
      role,
      designation: designation.trim() || role,
      branchId,
      monthlySalary,
      salesCommissionRate,
      joinedDate: todayStr,
      nid,
      address,
      status: 'ACTIVE'
    });

    if (res.success) {
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setDesignation('');
    } else {
      alert(`Error creating employee: ${res.error}`);
    }
  };

  const handleDisburseSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpToPay) return;

    const res = await disburseSalary(
      selectedEmpToPay.id,
      salaryMonth,
      payMethod,
      payAccountId
    );

    if (res.success) {
      setShowPayModal(false);
      setSelectedEmpToPay(null);
    } else {
      alert(`Salary disbursement failed: ${res.error}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <UserCheck size={28} color="var(--brand-primary)" />
            Staff, Technicians & Payroll Management
          </h1>
          <p>
            Employee directory, attendance terminal, real-time sales commission calculation, and salary disbursement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Register New Employee
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Monthly Base Payroll</span>
            <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">৳{totalMonthlyPayroll.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Across {employees.length} full-time employees
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Earned Sales Commission (MTD)</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>৳{totalCommissionPayable.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: '#10b981' }}>
            Calculated dynamically from POS invoices
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Staff On Duty Today</span>
            <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div className="kpi-value">{presentTodayCount} / {employees.length}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Marked present or on field service today
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Operating Showrooms & Hubs</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Building size={20} />
            </div>
          </div>
          <div className="kpi-value">{branches.length} Branches</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Multi-branch staffing structure
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff Directory & Sales Commission ({employees.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Daily Attendance Terminal ({todayStr})
        </button>
      </div>

      {/* TAB 1: STAFF DIRECTORY & COMMISSION */}
      {activeTab === 'staff' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Staff Roster & Real-Time Performance
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search staff by name/phone..." 
                  style={{ paddingLeft: '32px', width: '220px', height: '34px', fontSize: '0.8rem' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className="form-control" 
                style={{ height: '34px', fontSize: '0.8rem' }}
                value={selectedBranchFilter}
                onChange={e => setSelectedBranchFilter(e.target.value)}
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Designation & Role</th>
                  <th>Branch</th>
                  <th style={{ textAlign: 'right' }}>Monthly Salary (৳)</th>
                  <th style={{ textAlign: 'center' }}>Commission %</th>
                  <th style={{ textAlign: 'right' }}>Sales Volume (৳)</th>
                  <th style={{ textAlign: 'right' }}>Commission (৳)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const br = branches.find(b => b.id === emp.branchId);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.phone} • {emp.email}</div>
                      </td>
                      <td>
                        <div>{emp.designation || emp.role}</div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{emp.role}</span>
                      </td>
                      <td>{br?.name || 'Main Branch'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{emp.monthlySalary.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>{emp.salesCommissionRate > 0 ? `${emp.salesCommissionRate}%` : '—'}</td>
                      <td style={{ textAlign: 'right' }}>৳{emp.salesClosed.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10b981', fontWeight: '800' }}>
                        {emp.commissionEarned > 0 ? `৳${emp.commissionEarned.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setSelectedEmpToPay(emp);
                            setShowPayModal(true);
                          }}
                        >
                          Disburse Salary
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY ATTENDANCE TERMINAL */}
      {activeTab === 'attendance' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Daily Staff Attendance Log</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Date: <strong>{todayStr}</strong> • Click any status button to record staff attendance immediately
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Branch</th>
                  <th style={{ textAlign: 'center' }}>Today's Status</th>
                  <th style={{ textAlign: 'center' }}>Quick Status Action</th>
                </tr>
              </thead>
              <tbody>
                {employeesWithMetrics.map(emp => {
                  const br = branches.find(b => b.id === emp.branchId);
                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 700 }}>{emp.name}</td>
                      <td>{emp.designation || emp.role}</td>
                      <td>{br?.name || 'Main Branch'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          emp.attendanceStatus === 'PRESENT' ? 'badge-success' :
                          emp.attendanceStatus === 'LATE' ? 'badge-warning' :
                          emp.attendanceStatus === 'HALF_DAY' ? 'badge-info' :
                          emp.attendanceStatus === 'ABSENT' ? 'badge-danger' :
                          emp.attendanceStatus === 'ON_LEAVE' ? 'badge-neutral' : 'badge-neutral'
                        }`}>
                          {emp.attendanceStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: emp.attendanceStatus === 'PRESENT' ? '#10b981' : undefined, color: emp.attendanceStatus === 'PRESENT' ? '#fff' : undefined }}
                            onClick={() => recordAttendance(emp.id, 'PRESENT')}
                          >
                            Present
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: emp.attendanceStatus === 'LATE' ? '#f59e0b' : undefined, color: emp.attendanceStatus === 'LATE' ? '#fff' : undefined }}
                            onClick={() => recordAttendance(emp.id, 'LATE')}
                          >
                            Late
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: emp.attendanceStatus === 'HALF_DAY' ? '#38bdf8' : undefined, color: emp.attendanceStatus === 'HALF_DAY' ? '#fff' : undefined }}
                            onClick={() => recordAttendance(emp.id, 'HALF_DAY')}
                          >
                            Half Day
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: emp.attendanceStatus === 'ON_LEAVE' ? '#8b5cf6' : undefined, color: emp.attendanceStatus === 'ON_LEAVE' ? '#fff' : undefined }}
                            onClick={() => recordAttendance(emp.id, 'ON_LEAVE')}
                          >
                            Leave
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: emp.attendanceStatus === 'ABSENT' ? '#ef4444' : undefined, color: emp.attendanceStatus === 'ABSENT' ? '#fff' : undefined }}
                            onClick={() => recordAttendance(emp.id, 'ABSENT')}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW EMPLOYEE */}
      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-lg">
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={20} color="var(--brand-primary)" />
                Register New Employee / Technician
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Shakil Mahmud"
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 01712-345678"
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">System Role</label>
                    <select 
                      className="form-control" 
                      value={role} 
                      onChange={e => setRole(e.target.value as UserRole)}
                    >
                      <option value="SALES">Sales Executive</option>
                      <option value="TECHNICIAN">Technician / Electrician</option>
                      <option value="INVENTORY">Inventory Manager</option>
                      <option value="ACCOUNTANT">Accountant</option>
                      <option value="MANAGER">Branch Manager</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Designation / Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Senior Laptop Technician"
                      value={designation} 
                      onChange={e => setDesignation(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="form-label">Assigned Branch</label>
                    <select 
                      className="form-control" 
                      value={branchId} 
                      onChange={e => setBranchId(e.target.value)}
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Monthly Base Salary (৳) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="0"
                      value={monthlySalary} 
                      onChange={e => setMonthlySalary(Number(e.target.value))} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="form-label">Sales Commission Rate (%)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      step="0.1"
                      min="0"
                      value={salesCommissionRate} 
                      onChange={e => setSalesCommissionRate(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">National ID (NID)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="10 or 17 digit NID"
                      value={nid} 
                      onChange={e => setNid(e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="staff@needelectro.com"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Residential Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Dhanmondi, Dhaka"
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISBURSE MONTHLY SALARY */}
      {showPayModal && selectedEmpToPay && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title">
                <DollarSign size={20} color="var(--brand-primary)" />
                Disburse Monthly Salary Voucher
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPayModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDisburseSalarySubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card-muted)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{selectedEmpToPay.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Designation: {selectedEmpToPay.designation || selectedEmpToPay.role}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-primary)', marginTop: '0.5rem' }}>
                    Payable Amount: ৳{selectedEmpToPay.monthlySalary.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="form-label">Salary Month</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={salaryMonth} 
                    onChange={e => setSalaryMonth(e.target.value)} 
                    required 
                  />
                </div>

                <div>
                  <label className="form-label">Payment Channel</label>
                  <select 
                    className="form-control"
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="Bank Transfer">Bank Transfer / BEFTN</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="bKash">bKash Payroll</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Debit From Account</label>
                  <select 
                    className="form-control"
                    value={payAccountId}
                    onChange={e => setPayAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Balance: ৳{a.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Salary Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

