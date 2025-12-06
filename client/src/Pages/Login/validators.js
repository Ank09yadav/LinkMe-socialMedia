export const validatePassword = (password) => {
  const passwordformat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-]).{8,}$/;
  return passwordformat.test(password);
};

export const validateEmail = (email) => {
  const emailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailformat.test(email);
};
export const validateUsername = (username) => {
  const usernameformat = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameformat.test(username);
}