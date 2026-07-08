import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Search, Calendar, Loader, AlertCircle, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import ExportButtons from '../components/ExportButtons';

const Reports = () => {
  const { api } = useAuth();
  const [reportType, setReportType] = useState('students'); // students, fees, certificates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      let endpoint = '';
      if (reportType === 'students') {
        endpoint = '/registration/students';
      } else if (reportType === 'fees') {
        endpoint = '/fee/students';
      } else if (reportType === 'certificates') {
        endpoint = '/certificates';
      }

      // Fetch a larger limit to export the full filtered batch
      const res = await api.get(endpoint, {
        params: { limit: 1000 }
      });

      let rawData = res.data.data || [];

      // Filter by Date Range on client side based on date attributes
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date('2099-12-31');
        // Set end time to end of day
        end.setHours(23, 59, 59, 999);

        rawData = rawData.filter(item => {
          const dateField = reportType === 'fees' 
            ? (item.createdAt ? new Date(item.createdAt) : new Date())
            : (item.issueDate || item.createdAt ? new Date(item.issueDate || item.createdAt) : new Date());
          return dateField >= start && dateField <= end;
        });
      }

      setReportData(rawData);
      setMessage(`Report generated successfully. Found ${rawData.length} matching record(s).`);
    } catch (err) {
      console.error(err);
      setError('Failed to query database logs for report parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  // Setup columns for exports
  const getColumns = () => {
    if (reportType === 'students') {
      return [
        { header: 'Reg No', accessor: s => s.registrationNo },
        { header: 'Student Name', accessor: s => s.name },
        { header: 'Phone', accessor: s => s.phone },
        { header: 'Email', accessor: s => s.email },
        { header: 'College', accessor: s => s.collegeId?.collegeName || '' },
        { header: 'Course', accessor: s => s.courseDetailId?.technologyId?.name || '' },
        { header: 'Registration Date', accessor: s => s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '' }
      ];
    }
    if (reportType === 'fees') {
      return [
        { header: 'Reg No', accessor: s => s.registrationNo },
        { header: 'Student Name', accessor: s => s.name },
        { header: 'Total Course Fee (INR)', accessor: s => s.totalFee },
        { header: 'Scholarship Discount', accessor: s => s.discountAmount },
        { header: 'Total to Pay (INR)', accessor: s => s.totalToPay },
        { header: 'Installments Submitted', accessor: s => s.submittedFee },
        { header: 'Dues Balance (INR)', accessor: s => s.remainingFee },
        { header: 'Payment Status', accessor: s => s.paymentStatus }
      ];
    }
    if (reportType === 'certificates') {
      return [
        { header: 'Certificate ID', accessor: c => c.certificateId },
        { header: 'Student Name', accessor: c => c.studentId?.name },
        { header: 'Reg No', accessor: c => c.studentId?.registrationNo },
        { header: 'Course Stream', accessor: c => c.courseDetailId?.technologyId?.name },
        { header: 'Duration Period', accessor: c => c.courseDetailId?.durationId ? `${c.courseDetailId.durationId.value} ${c.courseDetailId.durationId.unit}` : '' },
        { header: 'Issue Date', accessor: c => c.issueDate ? new Date(c.issueDate).toLocaleDateString() : '' },
        { header: 'Status', accessor: c => c.status }
      ];
    }
    return [];
  };

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Reports</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Select parameters, generate statements of account, and export files.</p>
        </div>
      </div>

      {/* Info messages */}
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

      {/* Configuration Form Card */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Report Statement Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
            >
              <option value="students">Student Registration Report</option>
              <option value="fees">Fee Collections Ledger</option>
              <option value="certificates">Certificate Issuance Log</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-muted)]">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">End Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-muted)]">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] border-[var(--border-color)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={generateReport}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
          >
            <Search className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Export & Results area */}
      {reportData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-emerald-400" /> Compiled Records List
            </h3>
            
            <ExportButtons data={reportData} columns={getColumns()} filename={`${reportType}_statement_export`} />
          </div>

          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="text-xs text-[var(--text-muted)] mt-2">Compiling records logs...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                      {/* HEADERS MAPPING */}
                      {reportType === 'students' && (
                        <>
                          <th className="py-4 px-6">Reg No</th>
                          <th className="py-4 px-6">Name</th>
                          <th className="py-4 px-6">Contact Phone</th>
                          <th className="py-4 px-6">College</th>
                          <th className="py-4 px-6">Course</th>
                          <th className="py-4 px-6">Enroll Date</th>
                        </>
                      )}
                      {reportType === 'fees' && (
                        <>
                          <th className="py-4 px-6">Reg No</th>
                          <th className="py-4 px-6">Name</th>
                          <th className="py-4 px-6">Original Fee</th>
                          <th className="py-4 px-6">Scholarship</th>
                          <th className="py-4 px-6">Total Dues</th>
                          <th className="py-4 px-6">Paid Dues</th>
                          <th className="py-4 px-6">Dues Balance</th>
                        </>
                      )}
                      {reportType === 'certificates' && (
                        <>
                          <th className="py-4 px-6">Certificate ID</th>
                          <th className="py-4 px-6">Student Name</th>
                          <th className="py-4 px-6">Reg No</th>
                          <th className="py-4 px-6">Course Stream</th>
                          <th className="py-4 px-6">Issued Date</th>
                          <th className="py-4 px-6">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/60">
                    {/* DATA ROWS MAPPING */}
                    {reportData.map((item, index) => (
                      <tr key={item._id || index} className="hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                        {reportType === 'students' && (
                          <>
                            <td className="py-4 px-6 font-mono text-emerald-400 font-bold">{item.registrationNo}</td>
                            <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.name}</td>
                            <td className="py-4 px-6 text-[var(--text-dark)]">{item.phone}</td>
                            <td className="py-4 px-6 text-[var(--text-dark)]">{item.collegeId?.collegeName || '—'}</td>
                            <td className="py-4 px-6 text-[var(--text-dark)]">{item.courseDetailId?.technologyId?.name || '—'}</td>
                            <td className="py-4 px-6 text-[var(--text-muted)] font-mono">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                          </>
                        )}
                        {reportType === 'fees' && (
                          <>
                            <td className="py-4 px-6 font-mono text-emerald-400 font-bold">{item.registrationNo}</td>
                            <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.name}</td>
                            <td className="py-4 px-6 text-[var(--text-muted)] font-mono">INR {item.totalFee?.toLocaleString()}</td>
                            <td className="py-4 px-6 text-rose-450 font-mono">INR {item.discountAmount?.toLocaleString()}</td>
                            <td className="py-4 px-6 text-[var(--text-dark)] font-mono">INR {item.totalToPay?.toLocaleString()}</td>
                            <td className="py-4 px-6 text-blue-400 font-mono font-semibold">INR {item.submittedFee?.toLocaleString()}</td>
                            <td className={`py-4 px-6 font-mono font-bold ${item.remainingFee <= 0 ? 'text-emerald-450' : 'text-amber-500'}`}>INR {item.remainingFee?.toLocaleString()}</td>
                          </>
                        )}
                        {reportType === 'certificates' && (
                          <>
                            <td className="py-4 px-6 font-mono text-emerald-400 font-bold">{item.certificateId}</td>
                            <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.studentId?.name || '—'}</td>
                            <td className="py-4 px-6 font-mono text-[var(--text-dark)]">{item.studentId?.registrationNo || '—'}</td>
                            <td className="py-4 px-6 text-[var(--text-dark)]">{item.courseDetailId?.technologyId?.name || '—'}</td>
                            <td className="py-4 px-6 text-[var(--text-muted)] font-mono">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '—'}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
