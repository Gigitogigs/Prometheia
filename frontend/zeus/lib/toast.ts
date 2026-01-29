//  toast wrapper.
import { toast as rawToast } from "sonner";

export const toast = {
  success: (message: string, description?: string) =>
    rawToast.success(message, { description }),
    
  error: (message: string, description?: string) =>
    rawToast.error(message, { description }),
    
  info: (message: string, description?: string) =>
    rawToast.info(message, { description }),
    
  loading: (message: string) => 
    rawToast.loading(message),

  dismiss: () => rawToast.dismiss(),
};