import { useEffect, useRef } from 'react';

const ConfirmModal = ({
  show,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    // Initialize Bootstrap modal
    import('bootstrap').then(({ Modal }) => {
      bsModalRef.current = Modal.getOrCreateInstance(el);
    });
  }, []);

  useEffect(() => {
    const modal = bsModalRef.current;
    if (!modal) return;
    if (show) {
      modal.show();
    } else {
      modal.hide();
    }
  }, [show]);

  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex="-1"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              disabled={loading}
            />
          </div>
          <div className="modal-body">
            <p style={{ margin: 0, fontSize: 15 }}>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn btn-${confirmVariant}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="d-flex align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm" />
                  Processing...
                </span>
              ) : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;