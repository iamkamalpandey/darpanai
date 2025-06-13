// User-friendly notification messages
export const NotificationMessages = {
  // Authentication messages
  AUTH_SUCCESS: {
    title: "Welcome",
    description: "You have been successfully signed in."
  },
  AUTH_FAILED: {
    title: "Sign In Failed",
    description: "Please check your credentials and try again."
  },
  LOGOUT_SUCCESS: {
    title: "Signed Out",
    description: "You have been successfully signed out."
  },
  REGISTRATION_SUCCESS: {
    title: "Account Created",
    description: "Your account has been created successfully."
  },
  REGISTRATION_FAILED: {
    title: "Registration Failed",
    description: "Unable to create your account. Please try again."
  },

  // File upload messages
  UPLOAD_SUCCESS: {
    title: "Document Uploaded",
    description: "Your document has been uploaded successfully."
  },
  UPLOAD_FAILED: {
    title: "Upload Failed",
    description: "Unable to upload your document. Please try again."
  },
  INVALID_FILE: {
    title: "Invalid File",
    description: "Please upload a valid PDF, JPG, or PNG file."
  },
  FILE_TOO_LARGE: {
    title: "File Too Large",
    description: "Please select a file smaller than 10MB."
  },

  // Analysis messages
  ANALYSIS_SUCCESS: {
    title: "Analysis Complete",
    description: "Your document has been analyzed successfully."
  },
  ANALYSIS_FAILED: {
    title: "Analysis Failed",
    description: "Unable to analyze your document. Please try again."
  },
  ANALYSIS_LIMIT_REACHED: {
    title: "Analysis Limit Reached",
    description: "You have reached your monthly analysis limit."
  },

  // Admin messages
  USER_UPDATED: {
    title: "User Updated",
    description: "User information has been updated successfully."
  },
  USER_UPDATE_FAILED: {
    title: "Update Failed",
    description: "Unable to update user information."
  },
  EXPORT_SUCCESS: {
    title: "Export Complete",
    description: "Your data has been exported successfully."
  },
  EXPORT_FAILED: {
    title: "Export Failed",
    description: "Unable to export data. Please try again."
  },

  // General messages
  SAVE_SUCCESS: {
    title: "Saved",
    description: "Your changes have been saved successfully."
  },
  SAVE_FAILED: {
    title: "Save Failed",
    description: "Unable to save your changes. Please try again."
  },
  NETWORK_ERROR: {
    title: "Connection Issue",
    description: "Please check your internet connection and try again."
  },
  UNAUTHORIZED: {
    title: "Access Denied",
    description: "You don't have permission to perform this action."
  },
  SERVER_ERROR: {
    title: "Service Unavailable",
    description: "Our servers are temporarily unavailable. Please try again later."
  },
  VALIDATION_ERROR: {
    title: "Invalid Information",
    description: "Please check your information and try again."
  }
};

// Transform technical errors into user-friendly messages
export function transformErrorMessage(error: string | Error): { title: string; description: string } {
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  const lowerError = errorMessage.toLowerCase();

  // JSON/Parse errors
  if (lowerError.includes('json') || lowerError.includes('parse') || lowerError.includes('token')) {
    return NotificationMessages.VALIDATION_ERROR;
  }

  // Network/fetch errors
  if (lowerError.includes('fetch') || lowerError.includes('network') || lowerError.includes('connection')) {
    return NotificationMessages.NETWORK_ERROR;
  }

  // Authentication errors
  if (lowerError.includes('unauthorized') || lowerError.includes('401') || lowerError.includes('authentication')) {
    return NotificationMessages.UNAUTHORIZED;
  }

  // Server errors
  if (lowerError.includes('500') || lowerError.includes('server') || lowerError.includes('internal')) {
    return NotificationMessages.SERVER_ERROR;
  }

  // File upload errors
  if (lowerError.includes('file') || lowerError.includes('upload')) {
    if (lowerError.includes('size') || lowerError.includes('large')) {
      return NotificationMessages.FILE_TOO_LARGE;
    }
    if (lowerError.includes('type') || lowerError.includes('format')) {
      return NotificationMessages.INVALID_FILE;
    }
    return NotificationMessages.UPLOAD_FAILED;
  }

  // Analysis errors
  if (lowerError.includes('analysis') || lowerError.includes('analyze')) {
    if (lowerError.includes('limit')) {
      return NotificationMessages.ANALYSIS_LIMIT_REACHED;
    }
    return NotificationMessages.ANALYSIS_FAILED;
  }

  // Default fallback
  return {
    title: "Something went wrong",
    description: "Please try again or contact support if the problem persists."
  };
}

// Notification types for styling
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export function getNotificationType(title: string): NotificationType {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('success') || lowerTitle.includes('complete') || lowerTitle.includes('saved') || lowerTitle.includes('welcome')) {
    return 'success';
  }
  
  if (lowerTitle.includes('failed') || lowerTitle.includes('error') || lowerTitle.includes('denied') || lowerTitle.includes('unavailable')) {
    return 'error';
  }
  
  if (lowerTitle.includes('limit') || lowerTitle.includes('warning') || lowerTitle.includes('invalid')) {
    return 'warning';
  }
  
  return 'info';
}