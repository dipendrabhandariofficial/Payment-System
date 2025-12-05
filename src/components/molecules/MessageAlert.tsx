import { AlertCircle, CheckCircle, X } from "lucide-react";

interface MessageAlertProps {
  type: string;
  message: string;
  onClose: () => void;
}

const MessageAlert = ({ type, message, onClose }: MessageAlertProps) => {
  if (!message) return null;

  const config = {
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-700",
      icon: CheckCircle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-700",
      icon: AlertCircle,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-700",
      icon: AlertCircle,
    },
  };

  const {
    bg,
    border,
    text,
    icon: Icon,
  } = config[type as keyof typeof config] || config.error;

  return (
    <div
      className={`mb-6 p-4 ${bg} border-l-4 ${border} ${text} rounded-lg flex items-center`}
    >
      <Icon className="w-5 h-5 mr-3 shrink-0" />
      <span className="text-sm font-medium flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MessageAlert;
