import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Plus,
  FlaskConical,
  AlertCircle,
  Bell,
  ClipboardList,
  X,
  Search,
  Filter
} from 'lucide-react';
import {
  fetchChemicals,
  fetchChemical,
  createChemical,
  updateChemical,
  addChemicalNote,
  deleteChemical,
  fetchFormulations,
  createFormulation,
  updateFormulation,
  addFormulationNote,
  deleteFormulation,
} from '../api/chemicals';
import { fetchChemicalPurchaseHistory } from '../api/accountTransactions';
import ChemicalDetail from './ChemicalDetail';
import ChemicalForm from './ChemicalForm';
import FormulationForm from './FormulationForm';
import NotificationSystem from './NotificationSystem';
import styles from './ChemicalsDashboard.module.scss';

export default function ChemicalsDashboard() {
  const [chemicals, setChemicals] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [formulations, setFormulations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFormulationForm, setShowFormulationForm] = useState(false);
  const [editingChemical, setEditingChemical] = useState(null);
  const [editingFormulation, setEditingFormulation] = useState(null);
  const [activeView, setActiveView] = useState('inventory'); // 'inventory', 'product', or 'account'
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState({});
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    quantityMin: '',
    quantityMax: '',
    lastUpdatedFrom: '',
    lastUpdatedTo: '',
    updatedBy: '',
    thresholdAlert: false,
    amountMin: '',
    amountMax: ''
  });
  
  const { user, userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadChemicals();
  }, []);

  const loadChemicals = async () => {
    try {
      setLoading(true);
      const data = await fetchChemicals();
      console.log('Loaded chemicals:', data);
      setChemicals(data);
      
      // Check for alerts based on quantities
      checkForAlerts(data);
      
      // Load purchase history for account view
      if (['admin', 'account'].includes(userInfo?.role || user?.role || 'all_users')) {
        await loadPurchaseHistory(data);
      }
      
      setError('');
    } catch (err) {
      console.error('Error loading chemicals:', err);
      setError(err.message || 'Failed to load chemicals. Please check your connection.');
      setChemicals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseHistory = async (chemicalData) => {
    const history = {};
    for (const chemical of chemicalData) {
      try {
        const historyData = await fetchChemicalPurchaseHistory(chemical.id);
        history[chemical.id] = historyData;
      } catch (err) {
        console.error(`Error loading purchase history for chemical ${chemical.id}:`, err);
        history[chemical.id] = {
          total_purchased: 0,
          total_spent: 0,
          average_unit_price: 0,
          currency: 'USD'
        };
      }
    }
    setPurchaseHistory(history);
  };

  const checkForAlerts = (chemicalData) => {
    const newAlerts = [];
    
    chemicalData.forEach(chemical => {
      // Get alert threshold (default to 10 if not set)
      const alertThreshold = chemical.alert_threshold || 10;
      
      // Low stock alert (below custom threshold)
      if (chemical.quantity < alertThreshold && chemical.quantity > 0 && 
          chemical.unit !== 'pieces' && chemical.unit !== 'bottles') {
        newAlerts.push({
          id: `low_stock_${chemical.id}`,
          type: 'low_stock',
          severity: 'warning',
          message: `Low stock alert: ${chemical.name} has only ${chemical.quantity} ${chemical.unit} remaining (threshold: ${alertThreshold} ${chemical.unit})`,
          chemicalId: chemical.id,
          timestamp: new Date().toISOString()
        });
      }
      
      // Out of stock alert
      if (chemical.quantity <= 0) {
        newAlerts.push({
          id: `out_of_stock_${chemical.id}`,
          type: 'out_of_stock',
          severity: 'critical',
          message: `Out of stock: ${chemical.name} is completely depleted`,
          chemicalId: chemical.id,
          timestamp: new Date().toISOString()
        });
      }
      
      // Expiry alert (if we had expiry dates)
      // This would be implemented when expiry tracking is added
    });
    
    setAlerts(newAlerts);
  };

  const handleSelectChemical = async (id) => {
    try {
      const chemical = await fetchChemical(id);
      setSelectedChemical(chemical);
      
      // Load formulations for this chemical
      const formulationData = await fetchFormulations(id);
      setFormulations(formulationData);
      setError('');
    } catch (err) {
      console.error('Error loading chemical details:', err);
      setError(err.message || 'Failed to load chemical details.');
    }
  };

  const handleCreateChemical = async (chemicalData) => {
    try {
      console.log('Creating chemical with data:', chemicalData);
      const result = await createChemical(chemicalData);
      console.log('Chemical created successfully:', result);
      await loadChemicals();
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      console.error('Error creating chemical:', err);
      setError(err.message || 'Failed to create chemical.');
    }
  };

  const handleUpdateChemical = async (id, chemicalData) => {
    try {
      console.log('Updating chemical with data:', chemicalData);
      await updateChemical(id, chemicalData);
      console.log('Chemical updated successfully');
      await loadChemicals();
      if (selectedChemical && selectedChemical.id === id) {
        const updated = await fetchChemical(id);
        setSelectedChemical(updated);
      }
      setEditingChemical(null);
      setError('');
    } catch (err) {
      console.error('Error updating chemical:', err);
      setError(err.message || 'Failed to update chemical.');
    }
  };

  const handleDeleteChemical = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chemical?')) {
      return;
    }
    
    try {
      await deleteChemical(id);
      await loadChemicals();
      if (selectedChemical && selectedChemical.id === id) {
        setSelectedChemical(null);
        setFormulations([]);
      }
      setError('');
    } catch (err) {
      console.error('Error deleting chemical:', err);
      setError(err.message || 'Failed to delete chemical.');
    }
  };

  const handleAddChemicalNote = async (id, note) => {
    try {
      await addChemicalNote(id, note);
      if (selectedChemical && selectedChemical.id === id) {
        const updated = await fetchChemical(id);
        setSelectedChemical(updated);
      }
      setError('');
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err.message || 'Failed to add note.');
    }
  };

  const handleCreateFormulation = async (formulationData) => {
    try {
      await createFormulation(formulationData);
      if (selectedChemical) {
        const formulationData = await fetchFormulations(selectedChemical.id);
        setFormulations(formulationData);
      }
      setShowFormulationForm(false);
      setError('');
    } catch (err) {
      console.error('Error creating formulation:', err);
      setError(err.message || 'Failed to create formulation.');
    }
  };

  const handleUpdateFormulation = async (id, formulationData) => {
    try {
      await updateFormulation(id, formulationData);
      if (selectedChemical) {
        const formulationData = await fetchFormulations(selectedChemical.id);
        setFormulations(formulationData);
      }
      setEditingFormulation(null);
      setError('');
    } catch (err) {
      console.error('Error updating formulation:', err);
      setError(err.message || 'Failed to update formulation.');
    }
  };

  const handleDeleteFormulation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this formulation detail?')) {
      return;
    }
    
    try {
      await deleteFormulation(id);
      if (selectedChemical) {
        const formulationData = await fetchFormulations(selectedChemical.id);
        setFormulations(formulationData);
      }
      setError('');
    } catch (err) {
      console.error('Error deleting formulation:', err);
      setError(err.message || 'Failed to delete formulation.');
    }
  };

  const handleAddFormulationNote = async (id, note) => {
    try {
      await addFormulationNote(id, note);
      if (selectedChemical) {
        const formulationData = await fetchFormulations(selectedChemical.id);
        setFormulations(formulationData);
      }
      setError('');
    } catch (err) {
      console.error('Error adding formulation note:', err);
      setError(err.message || 'Failed to add formulation note.');
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Filter chemicals based on search term and filters
  const getFilteredChemicals = () => {
    let filtered = [...chemicals];

    // Search by chemical name
    if (searchTerm.trim()) {
      filtered = filtered.filter(chemical =>
        chemical.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by quantity range
    if (filters.quantityMin !== '') {
      filtered = filtered.filter(chemical => chemical.quantity >= parseFloat(filters.quantityMin));
    }
    if (filters.quantityMax !== '') {
      filtered = filtered.filter(chemical => chemical.quantity <= parseFloat(filters.quantityMax));
    }

    // Filter by last updated date range
    if (filters.lastUpdatedFrom) {
      const fromDate = new Date(filters.lastUpdatedFrom);
      filtered = filtered.filter(chemical => new Date(chemical.last_updated) >= fromDate);
    }
    if (filters.lastUpdatedTo) {
      const toDate = new Date(filters.lastUpdatedTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(chemical => new Date(chemical.last_updated) <= toDate);
    }

    // Filter by updated by user
    if (filters.updatedBy.trim()) {
      filtered = filtered.filter(chemical => {
        if (chemical.updated_by_user) {
          const fullName = `${chemical.updated_by_user.first_name} ${chemical.updated_by_user.last_name || ''}`.toLowerCase();
          return fullName.includes(filters.updatedBy.toLowerCase());
        }
        return chemical.updated_by && chemical.updated_by.toLowerCase().includes(filters.updatedBy.toLowerCase());
      });
    }

    // Filter by threshold alert (show only chemicals below threshold)
    if (filters.thresholdAlert) {
      filtered = filtered.filter(chemical => {
        const threshold = chemical.alert_threshold || 10;
        return chemical.quantity < threshold;
      });
    }

    // Filter by amount range (for account view)
    if (activeView === 'account' && (filters.amountMin !== '' || filters.amountMax !== '')) {
      filtered = filtered.filter(chemical => {
        const history = purchaseHistory[chemical.id];
        if (!history) return false;
        
        const totalSpent = history.total_spent || 0;
        
        if (filters.amountMin !== '' && totalSpent < parseFloat(filters.amountMin)) {
          return false;
        }
        if (filters.amountMax !== '' && totalSpent > parseFloat(filters.amountMax)) {
          return false;
        }
        return true;
      });
    }

    return filtered;
  };

  // Role-based permissions - use userInfo.role if available, fallback to user.role
  const userRole = userInfo?.role || user?.role || 'all_users';
  console.log('Current user role:', userRole);
  console.log('User info:', userInfo);
  console.log('User:', user);
  
  const canCreateChemical = ['admin', 'lab_staff', 'product'].includes(userRole);
  const canEditChemical = ['admin', 'lab_staff', 'product', 'account'].includes(userRole);
  const canDeleteChemical = userRole === 'admin';
  const canCreateFormulation = ['admin', 'lab_staff', 'product'].includes(userRole);
  const canEditFormulation = ['admin', 'lab_staff', 'product', 'account'].includes(userRole);
  const canDeleteFormulation = userRole === 'admin';
  const canViewProductTable = ['admin', 'product'].includes(userRole);
  const canViewAccountTable = ['admin', 'account'].includes(userRole);
  const canManageAlerts = ['admin', 'product'].includes(userRole);

  console.log('Permissions:', {
    canCreateChemical,
    canEditChemical,
    canDeleteChemical,
    canCreateFormulation,
    canEditFormulation,
    canDeleteFormulation,
    canViewProductTable,
    canViewAccountTable,
    canManageAlerts
  });

  if (loading) {
    return <div className={styles.loading}>Loading chemical inventory...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Chemical Inventory Management</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Role: {userRole} | Chemicals: {chemicals.length}
          </span>
          {alerts.length > 0 && canManageAlerts && (
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              style={{
                background: alerts.some(a => a.severity === 'critical') ? '#dc3545' : '#ffc107',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Alerts ({alerts.length})
              </span>
            </button>
          )}
          {canManageAlerts && (
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={16} /> Notifications
              </span>
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Alerts Section */}
      {showAlerts && alerts.length > 0 && (
        <div className={styles.alertsSection}>
          <h3>Active Alerts</h3>
          <div className={styles.alertsList}>
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`${styles.alertItem} ${styles[alert.severity]}`}
              >
                <div className={styles.alertContent}>
                  <span className={styles.alertIcon}>
                    {alert.severity === 'critical' ? <AlertCircle size={16} color="red" /> : <AlertTriangle size={16} color="orange" />}
                  </span>
                  <span className={styles.alertMessage}>{alert.message}</span>
                  <span className={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className={styles.dismissAlert}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification System */}
      {showNotifications && canManageAlerts && (
        <NotificationSystem 
          alerts={alerts}
          onDismissAlert={dismissAlert}
        />
      )}

      {/* View Toggle */}
      {(canViewProductTable || canViewAccountTable) && (
        <div className={styles.viewToggle}>
          <button
            className={activeView === 'inventory' ? styles.activeView : styles.viewBtn}
            onClick={() => setActiveView('inventory')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardList size={16} /> Full Inventory
            </span>
          </button>
          {canViewProductTable && (
            <button
              className={activeView === 'product' ? styles.activeView : styles.viewBtn}
              onClick={() => setActiveView('product')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={16} /> Product Team View
              </span>
            </button>
          )}
          {canViewAccountTable && (
            <button
              className={activeView === 'account' ? styles.activeView : styles.viewBtn}
              onClick={() => setActiveView('account')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={16} /> Account Team View
              </span>
            </button>
          )}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className={styles.searchFilterSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search chemicals by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchField}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={styles.clearSearch}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
          >
            <Filter size={16} />
            Filters
            {Object.values(filters).some(value => value !== '' && value !== false) && (
              <span className={styles.filterBadge}>•</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label>Quantity Range</label>
                <div className={styles.rangeInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.quantityMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, quantityMin: e.target.value }))}
                    className={styles.rangeInput}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.quantityMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, quantityMax: e.target.value }))}
                    className={styles.rangeInput}
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>Last Updated Range</label>
                <div className={styles.dateInputs}>
                  <input
                    type="date"
                    value={filters.lastUpdatedFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastUpdatedFrom: e.target.value }))}
                    className={styles.dateInput}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={filters.lastUpdatedTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastUpdatedTo: e.target.value }))}
                    className={styles.dateInput}
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>Updated By</label>
                <input
                  type="text"
                  placeholder="Search by user name..."
                  value={filters.updatedBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, updatedBy: e.target.value }))}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.thresholdAlert}
                    onChange={(e) => setFilters(prev => ({ ...prev, thresholdAlert: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  Show only chemicals below alert threshold
                </label>
              </div>

              {activeView === 'account' && (
                <div className={styles.filterGroup}>
                  <label>Amount Range (Total Spent)</label>
                  <div className={styles.rangeInputs}>
                    <input
                      type="number"
                      placeholder="Min $"
                      value={filters.amountMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                      className={styles.rangeInput}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max $"
                      value={filters.amountMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                      className={styles.rangeInput}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.filterActions}>
              <button
                onClick={() => setFilters({
                  quantityMin: '',
                  quantityMax: '',
                  lastUpdatedFrom: '',
                  lastUpdatedTo: '',
                  updatedBy: '',
                  thresholdAlert: false,
                  amountMin: '',
                  amountMax: ''
                })}
                className={styles.clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.chemicalsList}>
          <div className={styles.listHeader}>
            <h3>
              {activeView === 'product' ? 'Product Team View' : 
               activeView === 'account' ? 'Account Team View' : 'Chemicals'} 
              ({getFilteredChemicals().length} of {chemicals.length})
            </h3>
            {canCreateChemical && (
              <button 
                onClick={() => setShowCreateForm(true)} 
                className={styles.addBtn}
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Add Chemical
                </span>
              </button>
            )}
          </div>
          
          {chemicals.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><FlaskConical size={48} /></div>
              <h4>No Chemicals Found</h4>
              <p>Get started by adding your first chemical to the inventory.</p>
              {canCreateChemical && (
                <button 
                  onClick={() => setShowCreateForm(true)} 
                  className={styles.addBtn}
                  style={{ 
                    background: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Add Your First Chemical
                  </span>
                </button>
              )}
              {!canCreateChemical && (
                <p style={{ color: '#dc3545', fontSize: '14px' }}>
                  You don't have permission to add chemicals. Contact an administrator.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.chemicalsGrid}>
              {getFilteredChemicals().map(chemical => {
                // Check if this chemical has alerts
                const chemicalAlerts = alerts.filter(a => a.chemicalId === chemical.id);
                const hasCriticalAlert = chemicalAlerts.some(a => a.severity === 'critical');
                const hasWarningAlert = chemicalAlerts.some(a => a.severity === 'warning');
                
                return (
                  <div 
                    key={chemical.id} 
                    className={`${styles.chemicalCard} ${selectedChemical?.id === chemical.id ? styles.selected : ''} ${
                      hasCriticalAlert ? styles.criticalAlert : hasWarningAlert ? styles.warningAlert : ''
                    }`}
                    onClick={() => handleSelectChemical(chemical.id)}
                  >
                    <div className={styles.cardHeader}>
                      <h4>{chemical.name}</h4>
                      {hasCriticalAlert && <span className={styles.alertBadge}><AlertCircle size={16} color="red" /></span>}
                      {hasWarningAlert && !hasCriticalAlert && <span className={styles.alertBadge}><AlertTriangle size={16} color="orange" /></span>}
                    </div>
                    
                    {activeView === 'account' ? (
                      // Account Team View - Focus on financial information
                      <div className={styles.accountView}>
                        <div className={styles.quantityInfo}>
                          <span className={styles.quantityLabel}>Current Stock:</span>
                          <span className={`${styles.quantityValue} ${
                            chemical.quantity <= 0 ? styles.outOfStock : 
                            chemical.quantity < (chemical.alert_threshold || 10) ? styles.lowStock : styles.normalStock
                          }`}>
                            {chemical.quantity} {chemical.unit}
                          </span>
                        </div>
                        {purchaseHistory[chemical.id] && (
                          <div className={styles.purchaseInfo}>
                            <p><strong>Total Purchased:</strong> {purchaseHistory[chemical.id].total_purchased} {chemical.unit}</p>
                            <p><strong>Total Spent:</strong> {formatCurrency(purchaseHistory[chemical.id].total_spent, purchaseHistory[chemical.id].currency)}</p>
                            <p><strong>Avg. Unit Price:</strong> {formatCurrency(purchaseHistory[chemical.id].average_unit_price, purchaseHistory[chemical.id].currency)}</p>
                            {purchaseHistory[chemical.id].last_purchase_date && (
                              <p><strong>Last Purchase:</strong> {new Date(purchaseHistory[chemical.id].last_purchase_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}
                        <div className={styles.additionalInfo}>
                          <p><strong>Alert Threshold:</strong> {chemical.alert_threshold ? `${chemical.alert_threshold} ${chemical.unit}` : 'Not set'}</p>
                          {chemical.location && <p><strong>Location:</strong> {chemical.location}</p>}
                          {chemical.supplier && <p><strong>Supplier:</strong> {chemical.supplier}</p>}
                          <p><strong>Last Updated:</strong> {new Date(chemical.last_updated).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ) : activeView === 'product' ? (
                      // Product Team View - Focus on quantities and alerts
                      <div className={styles.productView}>
                        <div className={styles.quantityInfo}>
                          <span className={styles.quantityLabel}>Current Stock:</span>
                          <span className={`${styles.quantityValue} ${
                            chemical.quantity <= 0 ? styles.outOfStock : 
                            chemical.quantity < (chemical.alert_threshold || 10) ? styles.lowStock : styles.normalStock
                          }`}>
                            {chemical.quantity} {chemical.unit}
                          </span>
                        </div>
                        <div className={styles.stockStatus}>
                          {chemical.quantity <= 0 && <span className={styles.statusOut}>Out of Stock</span>}
                          {chemical.quantity > 0 && chemical.quantity < (chemical.alert_threshold || 10) && <span className={styles.statusLow}>Low Stock</span>}
                          {chemical.quantity >= (chemical.alert_threshold || 10) && <span className={styles.statusNormal}>In Stock</span>}
                        </div>
                        <div className={styles.additionalInfo}>
                          <p><strong>Alert Threshold:</strong> {chemical.alert_threshold ? `${chemical.alert_threshold} ${chemical.unit}` : 'Not set'}</p>
                          {chemical.location && <p><strong>Location:</strong> {chemical.location}</p>}
                          {chemical.supplier && <p><strong>Supplier:</strong> {chemical.supplier}</p>}
                          <p><strong>Last Updated:</strong> {new Date(chemical.last_updated).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ) : (
                      // Full Inventory View
                      <div className={styles.inventoryView}>
                        <p><strong>Quantity:</strong> {chemical.quantity} {chemical.unit}</p>
                        <p><strong>Alert Threshold:</strong> {chemical.alert_threshold ? `${chemical.alert_threshold} ${chemical.unit}` : 'Not set'}</p>
                        <p><strong>Last Updated:</strong> {new Date(chemical.last_updated).toLocaleDateString()}</p>
                        {chemical.updated_by_user ? (
                          <p><strong>Updated by:</strong> {chemical.updated_by_user.first_name} {chemical.updated_by_user.last_name || ''} ({chemical.updated_by_user.role.replace('_', ' ').toUpperCase()})</p>
                        ) : chemical.updated_by ? (
                          <p><strong>Updated by:</strong> {chemical.updated_by}</p>
                        ) : null}
                      </div>
                    )}
                    
                    <div className={styles.cardActions}>
                      {canEditChemical && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChemical(chemical);
                          }}
                          className={styles.editBtn}
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteChemical && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChemical(chemical.id);
                          }}
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedChemical && (
          <div className={styles.detailSection}>
            <ChemicalDetail
              chemical={selectedChemical}
              formulations={formulations}
              user={user}
              onAddNote={handleAddChemicalNote}
              onEdit={() => setEditingChemical(selectedChemical)}
              onDelete={() => handleDeleteChemical(selectedChemical.id)}
              onCreateFormulation={() => setShowFormulationForm(true)}
              onEditFormulation={setEditingFormulation}
              onDeleteFormulation={handleDeleteFormulation}
              onAddFormulationNote={handleAddFormulationNote}
              canEdit={canEditChemical}
              canDelete={canDeleteChemical}
              canCreateFormulation={canCreateFormulation}
              canEditFormulation={canEditFormulation}
              canDeleteFormulation={canDeleteFormulation}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateForm && (
        <ChemicalForm
          onSubmit={handleCreateChemical}
          onCancel={() => setShowCreateForm(false)}
          title="Add New Chemical"
        />
      )}

      {editingChemical && (
        <ChemicalForm
          chemical={editingChemical}
          onSubmit={(data) => handleUpdateChemical(editingChemical.id, data)}
          onCancel={() => setEditingChemical(null)}
          title="Edit Chemical"
        />
      )}

      {showFormulationForm && selectedChemical && (
        <FormulationForm
          chemicalId={selectedChemical.id}
          onSubmit={handleCreateFormulation}
          onCancel={() => setShowFormulationForm(false)}
          title="Add Formulation Detail"
        />
      )}

      {editingFormulation && (
        <FormulationForm
          formulation={editingFormulation}
          onSubmit={(data) => handleUpdateFormulation(editingFormulation.id, data)}
          onCancel={() => setEditingFormulation(null)}
          title="Edit Formulation Detail"
        />
      )}
    </div>
  );
} 