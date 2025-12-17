// Imports removed to use global CDN variables
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

export const downloadElementAsPdf = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    try {
        // Use the global html2canvas from CDN
        const canvas = await window.html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // For images
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // If content height exceeds A4 page height, we might need multiple pages.
        // For now, we'll just scale it to fit or let it span if we implement multi-page logic.
        // Simple implementation: Single page, scaled to width. 
        // If it's too long, it will stretch or cut off. 
        // Improved implementation for long documents:

        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(fileName);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    }
};
