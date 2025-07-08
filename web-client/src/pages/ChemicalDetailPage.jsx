import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchChemical, updateChemical, deleteChemical, addChemicalNote } from '../api/chemicals';
import { fetchFormulations, createFormulation, updateFormulation, deleteFormulation, addFormulationNote } from '../api/chemicals';
import { fetchChemicalPurchaseHistory } from '../api/accountTransactions';
import ChemicalDetail from '../components/ChemicalDetail';
import styles from './ChemicalDetailPage.module.scss';

export default function ChemicalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userInfo } = useAuth();
  const [chemical, setChemical] = useState(null);
  const [formulations, setFormulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateFormulationForm, setShowCreateFormulationForm] = useState(false);
  const [showEditFormulationForm, setShowEditFormulationForm] = useState(false);
  const [editingFormulation, setEditingFormulation] = useState(null);

  useEffect(() => {
    loadChemicalData();
  }, [id]);

  const loadChemicalData = async () => {
    try {
      setLoading(true);
      const [chemicalData, formulationsData] = await Promise.all([
        fetchChemical(id),
        fetchFormulations(id)
      ]);
      setChemical(chemicalData);
      setFormulations(formulationsData);
      setError('');
    } catch (err) {
      console.error('Error loading chemical data:', err);
      setError(err.message || 'Failed to load chemical data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (chemicalId, note) => {
    try {
      await addChemicalNote(chemicalId, note);
      await loadChemicalData();
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err.message || 'Failed to add note');
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this chemical?')) {
      return;
    }
    
    try {
      await deleteChemical(id);
      navigate('/chemicals');
    } catch (err) {
      console.error('Error deleting chemical:', err);
      setError(err.message || 'Failed to delete chemical');
    }
  };

  const handleCreateFormulation = () => {
    setShowCreateFormulationForm(true);
  };

  const handleEditFormulation = (formulation) => {
    setEditingFormulation(formulation);
    setShowEditFormulationForm(true);
  };

  const handleDeleteFormulation = async (formulationId) => {
    if (!window.confirm('Are you sure you want to delete this formulation detail?')) {
      return;
    }
    
    try {
      await deleteFormulation(formulationId);
      await loadChemicalData();
    } catch (err) {
      console.error('Error deleting formulation:', err);
      setError(err.message || 'Failed to delete formulation');
    }
  };

  const handleAddFormulationNote = async (formulationId, note) => {
    try {
      await addFormulationNote(formulationId, note);
      await loadChemicalData();
    } catch (err) {
      console.error('Error adding formulation note:', err);
      setError(err.message || 'Failed to add formulation note');
    }
  };

  // Permission checks
  const canEdit = userInfo?.role === 'admin' || userInfo?.role === 'product';
  const canDelete = userInfo?.role === 'admin';
  const canCreateFormulation = userInfo?.role === 'admin' || userInfo?.role === 'product';
  const canEditFormulation = userInfo?.role === 'admin' || userInfo?.role === 'product';
  const canDeleteFormulation = userInfo?.role === 'admin';

  if (loading) {
    return <div className={styles.loading}>Loading chemical details...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!chemical) {
    return <div className={styles.error}>Chemical not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/chemicals')} className={styles.backBtn}>
          ← Back to Chemicals
        </button>
        <h1>Chemical Details</h1>
      </div>

      <ChemicalDetail
        chemical={chemical}
        formulations={formulations}
        user={user}
        onAddNote={handleAddNote}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateFormulation={handleCreateFormulation}
        onEditFormulation={handleEditFormulation}
        onDeleteFormulation={handleDeleteFormulation}
        onAddFormulationNote={handleAddFormulationNote}
        canEdit={canEdit}
        canDelete={canDelete}
        canCreateFormulation={canCreateFormulation}
        canEditFormulation={canEditFormulation}
        canDeleteFormulation={canDeleteFormulation}
      />
    </div>
  );
} 