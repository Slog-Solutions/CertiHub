import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Copy, FileSpreadsheet, FileText, Printer, Check } from 'lucide-react';

const ExportButtons = ({ data = [], columns = [], filename = 'report', onlyActiveForExcel = false }) => {
  const [copied, setCopied] = useState(false);

  const getDataset = () => {
    return onlyActiveForExcel ? data.filter(item => item.isActive === true) : data;
  };

  const getExportableData = (dataset) => {
    return dataset.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.header] = col.accessor(item);
      });
      return row;
    });
  };

  const handleCopy = () => {
    const dataset = getDataset();
    if (dataset.length === 0) return;
    const headers = columns.map(col => col.header).join('\t');
    const rows = dataset.map(item => 
      columns.map(col => {
        const val = col.accessor(item);
        return val === undefined || val === null ? '' : String(val).replace(/\n/g, ' ');
      }).join('\t')
    ).join('\n');

    const clipboardText = `${headers}\n${rows}`;
    navigator.clipboard.writeText(clipboardText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExcel = () => {
    const dataset = getDataset();
    if (dataset.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(getExportableData(dataset));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
  };

  const handlePrint = (mode = 'print') => {
    const dataset = getDataset();
    if (dataset.length === 0) return;
    const printWindow = window.open('', '_blank');
    const title = filename.charAt(0).toUpperCase() + filename.slice(1).replace(/_/g, ' ');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
            h2 { color: #047857; margin-bottom: 5px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; color: #0f172a; font-weight: 600; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <div class="meta">Generated on: ${new Date().toLocaleString()} | Total Records: ${dataset.length}</div>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${dataset.map(item => `
                <tr>
                  ${columns.map(col => `<td>${col.accessor(item) ?? ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    // Wait a brief moment to load content, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={handleCopy}
        disabled={data.length === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] text-[var(--text-dark)] rounded-lg border border-[var(--border-color)] text-xs hover:bg-[var(--bg-cream)] hover:text-emerald-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-emerald-500" />
            Copy
          </>
        )}
      </button>

      <button
        onClick={handleExcel}
        disabled={data.length === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] text-[var(--text-dark)] rounded-lg border border-[var(--border-color)] text-xs hover:bg-[var(--bg-cream)] hover:text-emerald-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export to Excel"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
        Excel
      </button>

      <button
        onClick={() => handlePrint('pdf')}
        disabled={data.length === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] text-[var(--text-dark)] rounded-lg border border-[var(--border-color)] text-xs hover:bg-[var(--bg-cream)] hover:text-emerald-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export as PDF"
      >
        <FileText className="h-3.5 w-3.5 text-emerald-500" />
        PDF
      </button>

      <button
        onClick={() => handlePrint('print')}
        disabled={data.length === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] text-[var(--text-dark)] rounded-lg border border-[var(--border-color)] text-xs hover:bg-[var(--bg-cream)] hover:text-emerald-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Print table"
      >
        <Printer className="h-3.5 w-3.5 text-emerald-500" />
        Print
      </button>
    </div>
  );
};

export default ExportButtons;
