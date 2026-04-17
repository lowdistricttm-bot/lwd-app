import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (error: any) => {
  // Estrae il messaggio se l'input è un oggetto di errore, altrimenti usa il valore come stringa
  const message = typeof error === 'string' 
    ? error 
    : error?.message || error?.error_description || "Si è verificato un errore imprevisto";
    
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};