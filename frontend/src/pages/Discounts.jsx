import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Loader, AlertCircle, CheckCircle2, Percent, DollarSign, X } from 'lucide-react';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';

const Discounts = () => {
  const { api } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    registrationNo: '',
    discountAmount: ''
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/fee/discounts', {
        params: { page, search, limit: 10 }
      });
      setDiscounts(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tuition discounts catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDiscounts();
  };

  const handleOpenAddModal = () => {
    setEditingDiscount(null);
    setFormData({
      registrationNo: '',
      discountAmount: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingDiscount(item);
    setFormData({
      registrationNo: item.studentId?.registrationNo || '',
      discountAmount: item.discountAmount || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to reset this student discount to zero?')) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/fee/discounts/${id}`);
      setMessage('Discount reset to zero successfully');
      fetchDiscounts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset discount');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.registrationNo || formData.discountAmount === '') {
      setError('Please enter both the registration number and discount amount.');
      return;
    }

    try {
      if (editingDiscount) {
        await api.put(`/fee/discounts/${editingDiscount._id}`, {
          discountAmount: formData.discountAmount
        });
        setMessage('Tuition discount updated successfully');
      } else {
        await api.post('/fee/discounts', formData);
        setMessage('Tuition discount applied successfully');
      }
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply discount: registration code not found or invalid range');
    }
  };

  const exportColumns = [
    { header: 'Reg No', accessor: d => d.studentId?.registrationNo },
    { header: 'Student Name', accessor: d => d.studentId?.name },
    { header: 'Total Fee (INR)', accessor: d => d.totalFee },
    { header: 'Discount applied', accessor: d => d.discountAmount },
    { header: 'Dues to Pay (INR)', accessor: d => d.totalToPay }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Fee Discount</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Record scholarship discount credits against total registration fees.</p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          Apply Discount
        </button>
      </div>

      {/* Info alerts */}
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

        <ExportButtons data={discounts} columns={exportColumns} filename="tuition_discounts_report" />
      </div>

      {/* Table view */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Querying discount registries...</span>
          </div>
        ) : discounts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <Percent className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No discounts applied</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Apply discounts against registered student numbers to adjust balances.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  <th className="py-4 px-6">Reg No</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Course stream</th>
                  <th className="py-4 px-6">Original total</th>
                  <th className="py-4 px-6">Discount Value</th>
                  <th className="py-4 px-6">Total Dues to Pay</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {discounts.map((item) => (
                  <tr key={item._id} className="hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                    <td className="py-4 px-6 font-mono text-emerald-400 font-bold whitespace-nowrap">
                      {item.studentId?.registrationNo}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.studentId?.name}</td>
                    <td className="py-4 px-6 text-[var(--text-dark)]">
                      {item.studentId?.courseDetailId?.technologyId?.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-[var(--text-muted)]">INR {item.totalFee?.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-rose-400 font-semibold">INR {item.discountAmount?.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-emerald-400 font-bold">INR {item.totalToPay?.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <ActionsDropdown
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => handleDeleteDiscount(item._id)}
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
              disabled={discounts.length < 10}
              className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <Percent className="h-4.5 w-4.5 text-emerald-400" />
                {editingDiscount ? 'Modify scholarship Discount' : 'Apply scholarship Discount'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Student Registration Number</label>
                <input
                  type="text"
                  required
                  readOnly={!!editingDiscount}
                  value={formData.registrationNo}
                  onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                  className={`w-full rounded-lg border border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none ${
                    editingDiscount ? 'bg-[var(--bg-cream)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--bg-cream)] border-[var(--border-color)]'
                  }`}
                  placeholder="STP-YYYY-MM-DD-XXXXX"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Discount Amount (INR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-muted)]">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <input
                    type="number"
                    required
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none"
                    placeholder="2500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold"
                >
                  Confirm Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;
