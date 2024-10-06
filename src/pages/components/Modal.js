import React from 'react';
import './Modal.css'; // Add any necessary styles

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  const handleOverlayClick = (e) => {
    // If the click target is the overlay (not the modal content), close the modal
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-content">
          {children} {/* The content will be passed here */}
          <div className="modal-actions">
            <button className="modal-close-btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
