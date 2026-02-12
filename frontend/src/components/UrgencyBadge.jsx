import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const UrgencyBadge = ({ level }) => {
    const getBadgeStyle = (level) => {
        switch (level) {
            case 'Critical':
                return { bg: '#fee2e2', text: '#ef4444', icon: AlertCircle };
            case 'High':
                return { bg: '#ffedd5', text: '#f97316', icon: AlertTriangle };
            case 'Medium':
                return { bg: '#dbeafe', text: '#3b82f6', icon: Info };
            case 'Low':
                return { bg: '#f3f4f6', text: '#6b7280', icon: CheckCircle }; // Or a generic icon
            default:
                return { bg: '#f3f4f6', text: '#6b7280', icon: Info };
        }
    };

    const style = getBadgeStyle(level);
    const Icon = style.icon;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: style.bg,
            color: style.text
        }}>
            <Icon size={12} />
            {level}
        </span>
    );
};

export default UrgencyBadge;
