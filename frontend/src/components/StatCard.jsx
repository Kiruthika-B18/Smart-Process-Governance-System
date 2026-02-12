const StatCard = ({ title, value, icon: Icon, color }) => {
    // Map tailwind bg colors to hex/vars or simple style override
    // The previous implementation passed "bg-blue-500" as color
    const getColor = (twClass) => {
        if (twClass.includes('blue')) return 'var(--primary-color)';
        if (twClass.includes('green')) return 'var(--success-color)';
        if (twClass.includes('red')) return 'var(--danger-color)';
        if (twClass.includes('orange')) return 'var(--warning-color)';
        return '#6c757d'; // gray
    };

    return (
        <div className="stat-card">
            <div>
                <p className="stat-title" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</p>
                <h3 className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>{value}</h3>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: getColor(color) }}>
                <Icon size={24} color="#fff" />
            </div>
        </div>
    );
};

export default StatCard;
