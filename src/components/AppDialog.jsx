import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const variantStyles = {
  info: {
    icon: Info,
    iconClass: "bg-blue-500/10 text-blue-600",
    buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "bg-green-500/10 text-green-600",
    buttonClass: "bg-green-500 hover:bg-green-600 text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-orange-500/10 text-orange-600",
    buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  danger: {
    icon: XCircle,
    iconClass: "bg-red-500/10 text-red-600",
    buttonClass: "bg-red-500 hover:bg-red-600 text-white",
  },
};

export function useAppDialog() {
  const resolverRef = useRef(null);

  const [dialogState, setDialogState] = useState({
    open: false,
    type: "alert",
    variant: "info",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const closeDialog = (result) => {
    setDialogState((prev) => ({
      ...prev,
      open: false,
    }));

    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const alertDialog = ({
    title = "Notice",
    message = "",
    variant = "info",
    confirmText = "OK",
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = () => resolve(true);

      setDialogState({
        open: true,
        type: "alert",
        variant,
        title,
        message,
        confirmText,
        cancelText: "Cancel",
      });
    });
  };

  const confirmDialog = ({
    title = "Are you sure?",
    message = "",
    variant = "warning",
    confirmText = "Confirm",
    cancelText = "Cancel",
  }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;

      setDialogState({
        open: true,
        type: "confirm",
        variant,
        title,
        message,
        confirmText,
        cancelText,
      });
    });
  };

  const styles = variantStyles[dialogState.variant] || variantStyles.info;
  const Icon = styles.icon;

  const dialog =
    dialogState.open &&
    createPortal(
      <div className="fixed inset-0 z-9999 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md rounded-4xl p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconClass}`}
              >
                <Icon size={24} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {dialogState.title}
                </h2>
                {dialogState.message && (
                  <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed">
                    {dialogState.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => closeDialog(false)}
              className="w-9 h-9 rounded-2xl bg-white/60 text-slate-700 flex items-center justify-center hover:bg-white/80 transition shrink-0"
            >
              <X size={17} />
            </button>
          </div>

          <div
            className={`grid gap-3 ${
              dialogState.type === "confirm"
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {dialogState.type === "confirm" && (
              <button
                onClick={() => closeDialog(false)}
                className="btn-secondary"
              >
                {dialogState.cancelText}
              </button>
            )}

            <button
              onClick={() => closeDialog(true)}
              className={`rounded-2xl px-5 py-3 font-bold transition ${styles.buttonClass}`}
            >
              {dialogState.confirmText}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return {
    dialog,
    alertDialog,
    confirmDialog,
  };
}