import {
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Trash2,
  X
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

const ConfirmContext = createContext(null);

const icons = {
  danger: Trash2,
  warning: AlertTriangle,
  success: CheckCircle2,
  logout: LogOut
};

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const closeDialog = useCallback((result) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setDialog(null);
  }, []);

  const confirmAction = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: "Confirm action",
        message: "Are you sure you want to continue?",
        confirmText: "Confirm",
        cancelText: "Cancel",
        tone: "warning",
        ...options
      });
    });
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDialog(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog, closeDialog]);

  const value = useMemo(() => ({ confirmAction }), [confirmAction]);
  const Icon = dialog ? icons[dialog.tone] || AlertTriangle : null;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog(false);
          }}
        >
          <section
            className={`confirm-dialog tone-${dialog.tone}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <button
              className="icon-button compact modal-close"
              type="button"
              onClick={() => closeDialog(false)}
              aria-label="Close confirmation"
              title="Close confirmation"
            >
              <X size={16} />
            </button>

            <div className="confirm-icon">{Icon ? <Icon size={24} /> : null}</div>
            <div>
              <h2 id="confirm-title">{dialog.title}</h2>
              <p>{dialog.message}</p>
              {dialog.detail ? <span>{dialog.detail}</span> : null}
            </div>

            <div className="confirm-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => closeDialog(false)}
              >
                {dialog.cancelText}
              </button>
              <button
                className={`button ${dialog.tone === "danger" ? "danger solid" : "primary"}`}
                type="button"
                onClick={() => closeDialog(true)}
              >
                {dialog.confirmText}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside ConfirmProvider");
  }
  return context;
}
