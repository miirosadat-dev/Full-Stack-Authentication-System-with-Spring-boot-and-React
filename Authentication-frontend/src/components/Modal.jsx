import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// A pop-up window. It:
//  - closes with the Escape key, the X button, or a click outside
//  - stops the page behind it from scrolling
//  - keeps the keyboard (Tab) inside the pop-up, and gives focus back when it closes
//  - tells screen readers it is a dialog (pass label="..." to name it)
const Modal = ({ isModalOpen, setIsModalOpen, label = "Dialog", children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Put the cursor in the first field (or first button), unless a field already has it
    if (!dialog.contains(document.activeElement)) {
      const first =
        dialog.querySelector("input, textarea, select") ??
        dialog.querySelector(FOCUSABLE) ??
        dialog;
      first.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [isModalOpen, setIsModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div
        className="flex min-h-full items-center justify-center p-4"
        onMouseDown={(e) => {
          // Only a click on the dark area closes it, not a drag that ends there
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl outline-none sm:p-8"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
            onClick={() => setIsModalOpen(false)}
          >
            &times;
          </button>

          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;