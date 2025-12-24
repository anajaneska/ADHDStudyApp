import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function ModalPortal({ children, onClose }) {
  const modalRoot = document.getElementById("modal-root");

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      />

      {/* Modal wrapper */}
      <div
        className="modal show d-block"
        tabIndex="-1"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg p-4">
            {children}
          </div>
        </div>
      </div>
    </>,
    modalRoot
  );
}
