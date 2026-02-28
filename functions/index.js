const functions = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");
require("dotenv").config(); // Add this

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Running on Render
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    // Running locally (with firebase emulator or default credentials)
    admin.initializeApp();
  }
}

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Serve static frontend files from dist directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// OpenAI setup using .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "none",
});

// ─────────────────────────────────────────
// MIDDLEWARE: Check if user is logged in
// ─────────────────────────────────────────
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please login first" });
  }
  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid login token" });
  }
};

const isRep = async (req, res, next) => {
  const userDoc = await db.collection("users").doc(req.user.uid).get();
  if (!userDoc.exists || userDoc.data().role !== "rep") {
    return res.status(403).json({ error: "Only hostel reps can do this" });
  }
  next();
};

// ─────────────────────────────────────────
// TEST ROUTE - to check if backend is working
// ─────────────────────────────────────────
app.get("/test", (req, res) => {
  res.json({ message: "✅ Backend is working!", time: new Date().toISOString() });
});

// ─────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────
app.post("/auth/register", authenticate, async (req, res) => {
  const { displayName, role } = req.body;
  try {
    await db.collection("users").doc(req.user.uid).set({
      displayName: displayName || "Anonymous",
      role: role === "rep" ? "rep" : "student",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, uid: req.user.uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/auth/me", authenticate, async (req, res) => {
  const doc = await db.collection("users").doc(req.user.uid).get();
  res.json({ uid: req.user.uid, ...doc.data() });
});

// ─────────────────────────────────────────
// CALENDAR ROUTES
// ─────────────────────────────────────────
app.post("/calendar/parse", authenticate, async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) return res.status(400).json({ error: "fileUrl is required" });

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "none") {
    return res.status(400).json({ error: "OpenAI key not set up yet" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an academic calendar parser. Extract ALL dates from this image.
Return ONLY a JSON array like this (nothing else, no markdown):
[
  {
    "title": "Mid Semester Exam",
    "date": "2025-03-15",
    "type": "exam",
    "description": "optional details"
  }
]
Types allowed: exam, holiday, semester_end, assignment, other`,
            },
            { type: "image_url", image_url: { url: fileUrl } },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const cleanJson = content.replace(/```json\n?|\n?```/g, "").trim();
    const events = JSON.parse(cleanJson);

    const batch = db.batch();
    events.forEach((event) => {
      const ref = db.collection("calendar_events").doc();
      batch.set(ref, {
        ...event,
        userId: req.user.uid,
        source: "ai_parsed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    res.json({ success: true, events, count: events.length });
  } catch (err) {
    res.status(500).json({ error: "AI parsing failed: " + err.message });
  }
});

app.get("/calendar/events", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("calendar_events")
      .orderBy("date", "asc")
      .get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/calendar/events", authenticate, async (req, res) => {
  const { title, date, type, description } = req.body;
  if (!title || !date) return res.status(400).json({ error: "Title and date required" });
  try {
    const ref = await db.collection("calendar_events").add({
      title,
      date,
      type: type || "other",
      description: description || "",
      userId: req.user.uid,
      source: "manual",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: ref.id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/calendar/events/:id", authenticate, async (req, res) => {
  try {
    await db.collection("calendar_events").doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/calendar/events/:id", authenticate, async (req, res) => {
  try {
    await db.collection("calendar_events").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/calendar/countdown", authenticate, async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const snapshot = await db
      .collection("calendar_events")
      .where("date", ">=", todayStr)
      .orderBy("date", "asc")
      .get();

    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const nextExam = events.find((e) => e.type === "exam");
    const nextHoliday = events.find((e) => e.type === "holiday");
    const semesterEnd = events.find((e) => e.type === "semester_end");

    const msToDate = (dateStr) => {
      if (!dateStr) return null;
      return new Date(dateStr).getTime() - now.getTime();
    };

    res.json({
      nextExam: nextExam ? { ...nextExam, msRemaining: msToDate(nextExam.date) } : null,
      nextHoliday: nextHoliday ? { ...nextHoliday, msRemaining: msToDate(nextHoliday.date) } : null,
      semesterEnd: semesterEnd ? { ...semesterEnd, msRemaining: msToDate(semesterEnd.date) } : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// VENT POSTS ROUTES
// ─────────────────────────────────────────
app.get("/vents", async (req, res) => {
  try {
    const { sort = "recent" } = req.query;
    const orderField = sort === "liked" ? "likes" : "createdAt";

    const snapshot = await db
      .collection("vent_posts")
      .orderBy(orderField, "desc")
      .limit(50)
      .get();

    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      const { userId, likedBy, ...safeData } = data;
      return { id: doc.id, ...safeData };
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/vents", authenticate, async (req, res) => {
  const { content } = req.body;
  if (!content || content.trim().length < 3) {
    return res.status(400).json({ error: "Post is too short!" });
  }

  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const ref = await db.collection("vent_posts").add({
      content: content.trim(),
      userId: req.user.uid,
      likes: 0,
      likedBy: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    });

    res.json({ id: ref.id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/vents/:id/like", authenticate, async (req, res) => {
  try {
    const ref = db.collection("vent_posts").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Post not found" });

    const likedBy = doc.data().likedBy || [];

    if (likedBy.includes(req.user.uid)) {
      await ref.update({
        likes: admin.firestore.FieldValue.increment(-1),
        likedBy: admin.firestore.FieldValue.arrayRemove(req.user.uid),
      });
      res.json({ liked: false });
    } else {
      await ref.update({
        likes: admin.firestore.FieldValue.increment(1),
        likedBy: admin.firestore.FieldValue.arrayUnion(req.user.uid),
      });
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// MESS FOOD RATING ROUTES
// ─────────────────────────────────────────
const getRatingLabel = (avg) => {
  if (avg <= 1.5) return "🔥 Michelin Disaster";
  if (avg <= 2.5) return "😐 Survivable";
  if (avg <= 3.5) return "👍 Mid But Edible";
  if (avg <= 4.5) return "😊 Actually Decent";
  return "🌟 Hostel Heaven";
};

app.post("/mess/rate", authenticate, async (req, res) => {
  const { rating, meal, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const mealType = meal || "general";

    const existing = await db
      .collection("mess_ratings")
      .where("userId", "==", req.user.uid)
      .where("date", "==", today)
      .where("meal", "==", mealType)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "You already rated today's " + mealType });
    }

    await db.collection("mess_ratings").add({
      rating: Number(rating),
      meal: mealType,
      comment: comment || "",
      date: today,
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/mess/stats", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const todaySnap = await db
      .collection("mess_ratings")
      .where("date", "==", today)
      .get();

    const todayRatings = todaySnap.docs.map((d) => d.data().rating);
    const todayAvg =
      todayRatings.length > 0
        ? todayRatings.reduce((a, b) => a + b, 0) / todayRatings.length
        : null;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const weekSnap = await db
      .collection("mess_ratings")
      .where("date", ">=", weekAgo)
      .get();

    const weekRatings = weekSnap.docs.map((d) => d.data().rating);
    const weekAvg =
      weekRatings.length > 0
        ? weekRatings.reduce((a, b) => a + b, 0) / weekRatings.length
        : null;

    const dailyMap = {};
    weekSnap.docs.forEach((doc) => {
      const { date, rating } = doc.data();
      if (!dailyMap[date]) dailyMap[date] = [];
      dailyMap[date].push(rating);
    });

    const dailyAvgs = Object.entries(dailyMap)
      .map(([date, ratings]) => ({
        date,
        avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      todayAvg: todayAvg ? Math.round(todayAvg * 10) / 10 : null,
      todayLabel: todayAvg ? getRatingLabel(todayAvg) : "No ratings yet today",
      todayCount: todayRatings.length,
      weekAvg: weekAvg ? Math.round(weekAvg * 10) / 10 : null,
      weekLabel: weekAvg ? getRatingLabel(weekAvg) : "No data this week",
      dailyAvgs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// SURVIVAL TIPS ROUTES
// ─────────────────────────────────────────
app.get("/tips", async (req, res) => {
  try {
    const { tag } = req.query;

    const snapshot = await db
      .collection("survival_tips")
      .orderBy("upvotes", "desc")
      .limit(50)
      .get();

    let tips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (tag) {
      tips = tips.filter((t) => t.tags && t.tags.includes(tag));
    }

    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tips/leaderboard", async (req, res) => {
  try {
    const snapshot = await db
      .collection("survival_tips")
      .orderBy("upvotes", "desc")
      .limit(10)
      .get();

    const tips = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let authorName = "Anonymous";
        try {
          const userDoc = await db.collection("users").doc(data.userId).get();
          if (userDoc.exists) authorName = userDoc.data().displayName;
        } catch (_) {}
        const { upvotedBy, userId, ...safeData } = data;
        return { id: doc.id, ...safeData, authorName };
      })
    );

    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tips", authenticate, async (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const ref = await db.collection("survival_tips").add({
      title,
      content,
      category: category || "general",
      tags: tags || [],
      upvotes: 0,
      upvotedBy: [],
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: ref.id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tips/:id/upvote", authenticate, async (req, res) => {
  try {
    const ref = db.collection("survival_tips").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Tip not found" });

    const upvotedBy = doc.data().upvotedBy || [];
    if (upvotedBy.includes(req.user.uid)) {
      return res.status(400).json({ error: "You already upvoted this tip" });
    }

    await ref.update({
      upvotes: admin.firestore.FieldValue.increment(1),
      upvotedBy: admin.firestore.FieldValue.arrayUnion(req.user.uid),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// COMPLAINT ROUTES
// ─────────────────────────────────────────
app.post("/complaints", authenticate, async (req, res) => {
  const { title, description, category } = req.body;
  const validCategories = ["WiFi", "Food", "Cleanliness", "Electricity", "Noise", "Maintenance"];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category. Choose: " + validCategories.join(", ") });
  }

  try {
    const ref = await db.collection("complaints").add({
      title,
      description,
      category,
      status: "Pending",
      userId: req.user.uid,
      timeline: [
        {
          status: "Pending",
          note: "Complaint submitted successfully",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: ref.id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaints/my", authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection("complaints")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const complaints = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/complaints/all", authenticate, isRep, async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = db.collection("complaints").orderBy("createdAt", "desc");
    if (status) query = query.where("status", "==", status);

    const snapshot = await query.get();
    let complaints = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (category) complaints = complaints.filter((c) => c.category === category);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/complaints/:id/status", authenticate, isRep, async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ["Pending", "In Progress", "Resolved"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status must be: Pending, In Progress, or Resolved" });
  }

  try {
    const ref = db.collection("complaints").doc(req.params.id);
    await ref.update({
      status,
      timeline: admin.firestore.FieldValue.arrayUnion({
        status,
        note: note || `Status changed to ${status}`,
        timestamp: new Date().toISOString(),
        updatedBy: req.user.uid,
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// EXPORT THE API
// ─────────────────────────────────────────
exports.api = functions.https.onRequest(app);

// ─────────────────────────────────────────
// AUTO DELETE VENT POSTS AFTER 24 HOURS
// ─────────────────────────────────────────
exports.cleanExpiredVents = onSchedule("every 60 minutes", async (event) => {
  const now = admin.firestore.Timestamp.now();
  const expired = await db
    .collection("vent_posts")
    .where("expiresAt", "<=", now)
    .get();

  const batch = db.batch();
  expired.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  console.log(`Deleted ${expired.size} expired vent posts`);
  return null;
});

// ─────────────────────────────────────────
// WEEKLY MESS SUMMARY (every Monday 8am IST)
// ─────────────────────────────────────────
exports.weeklyMessSummary = onSchedule(
  { schedule: "0 8 * * 1", timeZone: "Asia/Kolkata" },
  async (event) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const snap = await db
      .collection("mess_ratings")
      .where("date", ">=", weekAgo)
      .get();

    const ratings = snap.docs.map((d) => d.data().rating);
    const avg = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    await db.collection("mess_weekly_summary").add({
      weekStarting: weekAgo,
      avgRating: Math.round(avg * 10) / 10,
      totalRatings: ratings.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Weekly summary saved: avg=${avg}`);
    return null;
  }
);
// Fallback to index.html for React routing (must be last route)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
