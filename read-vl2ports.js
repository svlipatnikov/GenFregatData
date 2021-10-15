const fs = require("fs");
const { getFileName } = require("./helpers");

module.exports.vl2portsRead = (pos) => {
  const basePath = "CONFIG/";
  const fileName = getFileName(basePath + pos, ".utst");

  const vl2ports = fs.readFileSync(basePath + pos + "/" + fileName);
  const result = vl2ports.toString().split("\r\n");

  const afdx2tte = {};
  result.forEach((str) => {
    if (!str) return;
    const [afdxPort, ttePortNum] = str.split(" = ");
    const [direction, afdxPortNum] = afdxPort.split("_");
    afdx2tte[afdxPortNum] = {
      tte: ttePortNum,
      direction: direction === "XIP" ? "I" : "O",
    };
  });

  return afdx2tte;
};
