const mongoose = require("mongoose");

// Model tanımı
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

// --- Seed kısmı ---
const roles = [
  { email: "admin@example.com", type: "Admin" },
  { email: "mod@example.com", type: "Moderator" },
  { email: "user@example.com", type: "User" },
];

// MongoDB bağlantısı
mongoose.connect("mongodb://localhost:27017/your-db-name", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("MongoDB connected");

  // Var olan verileri temizle ve yeni rolleri ekle
  await Admin.deleteMany({});
  await Admin.insertMany(roles);

  console.log("Roles successfully seeded");
  mongoose.disconnect();
})
.catch(err => console.log(err));

module.exports = Admin;
