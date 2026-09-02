import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, Loader, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import ExportButtons from '../components/ExportButtons';

const formatDateToDDMMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

const Reports = ({ type }) => {
  const { api } = useAuth();
  const navigate = useNavigate();

  // Filter States
  const [paymentMode, setPaymentMode] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data & UI States
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  // Reset states when type changes
  useEffect(() => {
    handleClose();
  }, [type]);

  const getReportTitle = () => {
    switch (type) {
      case 'fee-collection':
        return 'Fee Collection Report';
      case 'date-wise':
        return 'Date wise Fee Collection Report';
      case 'courses':
        return 'Course Report';
      case 'course-students':
        return 'Course wise total candidate Report';
      default:
        return 'Report Ledger';
    }
  };

  const getReportDescription = () => {
    switch (type) {
      case 'fee-collection':
        return 'Overview of all installments collected, filtered by payment mode.';
      case 'date-wise':
        return 'Generate statement of collections recorded within custom date ranges.';
      case 'courses':
        return 'Database audit of course streams, durations, and pricing models.';
      case 'course-students':
        return 'Aggregate enrollment counts mapped to active course registrations.';
      default:
        return 'Query database parameters and compile custom reports.';
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setHasGenerated(false);

    try {
      let endpoint = '';
      let params = {};

      if (type === 'fee-collection') {
        endpoint = '/reports/fee-collection';
        params = { paymentType: paymentMode };
      } else if (type === 'date-wise') {
        endpoint = '/reports/date-wise-fee';
        params = {
          startDate,
          endDate,
          paymentType: paymentMode
        };
      } else if (type === 'courses') {
        endpoint = '/reports/courses';
      } else if (type === 'course-students') {
        endpoint = '/reports/course-students';
      }

      const res = await api.get(endpoint, { params });
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setReportData(data);
      setSuccessMsg(`Compiled report statement successfully. Loaded ${data.length} records.`);
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to query database for report parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReportData([]);
    setStartDate('');
    setEndDate('');
    setPaymentMode('all');
    setError('');
    setSuccessMsg('');
    setHasGenerated(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getExportColumns = () => {
    if (type === 'fee-collection' || type === 'date-wise') {
      return [
        { header: 'Fee Date', accessor: item => item.paidOn ? formatDateToDDMMMYYYY(item.paidOn) : '—' },
        { header: 'Candidate Name', accessor: item => item.studentId?.name || '' },
        { header: 'Registration No.', accessor: item => item.studentId?.registrationNo || '' },
        { header: 'Course Fees', accessor: item => item.studentId?.totalFee ?? 0 },
        { header: 'Discount', accessor: item => item.discountAmount ?? 0 },
        { header: 'Total Fee', accessor: item => item.totalToPay ?? 0 },
        { header: 'Collected Fee', accessor: item => item.amount ?? 0 },
        { header: 'Payment Mode', accessor: item => item.paymentType || '' }
      ];
    }
    if (type === 'courses') {
      return [
        { header: 'S.No', accessor: (_, idx) => idx + 1 },
        { header: 'Course/Technology Name', accessor: item => item.technologyId?.name || '—' },
        { header: 'Duration', accessor: item => item.durationId ? `${item.durationId.value} ${item.durationId.unit}(s)` : '—' },
        { header: 'Price (INR)', accessor: item => item.price },
        { header: 'Status', accessor: item => item.isActive ? 'Active' : 'Inactive' }
      ];
    }
    if (type === 'course-students') {
      return [
        { header: 'S.No', accessor: (_, idx) => idx + 1 },
        { header: 'Course Name', accessor: item => item.courseName },
        { header: 'Duration', accessor: item => item.duration },
        { header: 'Total Candidates', accessor: item => item.studentCount }
      ];
    }
    return [];
  };

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      
      {/* Printable Report Header */}
      <div className="hidden print:flex flex-col items-center justify-center text-center border-b-2 border-gray-800 pb-5 mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 uppercase">Slog Solutions Pvt. Ltd.</h1>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mt-1">Management & Registration Portal</p>
        <div className="w-12 h-1 bg-emerald-600 rounded my-3"></div>
        <h2 className="text-md font-bold text-gray-800 mt-1 uppercase">{getReportTitle()}</h2>
        <div className="flex items-center gap-6 mt-3 text-[10px] text-gray-500 font-semibold font-mono">
          <span>Generated On: {new Date().toLocaleDateString()}</span>
          {startDate && <span>From: {startDate}</span>}
          {endDate && <span>To: {endDate}</span>}
          {(type === 'fee-collection' || type === 'date-wise') && (
            <span className="uppercase">Mode: {paymentMode}</span>
          )}
        </div>
      </div>

      {/* Standard Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5 no-print">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">{getReportTitle()}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">{getReportDescription()}</p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-500 font-semibold no-print">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-500 font-semibold no-print">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Filters container card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl space-y-6 no-print">
        <div className="flex flex-wrap items-end gap-6">
          
          {/* Mode Selector for Fee reports */}
          {(type === 'fee-collection' || type === 'date-wise') && (
            <div className="space-y-1 w-full sm:w-44">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] p-2.5 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Modes</option>
                <option value="online">Online Gateway</option>
                <option value="offline">Offline / Cash</option>
              </select>
            </div>
          )}

          {/* Start and End date range constraints */}
          {type === 'date-wise' && (
            <>
              <div className="space-y-1 w-full sm:w-44">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-muted)]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1 w-full sm:w-44">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">End Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-muted)]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-cream)] py-2.5 pl-10 pr-3 text-xs text-[var(--text-dark)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action button trigger */}
          <div className="flex-1 flex justify-center sm:justify-start">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-orange-500 hover:bg-orange-450 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-md shadow-orange-500/10 cursor-pointer"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Compiled Results Section */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center no-print">
          <Loader className="h-8 w-8 animate-spin text-orange-500" />
          <span className="text-xs text-[var(--text-muted)] mt-2">Compiling report parameters...</span>
        </div>
      ) : (
        hasGenerated && reportData.length > 0 && (
          <div className="space-y-4">
            
            {/* Table Actions Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 no-print">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-orange-400" /> Generated Table
              </h3>
              <ExportButtons 
                data={reportData} 
                columns={getExportColumns()} 
                filename={`${type}_report_export`} 
              />
            </div>

            {/* Table view */}
            <div className="table-card overflow-hidden">
              <table>
                <thead>
                  <tr>
                    {/* Header Columns based on Report Type */}
                    {(type === 'fee-collection' || type === 'date-wise') && (
                      <>
                        <th>Fee Date</th>
                        <th>Candidate Name</th>
                        <th>Registration No.</th>
                        <th>Course Fees</th>
                        <th>Discount</th>
                        <th>Total Fee</th>
                        <th>Collected Fee</th>
                        <th>Payment Mode</th>
                      </>
                    )}
                    {type === 'courses' && (
                      <>
                        <th>S.No</th>
                        <th>Course/Technology Name</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Status</th>
                      </>
                    )}
                    {type === 'course-students' && (
                      <>
                        <th>S.No</th>
                        <th>Course Name</th>
                        <th>Duration</th>
                        <th>Total Candidates</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={item._id || index}>
                      
                      {/* S.No column only for non-fee reports */}
                      {(type === 'courses' || type === 'course-students') && (
                        <td>{index + 1}</td>
                      )}

                      {/* Fee/Payment Reports Row Mapping */}
                      {(type === 'fee-collection' || type === 'date-wise') && (
                        <>
                          <td className="font-mono text-[var(--text-muted)]">{formatDateToDDMMMYYYY(item.paidOn)}</td>
                          <td className="font-semibold text-[var(--text-dark)]">{item.studentId?.name || '—'}</td>
                          <td className="font-mono text-emerald-500 font-bold">{item.studentId?.registrationNo || '—'}</td>
                          <td className="font-mono text-[var(--text-dark)]">{item.studentId?.totalFee?.toLocaleString('en-US') ?? 0}</td>
                          <td className="font-mono text-rose-500">{item.discountAmount?.toLocaleString('en-US') ?? 0}</td>
                          <td className="font-mono text-[var(--text-dark)]">{item.totalToPay?.toLocaleString('en-US') ?? 0}</td>
                          <td className="font-mono font-bold text-[var(--text-dark)]">{item.amount?.toLocaleString('en-US') ?? 0}</td>
                          <td className="capitalize text-xs font-semibold">{item.paymentType}</td>
                        </>
                      )}

                      {/* Course Report Row Mapping */}
                      {type === 'courses' && (
                        <>
                          <td className="font-semibold text-[var(--text-dark)]">{item.technologyId?.name || '—'}</td>
                          <td className="font-mono text-[var(--text-muted)]">{item.durationId ? `${item.durationId.value} ${item.durationId.unit}(s)` : '—'}</td>
                          <td className="font-mono font-semibold">{item.price?.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${item.isActive ? 'badge-success' : 'badge-error'}`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Course Student Counts Row Mapping */}
                      {type === 'course-students' && (
                        <>
                          <td className="font-semibold text-[var(--text-dark)]">{item.courseName}</td>
                          <td className="font-mono text-[var(--text-muted)]">{item.duration}</td>
                          <td className="font-mono font-bold text-orange-500 text-sm">{item.studentCount}</td>
                        </>
                      )}

                    </tr>
                  ))}

                  {/* Summary Row for Fee reports */}
                  {(type === 'fee-collection' || type === 'date-wise') && (
                    <tr className="bg-[var(--bg-cream)]/40 font-bold border-t-2 border-[var(--border-color)]">
                      <td colSpan="6" className="text-right py-4 px-6 uppercase text-[10px] tracking-wider text-[var(--text-muted)] font-extrabold">
                        Total Paid
                      </td>
                      <td className="py-4 px-6 font-mono text-emerald-600 text-sm font-extrabold">
                        {reportData.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString('en-US')}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )
      )}

      {/* Empty States */}
      {hasGenerated && !loading && reportData.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-12 text-center text-xs text-[var(--text-muted)] no-print">
          No records matched your selection parameters. Try adjusting the filters.
        </div>
      )}

      {/* Screen action controls in bottom right */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]/60 no-print">
        <button
          onClick={handleClose}
          className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-255 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs font-semibold shadow-sm transition duration-150"
        >
          Close
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-255 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs font-semibold shadow-sm transition duration-150"
        >
          Print
        </button>
        <button
          onClick={handleGoBack}
          className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-255 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-xs font-semibold shadow-sm transition duration-150"
        >
          Go Back
        </button>
      </div>

    </div>
  );
};

export default Reports;
