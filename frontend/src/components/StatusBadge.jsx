import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const config = {
        Approved: { className: 'badge-approved', icon: CheckCircle },
        Rejected: { className: 'badge-rejected', icon: XCircle },
        Pending_Village: { className: 'badge-pending', icon: Clock },
        Pending_Block: { className: 'badge-pending', icon: Clock },
        Pending_District: { className: 'badge-pending', icon: Clock },
    };

    const { className, icon: Icon } = config[status] || { className: 'badge-pending', icon: Clock };

    // Make the label more readable if it's a pending state
    const displayStatus = status ? status.replace('_', ' ') : 'Unknown';

    return (
        <span className={`badge ${className}`}>
            <Icon size={14} />
            {displayStatus}
        </span>
    );
};

export default StatusBadge;
