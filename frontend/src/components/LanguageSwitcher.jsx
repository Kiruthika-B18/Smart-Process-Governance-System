import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const [currentLang, setCurrentLang] = useState('en');

    useEffect(() => {
        // Read the currently active language from the googleTranslate cookie
        const cookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
        if (cookie) {
            const lang = cookie.split('/')[2];
            if (lang) {
                setCurrentLang(lang);
            }
        }
    }, []);

    const handleChange = (e) => {
        const targetLang = e.target.value;
        setCurrentLang(targetLang);
        
        // Find the hidden Google Translate select element and trigger change
        const selectElement = document.querySelector('#google_translate_element select');
        if (selectElement) {
            selectElement.value = targetLang;
            selectElement.dispatchEvent(new Event('change'));
        }
    };

    return (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                <Globe size={16} /> Language
            </div>
            <select 
                value={currentLang} 
                onChange={handleChange}
                className="notranslate"
                style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                }}
            >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="kn">ಕನ್ನಡ</option>
            </select>
            
            {/* Embedded styles to hide Google's default translation UI banner */}
            <style>{`
                .goog-te-banner-frame.skiptranslate { display: none !important; }
                body { top: 0px !important; }
                .goog-tooltip { display: none !important; }
                .goog-tooltip:hover { display: none !important; }
                .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
            `}</style>
        </div>
    );
};

export default LanguageSwitcher;
