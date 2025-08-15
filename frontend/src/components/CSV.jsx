import Papa from 'papaparse';

export const generatePackingListCSV = (listData, items) => {
  // Prepare data for CSV
  const itemList = items || [];
  
  // Create CSV data structure
  // Format: Title,Item,Checked (one row per item)
  const csvData = (itemList || []).map(item => ({
    Title: listData?.title || 'Packing List',
    Item: item.text,
    Checked: item.checked ? 'true' : 'false'
  }));

  const csv = Papa.unparse(csvData, { columns: ['Title', 'Item', 'Checked'] });

  // Create a Blob from the CSV string
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  return blob;
}; 