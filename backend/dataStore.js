// dataStore.js
const fs = require("fs-extra");
const path = require("path");
const DATA_FILE = path.join(__dirname, "data.json");

async function readData() {
  try {
    const exists = await fs.pathExists(DATA_FILE);
    if (!exists) {
      const init = { polls: [] };
      await fs.writeJson(DATA_FILE, init, { spaces: 2 });
      return init;
    }
    return await fs.readJson(DATA_FILE);
  } catch (err) {
    console.error("readData error", err);
    return { polls: [] };
  }
}

async function writeData(data) {
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
}

module.exports = { readData, writeData };
