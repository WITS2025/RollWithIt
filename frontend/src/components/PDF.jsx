import jsPDF from 'jspdf';

export const generatePackingListPDF = (listData, items) => {
  const pdf = new jsPDF();
  const MARGIN = 40;
  const CHECKBOX_SIZE = 8;
  const LINE_HEIGHT = 16;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = MARGIN - 10;

  const renderHeaderAndTitle = () => {
    centerText(`RollWithIt Packing List - ${new Date().toLocaleDateString()}`, 14, y, 'normal', [120, 120, 120]);
    y += 12;
    const title = listData?.title || 'Packing List';
    centerText(title, 22, y, 'bold', [33, 33, 33]);
    y += 18;
  };

  const centerText = (text, fontSize, yOffset, fontStyle = 'normal', color = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('courier', fontStyle);
    pdf.setTextColor(...color);
    pdf.text(text, pageWidth / 2, yOffset, { align: 'center' });
  };

  const drawCheckmark = (x, y) => {
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.6);
    pdf.line(x + 2.2, y + 4.5, x + 3.7, y + 5.5);
    pdf.line(x + 3.7, y + 5.5, x + 5.5, y + 2.5);
  };

  const drawRoundedCheckbox = (x, y, checked) => {
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x, y, CHECKBOX_SIZE, CHECKBOX_SIZE, 1.5, 1.5);

    if (checked) {
      pdf.setFillColor(33, 150, 243);
      pdf.roundedRect(x + 1, y + 1, CHECKBOX_SIZE - 2, CHECKBOX_SIZE - 2, 1, 1, 'F');
      drawCheckmark(x, y);
    }
  };

  const drawItemText = (text, x, y, checked) => {
    pdf.setFontSize(14);
    pdf.setFont('courier', 'normal');

    if (checked) {
      pdf.setTextColor(150, 150, 150);
      const textWidth = pdf.getTextWidth(text);
      pdf.line(x, y - 1, x + textWidth, y - 1);
    } else {
      pdf.setTextColor(33, 33, 33);
    }
    pdf.text(text, x, y);
  };

  renderHeaderAndTitle();

  if (!items || items.length === 0) {
    centerText('No items added yet.', 13, y, 'italic', [160, 160, 160]);
  } else {
    items.forEach((item, index) => {
      if (y > pageHeight - MARGIN) {
        pdf.addPage();
        y = MARGIN - 10;
        renderHeaderAndTitle();
      }

      const checkboxX = MARGIN;
      const checkboxY = y - 6;
      const textX = checkboxX + CHECKBOX_SIZE + 8;

      drawRoundedCheckbox(checkboxX, checkboxY, item.checked);
      drawItemText(item.text, textX, y, item.checked);

      y += LINE_HEIGHT;
    });
  }

  return pdf;
};