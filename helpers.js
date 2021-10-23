const fs = require("fs");

module.exports.getApps = () => {
  return fs.readFileSync("apps.txt").toString().split("\r\n");
};

module.exports.getPos = () => {
  return fs.readFileSync("positions.txt").toString().split("\r\n");
};

module.exports.getFileName = (dir, ext = "") => {
  const fileNames = fs.readdirSync(dir);
  return fileNames.find((name) => name.includes(ext));
};

module.exports.getSheetData = (data) => {
  if (!data) return;
  const headerIndex = data.findIndex((raw) => raw[0] == "Equipment");
  if (headerIndex === -1) return data;
  return data.splice(headerIndex);
};
