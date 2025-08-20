const mongoose = require("mongoose");
const slugify = require("slugify");

// ---------------------- MODELS ----------------------

// Admin Model
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Admin = mongoose.model("Admin", adminSchema);

// Announcement Model
const announcementSchema = new mongoose.Schema({
  title: String,
  contents: Object,
  uploadDate: { type: Date, default: Date.now },
  uploader: String,
  link: String,
  isActive: { type: Boolean, default: true },
});
const Announcement = mongoose.model("Announcement", announcementSchema);

// Genre Model
const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});
const Genre = mongoose.model("Genre", genreSchema);

// Manga Model
const mangaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  author: String,
  artist: String,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
  summary: String,
  coverImage: String,
  uploadDate: Date,
  uploader: String,
  type: { type: String, default: "manga" },
  slug: { type: String, default: function () { return slugify(this.name.replace(/\./g, "-"), { lower: true, strict: true }); }},
  isActive: { type: Boolean, default: true },
  isAdult: { type: Boolean, default: false },
  status: { type: String, enum: ["ongoing", "completed", "dropped", "hiatus", "güncel"], default: "ongoing" },
  otherNames: { type: [String], default: [] },
  releaseYear: { type: Number, min: 1900, max: new Date().getFullYear() + 10 },
  discordRoleId: { type: String, default: null },
});
mangaSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) this.slug = slugify(this.name.replace(/\./g, "-"), { lower: true, strict: true });
  next();
});
mangaSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) update.slug = slugify(update.name.replace(/\./g, "-"), { lower: true, strict: true });
  next();
});
const Manga = mongoose.model("Manga", mangaSchema);

// Chapter Model
const chapterSchema = new mongoose.Schema({
  manga: { type: mongoose.Schema.Types.ObjectId, ref: "Manga" },
  chapterNumber: Number,
  title: String,
  content: [{ type: String }],
  uploadDate: { type: Date, default: Date.now },
  uploader: String,
  novelContent: Object,
  publishDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isAdult: { type: Boolean, default: false },
  chapterType: { type: String, enum: ["manga", "novel", "webtoon"], default: "manga" },
  slug: { type: String, default: function () { return slugify(this.title.replace(/\./g, "-"), { lower: true, strict: true }); }},
});
chapterSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) this.slug = slugify(this.title.replace(/\./g, "-"), { lower: true, strict: true });
  next();
});
chapterSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.title) update.slug = slugify(update.title.replace(/\./g, "-"), { lower: true, strict: true });
  next();
});
chapterSchema.index({ manga: 1, title: 1 }, { unique: true });
const Chapter = mongoose.model("Chapter", chapterSchema);

// Subscriber Model
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userId: String,
  expireAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// ---------------------- SEED DATA ----------------------
const seedData = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/your-db-name", { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected");

    // Admins
    await Admin.deleteMany({});
    await Admin.insertMany([
      { email: "admin@example.com", type: "Admin" },
      { email: "mod@example.com", type: "Moderator" },
      { email: "user@example.com", type: "User" },
    ]);

    // Genres
    await Genre.deleteMany({});
    const genres = await Genre.insertMany([
      { name: "Action" },
      { name: "Romance" },
      { name: "Comedy" },
    ]);

    // Manga
    await Manga.deleteMany({});
    const mangas = await Manga.insertMany([
      { name: "Sample Manga", author: "Author 1", artist: "Artist 1", genres: [genres[0]._id, genres[1]._id], summary: "Sample summary" },
    ]);

    // Chapters
    await Chapter.deleteMany({});
    await Chapter.insertMany([
      { manga: mangas[0]._id, chapterNumber: 1, title: "Chapter 1", content: ["Page 1", "Page 2"] },
    ]);

    // Announcements
    await Announcement.deleteMany({});
    await Announcement.insertMany([
      { title: "Welcome", contents: { message: "Welcome to the site" }, uploader: "admin@example.com" },
    ]);

    // Subscribers
    await Subscriber.deleteMany({});
    await Subscriber.insertMany([
      { email: "subscriber@example.com", userId: "user123" },
    ]);

    console.log("All data seeded successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Seeding error:", err);
    mongoose.disconnect();
  }
};

// Run seed only if this file is executed directly
if (require.main === module) seedData();
