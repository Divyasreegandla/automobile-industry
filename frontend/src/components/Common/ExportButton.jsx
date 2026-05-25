import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const ExportButton = ({ data, filename, columns }) => {
  const exportToExcel = () => {
    try {
      const exportData = data.map((row) => {
        const obj = {};
        columns.forEach((col) => {
          obj[col.label] = row[col.key];
        });
        return obj;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  };

  return (
    <button onClick={exportToExcel} className="btn-secondary flex items-center">
      <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
      Export Excel
    </button>
  );
};