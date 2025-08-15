import React from 'react';
import { generateFilename } from '../utils/filenameGenerator'
import { generatePackingListCSV } from './CSV';

const DownloadCSVButton = ({ listData, items }) => {
  const filename = generateFilename(listData, 'csv');

  const handleDownload = async () => {
    try {
      // Generate CSV client-side
      const blob = generatePackingListCSV(listData, items);
      
      // Generate a download link and initiate the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV. Please try again.');
    }
  };
  
  return (
    <button
      className="btn btn-outline-primary"
      onClick={handleDownload}
      title="Download packing list as CSV"
    >
      <i className="bi bi-filetype-csv me-2"></i>
      Download CSV
    </button>
  );
};

export default DownloadCSVButton;