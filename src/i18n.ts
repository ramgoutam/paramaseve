import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translations
const resources = {
    en: {
        translation: {
            "top_ribbon": "|| Sri Kottureshwaraya Namaha ||",
            "app_title": "Donation Collection",
            "app_description": "Record a new donation and generate a receipt instantly.",
            "donor_details": "Donor Details",
            "donor_details_desc": "Enter the information for the donation receipt.",
            "donor_name": "Donor Name",
            "enter_full_name": "Enter full name",
            "mobile_number": "Mobile Number",
            "enter_mobile": "10-digit mobile number",
            "amount": "Amount / Value (₹)",
            "enter_amount": "Enter amount",
            "donation_type": "Donation Type",
            "select_mode": "Select mode",
            "mode_upi": "UPI / QR Code",
            "mode_cash": "Cash",
            "mode_groceries": "Groceries / Goods",
            "notes": "Notes (Optional)",
            "notes_placeholder": "Any additional details (e.g., list of groceries)",
            "save_generate": "Save & Generate Receipt",
            "generating": "Generating Receipt...",
            "missing_info_title": "Missing Information",
            "missing_info_desc": "Please fill in all mandatory fields (Name, Amount, Mobile).",
            "receipt_no": "Receipt No",
            "date": "Date",
            "thank_you": "Thank you for your generous contribution!",
            "trust_name": "Paramashakthi Sri Guru Kottureshwara Trust (R)",
            "trust_address": "Sri Kshetra Kotturu, Vijayanagara District",
            "trust_state": "Karnataka - 583 134",
            "receipt_generated_title": "Receipt Generated",
            "receipt_generated_desc": "The donation receipt has been downloaded.",
            "error_title": "Error",
            "error_desc": "Failed to generate receipt. Please try again."
        }
    },
    kn: {
        translation: {
            "top_ribbon": "|| ಶ್ರೀ ಕೊಟ್ಟೂರೇಶ್ವರಾಯ ನಮಃ ||",
            "app_title": "ದೇಣಿಗೆ ಸಂಗ್ರಹ",
            "app_description": "ಹೊಸ ದೇಣಿಗೆಯನ್ನು ದಾಖಲಿಸಿ ಮತ್ತು ತಕ್ಷಣ ರಸೀದಿಯನ್ನು ರಚಿಸಿ.",
            "donor_details": "ದಾನಿಗಳ ವಿವರಗಳು",
            "donor_details_desc": "ದೇಣಿಗೆ ರಸೀದಿಗಾಗಿ ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸಿ.",
            "donor_name": "ದಾನಿಗಳ ಹೆಸರು",
            "enter_full_name": "ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
            "mobile_number": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
            "enter_mobile": "10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
            "amount": "ಮೊತ್ತ / ಮೌಲ್ಯ (₹)",
            "enter_amount": "ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ",
            "donation_type": "ದೇಣಿಗೆ ಪ್ರಕಾರ",
            "select_mode": "ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
            "mode_upi": "ಯುಪಿಐ (UPI) / ಕ್ಯೂಆರ್ ಕೋಡ್",
            "mode_cash": "ನಗದು",
            "mode_groceries": "ದವಸ ಧಾನ್ಯಗಳು / ವಸ್ತುಗಳು",
            "notes": "ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)",
            "notes_placeholder": "ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ವಿವರಗಳು (ಉದಾಹರಣೆಗೆ, ದಿನಸಿ ಪಟ್ಟಿ)",
            "save_generate": "ಉಳಿಸಿ ಮತ್ತು ರಸೀದಿಯನ್ನು ರಚಿಸಿ",
            "generating": "ರಸೀದಿಯನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ...",
            "missing_info_title": "ಮಾಹಿತಿ ಕಾಣೆಯಾಗಿದೆ",
            "missing_info_desc": "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕಡ್ಡಾಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ (ಹೆಸರು, ಮೊತ್ತ, ಮೊಬೈಲ್).",
            "receipt_no": "ರಸೀದಿ ಸಂಖ್ಯೆ",
            "date": "ದಿನಾಂಕ",
            "thank_you": "ನಿಮ್ಮ ಉದಾರ ದೇಣಿಗೆಗೆ ಧನ್ಯವಾದಗಳು!",
            "trust_name": "ಪರಮಶಕ್ತಿ ಶ್ರೀ ಗುರು ಕೊಟ್ಟೂರೇಶ್ವರ ಟ್ರಸ್ಟ್ (ರಿ)",
            "trust_address": "ಶ್ರೀ ಕ್ಷೇತ್ರ ಕೊಟ್ಟೂರು, ವಿಜಯನಗರ ಜಿಲ್ಲೆ",
            "trust_state": "ಕರ್ನಾಟಕ - 583 134",
            "receipt_generated_title": "ರಸೀದಿ ರಚಿಸಲಾಗಿದೆ",
            "receipt_generated_desc": "ದೇಣಿಗೆ ರಸೀದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ.",
            "error_title": "ದೋಷ",
            "error_desc": "ರಸೀದಿಯನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
