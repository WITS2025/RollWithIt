import React from 'react';
import { generateFilename } from '../utils/filenameGenerator'
import { generatePackingListPDF } from './PDF';

const DownloadPDFButton = ({ listData, items }) => {
  const filename = generateFilename(listData, 'pdf');

  
  const handleDownload = async () => {
    try {
      // Generate PDF client-side
      const pdf = generatePackingListPDF(listData, items);
      
      // Save PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <button
      className="btn btn-outline-primary"
      onClick={handleDownload}
      title="Download packing list as PDF"
    >
      <i className="bi bi-file-earmark-pdf me-2"></i>
      Download PDF
    </button>
  );
};

export default DownloadPDFButton;