const validateEmailDomain = (email) => {
  const regex = /^[^\s@]+@(iiitdwd\.ac\.in|iiitdharwad\.ac\.in)$/;
  return typeof email === 'string' && regex.test(email.toLowerCase().trim());
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (!email || !validateEmailDomain(email)) {
    return res.status(400).json({
      message: 'Invalid email. Must be an official @iiitdharwad.ac.in email address'
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long'
    });
  }

  // Force role to student if provided or ignore request body role
  delete req.body.role;

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ message: 'Password is required' });
  }

  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(400).json({ message: 'Current password is required' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({
      message: 'New password must be at least 6 characters long'
    });
  }

  next();
};

const validateMenu = (req, res, next) => {
  const { mess, date, meals } = req.body;

  if (!mess || !['mess1', 'mess2'].includes(mess)) {
    return res.status(400).json({ message: 'Valid mess (mess1 or mess2) is required' });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Date is required in YYYY-MM-DD format' });
  }

  if (!Array.isArray(meals) || meals.length === 0) {
    return res.status(400).json({ message: 'Meals array is required' });
  }

  const validTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
  for (const meal of meals) {
    if (!meal.type || !validTypes.includes(meal.type)) {
      return res.status(400).json({
        message: `Invalid meal type. Allowed: ${validTypes.join(', ')}`
      });
    }
    if (!Array.isArray(meal.items)) {
      return res.status(400).json({ message: `Items for ${meal.type} must be an array of strings` });
    }
  }

  next();
};

const validateSurplus = (req, res, next) => {
  const { mess, date, mealType, headcountExpected, headcountServed, surplusQuantityKg } = req.body;

  if (!mess || !['mess1', 'mess2'].includes(mess)) {
    return res.status(400).json({ message: 'Valid mess (mess1 or mess2) is required' });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Date is required in YYYY-MM-DD format' });
  }

  const validTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
  if (!mealType || !validTypes.includes(mealType)) {
    return res.status(400).json({ message: `mealType must be one of ${validTypes.join(', ')}` });
  }

  if (typeof headcountExpected !== 'number' || headcountExpected < 0) {
    return res.status(400).json({ message: 'headcountExpected must be a non-negative number' });
  }

  if (typeof headcountServed !== 'number' || headcountServed < 0) {
    return res.status(400).json({ message: 'headcountServed must be a non-negative number' });
  }

  if (typeof surplusQuantityKg !== 'number' || surplusQuantityKg < 0) {
    return res.status(400).json({ message: 'surplusQuantityKg must be a non-negative number' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateMenu,
  validateSurplus
};

