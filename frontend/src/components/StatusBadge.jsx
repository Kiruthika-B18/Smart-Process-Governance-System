import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const config = {
        Approved: { className: 'badge-approved', icon: CheckCircle },
        Rejected: { className: 'badge-rejected', icon: XCircle },
        Pending: { className: 'badge-pending', icon: Clock },
        Escalated: { className: 'badge-escalated', icon: AlertTriangle },
    };

    const { className, icon: Icon } = config[status] || config.Pending;

    return (
        <span className={`badge ${className}`}>
            <Icon size={14} />
            {status}
        </span>
    );
};

export default StatusBadge;
