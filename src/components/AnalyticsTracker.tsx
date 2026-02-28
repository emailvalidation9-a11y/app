import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        // Check if gtag is defined on the window object
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('config', 'G-FF818YDZBT', {
                page_path: location.pathname + location.search,
            });
        }
    }, [location]);

    return null;
}
