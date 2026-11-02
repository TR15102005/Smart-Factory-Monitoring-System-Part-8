// Thin persistence layer: MongoDB (Mongoose) when available, in-memory otherwise.
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Zone = require('../models/Zone');
const Worker = require('../models/Worker');
const Robot = require('../models/Robot');
const Incident = require('../models/Incident');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const Report = require('../models/Report');
const Certification = require('../models/Certification');
const Setting = require('../models/Setting');
const layout = require('../data/layout');
const seedData = require('../data/seedData');
const { getMode } = require('../config/db');

const memUsers = [];
let memSeq = 0;

const MODELS = {
  workers: Worker,
  robots: Robot,
  incidents: Incident,
  maintenance: MaintenanceRecord,
  reports: Report,
  certifications: Certification
};

const mem = {
  workers: [],
  robots: [],
  incidents: [],
  maintenance: [],
  reports: [],
  certifications: []
};
let memSettings = null;

function isMongo() {
  return getMode() === 'mongo';
}

function norm(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id || doc.id) };
}

function toSafe(user) {
  if (!user) return null;
  return { id: String(user._id || user.id), name: user.name, email: user.email, role: user.role, createdAt: user.createdAt || null };
}

/* ---------- users ---------- */
async function findUserByEmail(email) {
  if (isMongo()) return User.findOne({ email: email.toLowerCase() });
  return memUsers.find((u) => u.email === email.toLowerCase()) || null;
}

async function findUserById(id) {
  if (isMongo()) return User.findById(id);
  return memUsers.find((u) => u.id === id) || null;
}

async function listUsers() {
  if (isMongo()) {
    const docs = await User.find().sort({ createdAt: 1 }).lean();
    return docs.map(toSafe);
  }
  return memUsers.map(toSafe);
}

async function createUser({ name, email, passwordHash, role }) {
  if (isMongo()) return User.create({ name, email: email.toLowerCase(), passwordHash, role });
  const user = { id: `u${++memSeq}`, name, email: email.toLowerCase(), passwordHash, role, createdAt: new Date() };
  memUsers.push(user);
  return user;
}

async function countUsers() {
  if (isMongo()) return User.countDocuments();
  return memUsers.length;
}

/* ---------- zones ---------- */
async function allZones() {
  if (isMongo()) {
    const docs = await Zone.find().lean();
    if (docs.length) {
      return docs.map((d) => ({ id: d.zoneId, name: d.name, type: d.type, x: d.x, y: d.y, w: d.w, h: d.h, capacity: d.capacity }));
    }
  }
  return layout.zones;
}

/* ---------- generic collections ---------- */
async function list(name, sort) {
  if (isMongo()) {
    const docs = await MODELS[name].find().sort(sort || { _id: 1 }).lean();
    return docs.map(norm);
  }
  return mem[name].map((d) => ({ ...d }));
}

async function get(name, id) {
  if (isMongo()) return norm(await MODELS[name].findById(id).lean());
  const found = mem[name].find((d) => d.id === id);
  return found ? { ...found } : null;
}

async function create(name, doc) {
  if (isMongo()) return norm((await MODELS[name].create(doc)).toObject());
  const saved = { ...doc, id: `${name[0]}${++memSeq}` };
  mem[name].push(saved);
  return { ...saved };
}

async function update(name, id, patch) {
  if (isMongo()) return norm(await MODELS[name].findByIdAndUpdate(id, patch, { new: true }).lean());
  const found = mem[name].find((d) => d.id === id);
  if (!found) return null;
  Object.assign(found, patch);
  return { ...found };
}

async function count(name) {
  if (isMongo()) return MODELS[name].countDocuments();
  return mem[name].length;
}

/* ---------- settings ---------- */
async function getSettings() {
  if (isMongo()) {
    const doc = await Setting.findOne({ key: 'workspace' }).lean();
    return doc ? norm(doc) : { ...seedData.defaultSettings, id: 'default' };
  }
  return memSettings ? { ...memSettings } : { ...seedData.defaultSettings, id: 'default' };
}

async function updateSettings(patch) {
  if (isMongo()) {
    const doc = await Setting.findOneAndUpdate({ key: 'workspace' }, { ...patch, key: 'workspace' }, { new: true, upsert: true }).lean();
    return norm(doc);
  }
  memSettings = { ...(memSettings || seedData.defaultSettings), ...patch, id: 'default' };
  return { ...memSettings };
}

/* ---------- seeding ---------- */
async function seedIfEmpty() {
  if (isMongo() && (await Zone.countDocuments()) === 0) {
    await Zone.insertMany(layout.zones.map((z) => ({ zoneId: z.id, name: z.name, type: z.type, x: z.x, y: z.y, w: z.w, h: z.h, capacity: z.capacity })));
    console.log(`[seed] ${layout.zones.length} factory zones stored in MongoDB`);
  }
  if ((await countUsers()) === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@factory.io';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser({ name: 'Factory Admin', email, passwordHash, role: 'admin' });
    console.log(`[seed] default admin account ready -> ${email} / ${password}`);
  }

  const seeds = [
    ['workers', seedData.workers],
    ['robots', seedData.robots],
    ['incidents', seedData.incidents],
    ['maintenance', seedData.maintenance],
    ['certifications', seedData.certifications],
    ['reports', seedData.reports]
  ];
  for (const [name, rows] of seeds) {
    if ((await count(name)) === 0) {
      if (isMongo()) await MODELS[name].insertMany(rows);
      else rows.forEach((r) => mem[name].push({ ...r, id: `${name[0]}${++memSeq}` }));
      console.log(`[seed] ${rows.length} ${name} records loaded`);
    }
  }
}

module.exports = {
  isMongo, norm, toSafe,
  findUserByEmail, findUserById, listUsers, createUser, countUsers,
  allZones,
  list, get, create, update, count,
  getSettings, updateSettings,
  seedIfEmpty
};
