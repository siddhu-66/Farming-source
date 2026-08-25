export const formatSuccess = (message: string, data: any = {}) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const formatError = (message: string, errors: any[] = []) => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};
