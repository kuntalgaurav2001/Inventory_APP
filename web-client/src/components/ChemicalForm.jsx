import React, { useState, useEffect } from 'react';
import styles from './ChemicalForm.module.scss';
import { FlaskConical, Hash, Boxes, Bell, MapPin, User, FileText, Truck, ClipboardList } from 'lucide-react';

export default function ChemicalForm({ chemical, onSubmit, onCancel, title }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: '',
    formulation: '',
    notes: '',
    alert_threshold: '',
    supplier: '',
    location: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (chemical) {
      setFormData({
        name: chemical.name || '',
        quantity: chemical.quantity || 0,
        unit: chemical.unit || '',
        formulation: chemical.formulation || '',
        notes: chemical.notes || '',
        alert_threshold: chemical.alert_threshold || '',
        supplier: chemical.supplier || '',
        location: chemical.location || ''
      });
    }
  }, [chemical]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Chemical name is required';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be non-negative';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (formData.alert_threshold !== '' && formData.alert_threshold < 0) {
      newErrors.alert_threshold = 'Alert threshold must be non-negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert quantity and alert_threshold to numbers, handle empty alert_threshold
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        alert_threshold: formData.alert_threshold === '' ? null : parseFloat(formData.alert_threshold)
      };
      console.log('Submitting chemical data:', submitData);
      onSubmit(submitData);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button onClick={onCancel} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.sectionHeading}><FlaskConical size={18}/> Basic Info</div>
          <div className={styles.formGroup}>
            <label htmlFor="name">Chemical Name *</label>
            <div className={styles.inputIconGroup}>
              <FlaskConical className={styles.inputIcon} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? styles.error + ' ' + styles.inputWithIcon : styles.inputWithIcon}
                placeholder="Enter chemical name"
              />
            </div>
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.sectionHeading}><Boxes size={18}/> Stock & Alerts</div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Quantity *</label>
              <div className={styles.inputIconGroup}>
                <Boxes className={styles.inputIcon} />
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={errors.quantity ? styles.error + ' ' + styles.inputWithIcon : styles.inputWithIcon}
                  placeholder="0.00"
                />
              </div>
              {errors.quantity && <span className={styles.errorText}>{errors.quantity}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="unit">Unit *</label>
              <div className={styles.inputIconGroup}>
                <Hash className={styles.inputIcon} />
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={errors.unit ? styles.error + ' ' + styles.inputWithIcon : styles.inputWithIcon}
                >
                  <option value="">Select unit</option>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="mg">Milligrams (mg)</option>
                  <option value="L">Liters (L)</option>
                  <option value="mL">Milliliters (mL)</option>
                  <option value="mol">Moles (mol)</option>
                  <option value="mmol">Millimoles (mmol)</option>
                  <option value="pieces">Pieces</option>
                  <option value="bottles">Bottles</option>
                  <option value="vials">Vials</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {errors.unit && <span className={styles.errorText}>{errors.unit}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="alert_threshold">Alert Threshold</label>
              <div className={styles.inputIconGroup}>
                <Bell className={styles.inputIcon} />
                <input
                  type="number"
                  id="alert_threshold"
                  name="alert_threshold"
                  value={formData.alert_threshold}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={errors.alert_threshold ? styles.error + ' ' + styles.inputWithIcon : styles.inputWithIcon}
                  placeholder="Enter threshold value"
                />
              </div>
              <small>Quantity at which low stock alerts are triggered (leave empty for no alerts)</small>
              {errors.alert_threshold && <span className={styles.errorText}>{errors.alert_threshold}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Storage Location</label>
              <div className={styles.inputIconGroup}>
                <MapPin className={styles.inputIcon} />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.inputWithIcon}
                  placeholder="e.g., Lab A, Shelf 3"
                />
              </div>
            </div>
          </div>

          <div className={styles.sectionHeading}><Truck size={18}/> Supplier Info</div>
          <div className={styles.formGroup}>
            <label htmlFor="supplier">Supplier</label>
            <div className={styles.inputIconGroup}>
              <Truck className={styles.inputIcon} />
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={styles.inputWithIcon}
                placeholder="Enter supplier name"
              />
            </div>
          </div>

          <div className={styles.sectionHeading}><ClipboardList size={18}/> Formulation & Notes</div>
          <div className={styles.formGroup}>
            <label htmlFor="formulation">Formulation</label>
            <textarea
              id="formulation"
              name="formulation"
              value={formData.formulation}
              onChange={handleChange}
              rows={4}
              placeholder="Enter formulation details..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Enter any additional notes..."
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              <FlaskConical size={18}/> {chemical ? 'Update Chemical' : 'Create Chemical'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 