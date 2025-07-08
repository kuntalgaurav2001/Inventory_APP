import React, { useState, useEffect } from 'react';
import { fetchChemicalPurchaseHistory } from '../api/accountTransactions';
import styles from './ChemicalDetail.module.scss';

export default function ChemicalDetail({
  chemical,
  formulations,
  user,
  onAddNote,
  onEdit,
  onDelete,
  onCreateFormulation,
  onEditFormulation,
  onDeleteFormulation,
  onAddFormulationNote,
  canEdit,
  canDelete,
  canCreateFormulation,
  canEditFormulation,
  canDeleteFormulation
}) {
  const [newNote, setNewNote] = useState('');
  const [newFormulationNote, setNewFormulationNote] = useState({});
  const [purchaseHistory, setPurchaseHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadPurchaseHistory();
  }, [chemical.id]);

  const loadPurchaseHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await fetchChemicalPurchaseHistory(chemical.id);
      setPurchaseHistory(history);
    } catch (err) {
      console.error('Error loading purchase history:', err);
      setPurchaseHistory({
        chemical_id: chemical.id,
        total_purchased: 0,
        total_spent: 0,
        last_purchase_date: null,
        average_unit_price: 0,
        currency: "INR"
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(chemical.id, newNote);
      setNewNote('');
    }
  };

  const handleAddFormulationNote = (formulationId, e) => {
    e.preventDefault();
    const note = newFormulationNote[formulationId];
    if (note && note.trim()) {
      onAddFormulationNote(formulationId, note);
      setNewFormulationNote(prev => ({ ...prev, [formulationId]: '' }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{chemical.name}</h3>
        <div className={styles.actions}>
          {canEdit && (
            <button onClick={onEdit} className={styles.editBtn}>
              Edit Chemical
            </button>
          )}
          {canDelete && (
            <button onClick={onDelete} className={styles.deleteBtn}>
              Delete Chemical
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.infoSection}>
          <h4>Chemical Information</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Quantity:</label>
              <span>{chemical.quantity} {chemical.unit}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Last Updated:</label>
              <span>{new Date(chemical.last_updated).toLocaleString()}</span>
            </div>
            {chemical.updated_by_user ? (
              <div className={styles.infoItem}>
                <label>Updated by:</label>
                <span>{chemical.updated_by_user.first_name} {chemical.updated_by_user.last_name || ''} ({chemical.updated_by_user.role.replace('_', ' ').toUpperCase()})</span>
              </div>
            ) : chemical.updated_by ? (
              <div className={styles.infoItem}>
                <label>Updated by:</label>
                <span>{chemical.updated_by}</span>
              </div>
            ) : null}
          </div>

          {chemical.formulation && (
            <div className={styles.formulationSection}>
              <h5>Formulation:</h5>
              <div className={styles.formulationText}>
                {chemical.formulation}
              </div>
            </div>
          )}

          <div className={styles.notesSection}>
            <h5>Notes:</h5>
            {chemical.notes ? (
              <div className={styles.notesText}>
                {chemical.notes.split('\n').map((note, index) => (
                  <div key={index} className={styles.noteLine}>
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noNotes}>No notes available</p>
            )}

            <form onSubmit={handleAddNote} className={styles.addNoteForm}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className={styles.noteInput}
                rows={3}
              />
              <button type="submit" className={styles.addNoteBtn}>
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Purchase History Section */}
        <div className={styles.purchaseHistorySection}>
          <h4>Purchase History</h4>
          {loadingHistory ? (
            <div className={styles.loadingHistory}>Loading purchase history...</div>
          ) : purchaseHistory ? (
            <div className={styles.purchaseHistoryGrid}>
              <div className={styles.purchaseHistoryItem}>
                <label>Total Purchased:</label>
                <span>{purchaseHistory.total_purchased} {chemical.unit}</span>
              </div>
              <div className={styles.purchaseHistoryItem}>
                <label>Total Spent:</label>
                <span>{formatCurrency(purchaseHistory.total_spent, purchaseHistory.currency)}</span>
              </div>
              <div className={styles.purchaseHistoryItem}>
                <label>Average Unit Price:</label>
                <span>{formatCurrency(purchaseHistory.average_unit_price, purchaseHistory.currency)}/{chemical.unit}</span>
              </div>
              <div className={styles.purchaseHistoryItem}>
                <label>Last Purchase Date:</label>
                <span>
                  {purchaseHistory.last_purchase_date 
                    ? new Date(purchaseHistory.last_purchase_date).toLocaleDateString()
                    : 'No purchases yet'
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.noPurchaseHistory}>
              <p>No purchase history available for this chemical.</p>
            </div>
          )}
        </div>

        <div className={styles.formulationsSection}>
          <div className={styles.formulationsHeader}>
            <h4>Formulation Details ({formulations.length})</h4>
            {canCreateFormulation && (
              <button onClick={onCreateFormulation} className={styles.addFormulationBtn}>
                Add Formulation Detail
              </button>
            )}
          </div>

          {formulations.length > 0 ? (
            <div className={styles.formulationsList}>
              {formulations.map(formulation => (
                <div key={formulation.id} className={styles.formulationCard}>
                  <div className={styles.formulationHeader}>
                    <h5>{formulation.component_name}</h5>
                    <div className={styles.formulationActions}>
                      {canEditFormulation && (
                        <button 
                          onClick={() => onEditFormulation(formulation)}
                          className={styles.editFormulationBtn}
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteFormulation && (
                        <button 
                          onClick={() => onDeleteFormulation(formulation.id)}
                          className={styles.deleteFormulationBtn}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.formulationInfo}>
                    <div className={styles.formulationGrid}>
                      <div className={styles.formulationItem}>
                        <label>Amount:</label>
                        <span>{formulation.amount} {formulation.unit}</span>
                      </div>
                      <div className={styles.formulationItem}>
                        <label>Available Quantity:</label>
                        <span>{formulation.available_quantity} {formulation.unit}</span>
                      </div>
                      <div className={styles.formulationItem}>
                        <label>Required Quantity:</label>
                        <span>{formulation.required_quantity} {formulation.unit}</span>
                      </div>
                      <div className={styles.formulationItem}>
                        <label>Last Updated:</label>
                        <span>{new Date(formulation.last_updated).toLocaleString()}</span>
                      </div>
                      {formulation.updated_by_user ? (
                        <div className={styles.formulationItem}>
                          <label>Updated by:</label>
                          <span>{formulation.updated_by_user.first_name} {formulation.updated_by_user.last_name || ''} ({formulation.updated_by_user.role.replace('_', ' ').toUpperCase()})</span>
                        </div>
                      ) : formulation.updated_by ? (
                        <div className={styles.formulationItem}>
                          <label>Updated by:</label>
                          <span>{formulation.updated_by}</span>
                        </div>
                      ) : null}
                    </div>

                    {formulation.notes && (
                      <div className={styles.formulationNotes}>
                        <h6>Notes:</h6>
                        <div className={styles.formulationNotesText}>
                          {formulation.notes.split('\n').map((note, index) => (
                            <div key={index} className={styles.noteLine}>
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <form 
                      onSubmit={(e) => handleAddFormulationNote(formulation.id, e)} 
                      className={styles.addFormulationNoteForm}
                    >
                      <textarea
                        value={newFormulationNote[formulation.id] || ''}
                        onChange={(e) => setNewFormulationNote(prev => ({
                          ...prev,
                          [formulation.id]: e.target.value
                        }))}
                        placeholder="Add a note to this formulation..."
                        className={styles.formulationNoteInput}
                        rows={2}
                      />
                      <button type="submit" className={styles.addFormulationNoteBtn}>
                        Add Note
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noFormulations}>
              <p>No formulation details available for this chemical.</p>
              {canCreateFormulation && (
                <button onClick={onCreateFormulation} className={styles.addFirstFormulationBtn}>
                  Add First Formulation Detail
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 