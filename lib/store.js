// Lapisan penyimpanan data berbasis file JSON.
// Setiap koleksi disimpan sebagai satu file di data/<collection>.json.
// Semua operasi baca/tulis dilakukan secara sinkron agar urutan
// penulisan pada file yang sama tidak saling tabrakan.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePathFor(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll(collection) {
  ensureDataDir();
  const file = filePathFor(collection);
  if (!fs.existsSync(file)) {
    return [];
  }
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Gagal membaca data/${collection}.json: ${err.message}`);
  }
}

function writeAll(collection, records) {
  ensureDataDir();
  const file = filePathFor(collection);
  fs.writeFileSync(file, JSON.stringify(records, null, 2), 'utf8');
}

function findById(collection, id) {
  return readAll(collection).find((r) => r.id === id) || null;
}

function findOne(collection, predicate) {
  return readAll(collection).find(predicate) || null;
}

function findMany(collection, predicate) {
  const all = readAll(collection);
  return predicate ? all.filter(predicate) : all;
}

function insert(collection, record) {
  const all = readAll(collection);
  const withId = { id: crypto.randomUUID(), ...record };
  all.push(withId);
  writeAll(collection, all);
  return withId;
}

function update(collection, id, patch) {
  const all = readAll(collection);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) {
    return null;
  }
  all[idx] = { ...all[idx], ...patch, id: all[idx].id };
  writeAll(collection, all);
  return all[idx];
}

function replace(collection, id, record) {
  const all = readAll(collection);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) {
    return null;
  }
  all[idx] = { ...record, id: all[idx].id };
  writeAll(collection, all);
  return all[idx];
}

function remove(collection, id) {
  const all = readAll(collection);
  const next = all.filter((r) => r.id !== id);
  const removed = next.length !== all.length;
  if (removed) {
    writeAll(collection, next);
  }
  return removed;
}

module.exports = {
  readAll,
  writeAll,
  findById,
  findOne,
  findMany,
  insert,
  update,
  replace,
  remove,
};
