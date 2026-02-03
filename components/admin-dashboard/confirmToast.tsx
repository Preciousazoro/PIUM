import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ConfirmToastOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  confirmButtonVariant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost';
}

export function confirmToast({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmButtonVariant = 'default'
}: ConfirmToastOptions) {
  return new Promise<void>((resolve) => {
    const toastId = toast('', {
      duration: Infinity,
      className: 'p-0',
      action: (
        <div className="flex w-full gap-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.dismiss(toastId);
              resolve();
            }}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            size="sm"
            onClick={async () => {
              // Show loading state
              toast.loading('Processing...', { id: toastId });
              
              try {
                await onConfirm();
                toast.success('Action completed successfully', { id: toastId });
              } catch (error) {
                console.error('Action failed:', error);
                toast.error('Action failed. Please try again.', { id: toastId });
              }
              resolve();
            }}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      ),
      description: (
        <div className="p-4 pb-0">
          <div className="font-semibold text-foreground">{title}</div>
          {message && (
            <div className="text-sm text-muted-foreground mt-1">{message}</div>
          )}
        </div>
      ),
    });
  });
}
