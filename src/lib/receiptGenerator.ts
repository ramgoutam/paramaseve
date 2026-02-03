
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { TFunction } from "i18next";

export interface GroceryItem {
    name: string;
    quantity: string;
    unit: string;
}

export interface DonationData {
    donorName: string;
    amount: string;
    paymentMode: "UPI" | "CASH" | "GROCERIES";
    mobileNumber: string;
    notes: string;
    address?: string;
    utrNumber?: string;
    groceryList: GroceryItem[];
    createdAt?: string;
    receiptNo?: string;
}


// Helper function to convert image to base64
const imageToBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = reject;
        img.src = url;
    });
};

export const generateDonationPDF = async (
    data: DonationData,
    lang: string,
    t: TFunction,
    returnFile?: boolean
): Promise<File | boolean> => {
    try {
        // Load banner image as base64 (always use Kannada banner)
        const bannerUrl = '/banner-kn.jpg';
        const bannerBase64 = await imageToBase64(bannerUrl);
        const receiptElement = document.createElement("div");
        receiptElement.style.position = "absolute";
        receiptElement.style.left = "-9999px";
        receiptElement.style.top = "0";
        receiptElement.style.width = "794px";
        receiptElement.style.minHeight = "1123px";
        receiptElement.style.backgroundColor = "#ffffff";
        receiptElement.style.padding = "0";

        const paymentModeLabel = t(`mode_${data.paymentMode.toLowerCase()}` as any) || data.paymentMode;

        const utrRow = data.paymentMode === 'UPI' && data.utrNumber
            ? `<tr>
       <td style="color: #6b7280; font-size: 14px;">UTR Number</td>
       <td style="color: #111827; font-size: 15px; font-weight: 500;">${data.utrNumber}</td>
     </tr>`
            : '';

        // Separate Grocery List Table Logic
        let groceryTable = '';
        if (data.paymentMode === 'GROCERIES' && data.groceryList && data.groceryList.length > 0) {
            const rows = data.groceryList.map((item, index) => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 10px; color: #4b5563; font-size: 14px; text-align: center; border-bottom: 1px solid #f3f4f6;">${index + 1}</td>
                    <td style="padding: 10px; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">${item.name}</td>
                    <td style="padding: 10px; color: #4b5563; font-size: 14px; text-align: right; border-bottom: 1px solid #f3f4f6;">${item.quantity} ${item.unit}</td>
                </tr>
            `).join('');

            groceryTable = `
                <div style="margin-top: 20px; background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #f9fafb; padding: 10px 15px; border-bottom: 1px solid #e5e7eb;">
                        <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #374151;">Grocery Items List</h3>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #ffff;">
                                <th style="padding: 10px; text-align: center; color: #6b7280; font-size: 12px; font-weight: 600; uppercase; width: 50px; border-bottom: 2px solid #f3f4f6;">S.NO</th>
                                <th style="padding: 10px; text-align: left; color: #6b7280; font-size: 12px; font-weight: 600; uppercase; border-bottom: 2px solid #f3f4f6;">ITEM NAME</th>
                                <th style="padding: 10px; text-align: right; color: #6b7280; font-size: 12px; font-weight: 600; uppercase; width: 100px; border-bottom: 2px solid #f3f4f6;">QUANTITY</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            `;
        }

        const titleStyle = lang === 'kn'
            ? "color: #ea580c; margin: 0; font-size: 26px; font-weight: 800; line-height: 1.5;"
            : "color: #ea580c; margin: 0; text-transform: uppercase; font-size: 28px; font-weight: 800; letter-spacing: 0.5px;";

        const amountSection = data.paymentMode !== 'GROCERIES'
            ? `<div style="display: flex; justify-content: flex-end; align-items: center; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                <div style="text-align: right;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280; margin-bottom: 5px;">${t('amount')}</p>
                    <p style="margin: 0; font-size: 36px; font-weight: 800; color: #ea580c;">₹${data.amount}</p>
                </div>
               </div>`
            : `<div style="padding-top: 10px;"></div>`;

        // Use provided date or formatted text
        const displayDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        // Use receipt number if provided, else generate timestamp-based
        const receiptNo = data.receiptNo || Date.now().toString().slice(-6);

        receiptElement.innerHTML = `
    <div style="width: 794px; min-height: 1123px; padding: 40px; box-sizing: border-box; background: #fff; position: relative;">
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; height: 100%; border: 4px solid #ea580c; border-radius: 0px; background: #fff; padding: 40px; display: flex; flex-direction: column; box-sizing: border-box; justify-content: space-between; position: relative;">
             
             <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; background: #fff; padding: 0 8px;">
                Original Copy
             </div>

             <div style="flex: 0 0 auto;">
                 <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #ea580c;">
                    <img src="${bannerBase64}" alt="Trust Banner" style="width: 100%; height: auto; max-height: 120px; object-fit: contain;" />
                </div>
              
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0;">${t('app_title')}</h2>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">${t('receipt_no')}</p>
                        <p style="margin: 2px 0 0; font-size: 16px; font-weight: 600; color: #111827;">#${receiptNo}</p>
                    </div>
                </div>

                <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 25px; border-radius: 8px; margin-bottom: ${data.paymentMode === 'GROCERIES' ? '20px' : '30px'};">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
                        <tr>
                            <td style="color: #6b7280; font-size: 14px; width: 40%;">${t('date')}</td>
                            <td style="color: #111827; font-size: 15px; font-weight: 500;">${displayDate}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">${t('donor_name')}</td>
                            <td style="color: #111827; font-size: 16px; font-weight: 600;">${data.donorName}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">${t('mobile_number')}</td>
                            <td style="color: #111827; font-size: 15px; font-weight: 500;">${data.mobileNumber}</td>
                        </tr>
                        ${data.address ? `<tr>
                            <td style="color: #6b7280; font-size: 14px;">Address</td>
                            <td style="color: #111827; font-size: 15px; font-weight: 500;">${data.address}</td>
                        </tr>` : ''}
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">${t('donation_type')}</td>
                            <td style="color: #111827; font-size: 15px; font-weight: 500;">${paymentModeLabel}</td>
                        </tr>
                        ${utrRow}
                         <tr>
                            <td style="color: #6b7280; font-size: 14px;">${t('notes')}</td>
                            <td style="color: #111827; font-size: 15px; font-weight: 500;">${data.notes || "-"}</td>
                        </tr>
                    </table>
                </div>

                ${groceryTable}
                
                ${amountSection}
             </div>

             <div style="margin-top: auto; text-align: center;">
                 <p style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 5px;">${t('thank_you')}</p>
                 <p style="font-size: 13px; color: #6b7280;">${t('trust_name')}</p>
             </div>
        </div>
    </div>
  `;
        document.body.appendChild(receiptElement);

        const canvas = await html2canvas(receiptElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        if (returnFile) {
            const blob = pdf.output('blob');
            const filename = `Donation_Receipt_${data.donorName}_${Date.now()}_${lang}.pdf`;
            document.body.removeChild(receiptElement);
            return new File([blob], filename, { type: 'application/pdf' });
        }

        pdf.save(`Donation_Receipt_${data.donorName}_${Date.now()}_${lang}.pdf`);

        document.body.removeChild(receiptElement);
        return true;

    } catch (error) {
        console.error("PDF Generation Error (Lib):", error);
        throw error;
    }
}
