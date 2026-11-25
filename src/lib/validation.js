
export function validateRegister(data) {
  const { username, display_name, email, password } = data;

  if (!username || !display_name || !email || !password) {
    return "Semua kolom wajib diisi.";
  }

  if (username.length < 3) {
    return "Username minimal 3 karakter.";
  }

  if (display_name.length < 2) {
    return "Nama tampilan minimal 2 karakter.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Format email tidak valid.";
  }

  if (password.length < 8) {
    return "Password minimal 8 karakter.";
  }

  return null;
}

export function validateLogin(data) {
  const { email, password } = data;

  if (!email || !password) {
    return "Email dan password wajib diisi.";
  }

  return null;
}
