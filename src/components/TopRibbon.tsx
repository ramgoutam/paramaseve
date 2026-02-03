
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const TopRibbon = () => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'kn' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="w-full bg-primary text-primary-foreground py-2 shadow-md flex items-center justify-between px-4">
            <div className="flex-1 text-center">
                <span className="text-xs md:text-sm drop-shadow-sm font-bold">
                    {t('top_ribbon')}
                </span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20 h-auto py-0 px-2 text-xs absolute right-2"
                onClick={toggleLanguage}
            >
                <Globe className="h-3 w-3 mr-1" />
                {i18n.language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </Button>
        </div>
    );
};

export default TopRibbon;
