import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { transformErrorMessage, getNotificationType } from "@/lib/notifications"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Transform technical errors into user-friendly messages
        let displayTitle = title;
        let displayDescription = description;
        
        const titleStr = typeof title === 'string' ? title : '';
        const descStr = typeof description === 'string' ? description : '';
        
        if (titleStr && (titleStr.includes('Error') || titleStr.includes('token') || titleStr.includes('JSON'))) {
          const transformed = transformErrorMessage(titleStr);
          displayTitle = transformed.title;
          displayDescription = transformed.description;
        }
        
        if (descStr && (descStr.includes('token') || descStr.includes('JSON') || descStr.includes('DOCTYPE'))) {
          const transformed = transformErrorMessage(descStr);
          displayTitle = displayTitle || transformed.title;
          displayDescription = transformed.description;
        }

        const notificationType = getNotificationType(typeof displayTitle === 'string' ? displayTitle : '');
        
        const getIcon = () => {
          switch (notificationType) {
            case 'success':
              return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'error':
              return <XCircle className="h-5 w-5 text-red-600" />;
            case 'warning':
              return <AlertTriangle className="h-5 w-5 text-amber-600" />;
            default:
              return <Info className="h-5 w-5 text-blue-600" />;
          }
        };

        const getBorderColor = () => {
          switch (notificationType) {
            case 'success':
              return 'border-l-green-500 bg-green-50';
            case 'error':
              return 'border-l-red-500 bg-red-50';
            case 'warning':
              return 'border-l-amber-500 bg-amber-50';
            default:
              return 'border-l-blue-500 bg-blue-50';
          }
        };

        return (
          <Toast key={id} {...props} className={`border-l-4 ${getBorderColor()} shadow-lg rounded-lg border-0`}>
            <div className="flex items-start gap-3 p-1">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="grid gap-1 flex-1">
                {displayTitle && (
                  <ToastTitle className="text-sm font-semibold text-gray-900">
                    {displayTitle}
                  </ToastTitle>
                )}
                {displayDescription && (
                  <ToastDescription className="text-sm text-gray-700">
                    {displayDescription}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="text-gray-500 hover:text-gray-700" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
