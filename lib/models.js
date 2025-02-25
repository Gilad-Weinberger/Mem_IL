// this file is just for the planning - no model schemas are defined here

const User = {
  name: String,
  email: String,
  password: String,
  role: String(["user", "family", "admin"]),
  createdAt: Date,
  updatedAt: Date,
};

const Soldier = {
  name: String,
  darga: String,
  lifeStory: String,
  images: [String],
  birthDate: Date,
  deathDate: Date,
  createdAt: Date,
  updatedAt: Date,
};

const Comment = {
  user: User,
  soldier: Soldier,
  message: String,
  status: String(["pending", "approved", "rejected"]),
  createdAt: Date,
};
