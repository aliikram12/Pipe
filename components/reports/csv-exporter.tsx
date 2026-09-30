'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CSVExportProps {
  data: any[];
  filename: string;
  buttonLabel?: string;
  className?: string;
}

export function CSVExporter({
  data,
  filename,
  buttonLabel = 'Export CSV',
  className = '',
}: CSVExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = () => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Convert data to CSV format
      const csvRows = [];
      csvRows.push(headers.join(',')); // Add header row
      
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = ('' + (val || '')).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate CSV document');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={generateCSV}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg neu-button text-emerald-700 hover:neu-inset disabled:opacity-50 transition shadow-xs ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      {isExporting ? 'Generating...' : buttonLabel}
    </button>
  );
}
