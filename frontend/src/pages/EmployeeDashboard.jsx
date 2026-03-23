import { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { formatDateSafe, formatDistanceSafe } from '../utils/dateUtils';
import { PlusCircle, Clock, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import UrgencyBadge from '../components/UrgencyBadge';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Total Requests');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [urgency, setUrgency] = useState('Medium');
    const [aadharNumber, setAadharNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [landAcreage, setLandAcreage] = useState('');

    const [farmerName, setFarmerName] = useState('');
    const [surveyNumber, setSurveyNumber] = useState('');
    const [village, setVillage] = useState('');
    const [taluk, setTaluk] = useState('');
    const [district, setDistrict] = useState('');
    const [landType, setLandType] = useState('');
    const [ownershipType, setOwnershipType] = useState('');

    const [targetManagerId, setTargetManagerId] = useState('');
    const [managers, setManagers] = useState([]);
    const [editingRequestId, setEditingRequestId] = useState(null);

    const [panNumber, setPanNumber] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load requests");
        }
    };

    const fetchManagers = async () => {
        try {
            const res = await api.get('/auth/managers');
            setManagers(res.data);
        } catch (err) {
            console.error("Failed to load managers", err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchManagers();
        const interval = setInterval(fetchRequests, 30000); // Auto refresh
        return () => clearInterval(interval);
    }, []);

    const handleEditClick = (req) => {
        setTitle(req.title);
        setDesc(req.description);
        setUrgency(req.urgency || 'Medium');
        setAadharNumber(req.aadhar_number || '');
        setAccountNumber(req.account_number || '');
        setLandAcreage(req.land_acreage || '');

        setFarmerName(req.farmer_name || '');
        setSurveyNumber(req.survey_number || '');
        setVillage(req.village || '');
        setTaluk(req.taluk || '');
        setDistrict(req.district || '');
        setLandType(req.land_type || '');
        setOwnershipType(req.ownership_type || '');
        setPanNumber(req.pan_number || '');
        setTargetManagerId(req.current_handler_id || '');
        setEditingRequestId(req.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setTitle('');
        setDesc('');
        setUrgency('Medium');
        setAadharNumber('');
        setAccountNumber('');
        setLandAcreage('');
        setFarmerName('');
        setSurveyNumber('');
        setVillage('');
        setTaluk('');
        setDistrict('');
        setLandType('');
        setOwnershipType('');
        setTargetManagerId('');
        setEditingRequestId(null);
        setPanNumber('');
        setIsFormOpen(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                description: desc,
                urgency,
                aadhar_number: aadharNumber,
                account_number: accountNumber,
                land_acreage: parseFloat(landAcreage),
                farmer_name: farmerName,
                survey_number: surveyNumber,
                village,
                taluk,
                district,
                land_type: landType,
                ownership_type: ownershipType,
                pan_number: panNumber
            };
            if (targetManagerId) {
                payload.target_manager_id = parseInt(targetManagerId);
            }

            if (editingRequestId) {
                await api.put(`/requests/${editingRequestId}`, payload);
                toast.success("Request updated successfully!");
            } else {
                await api.post('/requests', payload);
                toast.success("Request submitted successfully!");
            }

            fetchRequests();
            resetForm();
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            const msg = typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Failed to submit request';
            toast.error(msg);
        }
    };

    const isPending = (status) => status && status.startsWith('Pending_');

    const stats = {
        total: requests.length,
        pending: requests.filter(r => isPending(r.status)).length,
        approved: requests.filter(r => r.status === 'Approved').length,
        rejected: requests.filter(r => r.status === 'Rejected').length,
    };

    const getFilteredRequests = () => {
        if (filterStatus === 'Pending') return requests.filter(r => isPending(r.status));
        if (filterStatus === 'Approved') return requests.filter(r => r.status === 'Approved');
        if (filterStatus === 'Rejected') return requests.filter(r => r.status === 'Rejected');
        return requests; // 'Total Requests'
    };

    const displayRequests = getFilteredRequests();

    return (
        <div className="animation-fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">My Dashboard</h1>
                    <p className="page-subtitle">Overview of your request activities</p>
                </div>
                {!isFormOpen && (
                    <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
                        <PlusCircle size={20} /> New Request
                    </button>
                )}
            </div>

            <div className="stats-grid">
                <StatCard title="Total Requests" value={stats.total} icon={Clock} color="bg-gray-400" onClick={() => setFilterStatus('Total Requests')} isActive={filterStatus === 'Total Requests'} />
                <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-blue-500" onClick={() => setFilterStatus('Pending')} isActive={filterStatus === 'Pending'} />
                <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="bg-green-500" onClick={() => setFilterStatus('Approved')} isActive={filterStatus === 'Approved'} />
                <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500" onClick={() => setFilterStatus('Rejected')} isActive={filterStatus === 'Rejected'} />
            </div>

            {isFormOpen && (
                <div style={{
                    backgroundColor: 'var(--surface-color)',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-color)',
                    marginBottom: 'var(--spacing-lg)'
                }} className="animation-fade-in">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                        {editingRequestId ? 'Edit Request' : 'Submit New Request'}
                    </h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Request Title (e.g., Seeds, Tractor) <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="Enter request title" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Urgency <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <select className="input-field" value={urgency} onChange={e => setUrgency(e.target.value)} style={{ appearance: 'none', backgroundColor: 'white' }} required>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Farmer Name <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="Full Legal Name" value={farmerName} onChange={e => setFarmerName(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Aadhar Card Number <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="12-digit Aadhar" value={aadharNumber} onChange={e => setAadharNumber(e.target.value)} required maxLength={12} minLength={12} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Bank Account Number <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="Account for Subsidy" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Village <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="Village Name" value={village} onChange={e => setVillage(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Taluk <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="Taluk Name" value={taluk} onChange={e => setTaluk(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>District <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input list="tn-districts" className="input-field" placeholder="Search District..." value={district} onChange={e => setDistrict(e.target.value)} required />
                                <datalist id="tn-districts">
                                    <option value="Ariyalur" />
                                    <option value="Chengalpattu" />
                                    <option value="Chennai" />
                                    <option value="Coimbatore" />
                                    <option value="Cuddalore" />
                                    <option value="Dharmapuri" />
                                    <option value="Dindigul" />
                                    <option value="Erode" />
                                    <option value="Kallakurichi" />
                                    <option value="Kanchipuram" />
                                    <option value="Kanyakumari" />
                                    <option value="Karur" />
                                    <option value="Krishnagiri" />
                                    <option value="Madurai" />
                                    <option value="Mayiladuthurai" />
                                    <option value="Nagapattinam" />
                                    <option value="Namakkal" />
                                    <option value="Nilgiris" />
                                    <option value="Perambalur" />
                                    <option value="Pudukkottai" />
                                    <option value="Ramanathapuram" />
                                    <option value="Ranipet" />
                                    <option value="Salem" />
                                    <option value="Sivagangai" />
                                    <option value="Tenkasi" />
                                    <option value="Thanjavur" />
                                    <option value="Theni" />
                                    <option value="Thoothukudi" />
                                    <option value="Tiruchirappalli" />
                                    <option value="Tirunelveli" />
                                    <option value="Tirupathur" />
                                    <option value="Tiruppur" />
                                    <option value="Tiruvallur" />
                                    <option value="Tiruvannamalai" />
                                    <option value="Tiruvarur" />
                                    <option value="Vellore" />
                                    <option value="Viluppuram" />
                                    <option value="Virudhunagar" />
                                </datalist>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Survey Number <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="e.g. 104/2B" value={surveyNumber} onChange={e => setSurveyNumber(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Land Acreage <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" type="number" step="0.1" placeholder="Acres Owned" value={landAcreage} onChange={e => setLandAcreage(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Land Type <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <select className="input-field" value={landType} onChange={e => setLandType(e.target.value)} style={{ backgroundColor: 'white' }} required>
                                        <option value="" disabled>Select Land Type</option>
                                        <option value="Wet Land">Wet Land</option>
                                        <option value="Dry Land">Dry Land</option>
                                        <option value="Garden Land">Garden Land</option>
                                        <option value="Plantation Land">Plantation Land</option>
                                        <option value="Fallow Land">Fallow Land</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Ownership Type <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <select className="input-field" value={ownershipType} onChange={e => setOwnershipType(e.target.value)} style={{ backgroundColor: 'white' }} required>
                                        <option value="" disabled>Select Ownership</option>
                                        <option value="Owned">Owned</option>
                                        <option value="Leased">Leased</option>
                                        <option value="Shared">Shared</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>Description <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                            <textarea className="input-field" rows="3" placeholder="Enter details..." value={desc} onChange={e => setDesc(e.target.value)} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--text-secondary)' }}>PAN Number <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></label>
                                <input className="input-field" placeholder="10-digit alphanumeric PAN" value={panNumber} onChange={e => setPanNumber(e.target.value.toUpperCase())} required maxLength={10} minLength={10} style={{ textTransform: 'uppercase' }} />
                            </div>
                        </div>


                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingRequestId ? 'Update Request' : 'Submit Request'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <div className="table-header">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Requests</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Urgency</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Submitted</th>
                                <th>Actioned</th>
                                <th>Expected Delivery</th>
                                <th>Actioned By</th>
                                <th>Wait Time</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRequests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ color: 'var(--text-secondary)' }}>{req.id}</td>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.title}</td>
                                    <td><UrgencyBadge level={req.urgency} /></td>
                                    <td>
                                        <StatusBadge status={req.status} />
                                        {req.documents_verified ? (
                                            <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                                                <CheckCircle size={12} /> Docs Verified
                                            </div>
                                        ) : null}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {req.handler_username || 'Unassigned'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {formatDateSafe(req.created_at, 'MMM d, p')}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {(req.status === 'Approved' || req.status === 'Rejected')
                                            ? formatDateSafe(req.updated_at, 'MMM d, p')
                                            : '-'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem' }}>
                                        {req.status === 'Approved' && req.expected_delivery_date
                                            ? <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{formatDateSafe(req.expected_delivery_date, 'MMM d, yyyy')}</span>
                                            : <span style={{ color: 'var(--text-secondary)' }}>{req.status === 'Rejected' ? '-' : 'Pending'}</span>}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {req.actioned_by_username || '-'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                        {formatDistanceSafe(req.created_at)}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--danger-color)' }}>{req.rejection_reason || '-'}</td>
                                    <td>
                                        {req.status === 'Pending_Village' && (
                                            <button
                                                onClick={() => handleEditClick(req)}
                                                className="btn"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                                                title="Edit Request"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {displayRequests.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No requests found for this filter. Start by creating one!</div>}
                </div>
            </div>
        </div>
    );
};
export default EmployeeDashboard;
