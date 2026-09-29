import bcrypt from 'bcryptjs';

// In-memory data store used when standalone MongoDB is not connected
export const memoryStore = {
  users: [],
  posts: [],
  comments: [],
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export const memoryAuth = {
  async findUserByEmail(email) {
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    return memoryStore.users.find(u => u._id.toString() === id.toString()) || null;
  },

  async createUser({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    memoryStore.users.push(user);
    return user;
  }
};
