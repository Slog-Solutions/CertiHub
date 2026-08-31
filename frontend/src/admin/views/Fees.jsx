import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Loader, AlertCircle, CheckCircle2, CreditCard, DollarSign, Calendar, Trash2, X } from 'lucide-react';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';

const Fees = () => {
  const { api } = useAuth();
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Installments modal states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [installmentsLoading, setInstallmentsLoading] = useState(false);

  // New payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentType: 'offline',
    paidOn: new Date().toISOString().substring(0, 10)
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/fee/students', {
        params: { page, search, limit: 10 }
      });
      setStudents(res.data.data);
      setTotal(res.data.total);
      setLoading(false); // Unblock loading spinner immediately!

      // Fetch all students for exports in the background
      api.get('/fee/students', {
        params: { search, all: 'true' }
      }).then(allRes => {
        setAllStudents(allRes.data.data);
      }).catch(err => {
        console.error('Background fetch of all fee summaries failed:', err);
      });

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch student fee summaries');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleOpenInstallmentsModal = async (student) => {
    setSelectedStudent(student);
    setPaymentForm({
      amount: '',
      paymentType: 'offline',
      paidOn: new Date().toISOString().substring(0, 10)
    });
    setIsModalOpen(true);
    
    // Load student past payments
    try {
      setInstallmentsLoading(true);
      const res = await api.get(`/fee/installments/${student._id}`);
      setInstallments(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch installments logs');
    } finally {
      setInstallmentsLoading(false);
    }
  };

  const handleAddInstallment = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    try {
      await api.post('/fee/installments', {
        studentId: selectedStudent._id,
        amount: paymentForm.amount,
        paymentType: paymentForm.paymentType,
        paidOn: paymentForm.paidOn
      });

      setMessage('Payment installment added successfully');
      
      // Reload installments list
      const res = await api.get(`/fee/installments/${selectedStudent._id}`);
      setInstallments(res.data);
      
      // Clear form
      setPaymentForm({
        amount: '',
        paymentType: 'offline',
        paidOn: new Date().toISOString().substring(0, 10)
      });
      
      // Update parent list
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record installment payment');
    }
  };

  const handleDeleteInstallment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment installment?')) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/fee/installments/${id}`);
      
      // Reload installments
      const res = await api.get(`/fee/installments/${selectedStudent._id}`);
      setInstallments(res.data);
      setMessage('Payment installment deleted successfully');
      
      // Update parent list
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete installment payment');
    }
  };

  const exportColumns = [
    { header: 'Reg No', accessor: s => s.registrationNo },
    { header: 'Candidate Name', accessor: s => s.name },
    { header: 'Course Stream', accessor: s => s.courseName },
    { header: 'Total Fee (INR)', accessor: s => s.totalFee },
    { header: 'Tuition discount', accessor: s => s.discountAmount },
    { header: 'Total Due (INR)', accessor: s => s.totalToPay },
    { header: 'Submitted Fee (INR)', accessor: s => s.submittedFee },
    { header: 'Remaining Fee (INR)', accessor: s => s.remainingFee },
    { header: 'Status', accessor: s => s.paymentStatus }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Candidate's Fee</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Audit candidate balances, log installments paid, and print ledger accounts.</p>
        </div>
      </div>

      {/* Info Banners */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300 py-1.5 pl-9 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
          <button type="submit" className="absolute left-3 top-2 text-[var(--text-muted)] hover:text-[var(--text-dark)]">
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        <ExportButtons data={allStudents} columns={exportColumns} filename="candidate_fees_report" />
      </div>

      {/* Fee Table view */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Loading payment registries...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No records found</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Candidates registered will pop up here with accounts balances logs.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  <th className="py-4 px-6">Reg No</th>
                  <th className="py-4 px-6">Candidate Name</th>
                  <th className="py-4 px-6">Course stream</th>
                  <th className="py-4 px-6">Total Fee</th>
                  <th className="py-4 px-6">Submitted Fee</th>
                  <th className="py-4 px-6">Remaining Fee</th>
                  <th className="py-4 px-6">Payment Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {students.map((item) => (
                  <tr key={item._id} className="hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                    <td className="py-4 px-6 font-mono text-emerald-400 font-bold whitespace-nowrap">{item.registrationNo}</td>
                    <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.name}</td>
                    <td className="py-4 px-6 text-[var(--text-dark)]">
                      <h4>{item.courseName}</h4>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">{item.college}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[var(--text-dark)]">INR {item.totalToPay?.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-blue-400 font-semibold">INR {item.submittedFee?.toLocaleString()}</td>
                    <td className={`py-4 px-6 font-mono font-bold ${item.remainingFee <= 0 ? 'text-emerald-400' : 'text-amber-500'}`}>
                      INR {item.remainingFee?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.paymentStatus === 'Fully Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* The edit option triggers the installment history modal */}
                      <ActionsDropdown
                        onEdit={() => handleOpenInstallmentsModal(item)}
                        onDelete={null} // No direct delete from fee panel unless student deleted
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold">Showing 10 records per page</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={students.length < 10}
              className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Nested Installment History & Logging Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-scale-up">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)] z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300/50">
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-emerald-500" />
                Ledger logs: {selectedStudent.name} ({selectedStudent.registrationNo})
              </h3>
              <div className="text-[10px] text-[var(--text-muted)] mt-1 flex gap-4 font-semibold uppercase">
                <span>Total: <strong className="text-[var(--text-dark)]">INR {selectedStudent.totalToPay?.toLocaleString()}</strong></span>
                <span>Submitted: <strong className="text-blue-400">INR {selectedStudent.submittedFee?.toLocaleString()}</strong></span>
                <span>Remaining: <strong className={selectedStudent.remainingFee <= 0 ? 'text-emerald-400' : 'text-amber-500'}>
                  INR {selectedStudent.remainingFee?.toLocaleString()}
                </strong></span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6 max-h-[70vh] overflow-y-auto">
              
              {/* Form Col (Left 2 cols) */}
              <form onSubmit={handleAddInstallment} className="md:col-span-2 space-y-4 border-r border-[var(--border-color)]/80 pr-4">
                <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Log installment
                </h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Installment Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Payment Method</label>
                  <select
                    value={paymentForm.paymentType}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="offline">Offline / Cash / bank</option>
                    <option value="online">Online / UPI / Card</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Date of payment</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paidOn}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidOn: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={selectedStudent.remainingFee <= 0}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Installment
                </button>
              </form>

              {/* Installments table history (Right 3 cols) */}
              <div className="md:col-span-3 space-y-4">
                <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Installment Logs History
                </h4>

                {installmentsLoading ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
                    <Loader className="h-5 w-5 animate-spin text-emerald-500" />
                    <span className="text-[10px] text-[var(--text-muted)]">Querying ledger logs...</span>
                  </div>
                ) : installments.length === 0 ? (
                  <div className="py-10 text-center text-[var(--text-muted)] text-[10px]">No installment history logged for this file.</div>
                ) : (
                  <div className="border border-[var(--border-color)] rounded-lg overflow-hidden max-h-[35vh] overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] font-bold text-[var(--text-muted)]">
                          <th className="py-2.5 px-4 w-10">S.No</th>
                          <th className="py-2.5 px-4">Paid On</th>
                          <th className="py-2.5 px-4">Amount</th>
                          <th className="py-2.5 px-4">Mode</th>
                          <th className="py-2.5 px-4 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]/60">
                        {installments.map((inst, index) => (
                          <tr key={inst._id} className="hover:bg-[var(--bg-cream)] border-[var(--border-color)]/40 text-[var(--text-dark)]">
                            <td className="py-2.5 px-4 font-mono">{index + 1}</td>
                            <td className="py-2.5 px-4 font-mono">{new Date(inst.paidOn).toLocaleDateString()}</td>
                            <td className="py-2.5 px-4 font-mono text-emerald-400 font-semibold">INR {inst.amount?.toLocaleString()}</td>
                            <td className="py-2.5 px-4 capitalize font-semibold">{inst.paymentType}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteInstallment(inst._id)}
                                className="text-rose-450 hover:text-rose-300 transition"
                                title="Remove Installment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
