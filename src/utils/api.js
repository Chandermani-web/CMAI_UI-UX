const api = (path, options = {}) => {
  const isFormData = options?.body instanceof FormData;

  return fetch(`${import.meta.env.VITE_BACKEND_URL}${path}`, {
    ...options,
    body: isFormData || !options?.body
      ? options?.body
      : JSON.stringify(options.body),
    credentials: 'include',
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(options?.headers || {}),
    },
  });
};

export default api;