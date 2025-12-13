export const getErrorMessage = (error, fallback = '發生錯誤，請稍後再試') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.data?.message) return error.data.message;
  return fallback;
};

export const isUnauthorized = (error) => error?.status === 401 || error?.status === 403;
