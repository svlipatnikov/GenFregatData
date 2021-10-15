const { vl2portsRead } = require("./read-vl2ports");
const { sidRead } = require("./read-sid");
const { getApps, getPos } = require("./helpers");
const { makeData, makeParam, makeMesSize } = require("./makeFiles");
const fs = require("fs");

const apps = getApps();
const positions = getPos();

const app = apps[0];
console.log("Application:", app);

const pos = positions[2];
console.log("DUPOS:", pos);

const afdx2tte = vl2portsRead(pos);
// console.log("afdx2tte", afdx2tte);
// console.log(typeof afdx2tte);

const sidDA = sidRead("DA");
// console.log("sidDA", sidDA);

const sidBITE = sidRead("BITE");
// console.log("sidBITE", sidBITE);
const IO = "O";
const mesSizeOut = makeMesSize({
  messagesDA: sidDA.messages,
  messagesBITE: sidBITE?.messages,
  afdx2tte,
  pos,
  IO,
});
// console.log("mesSizeOut", mesSizeOut);

const outPath = "FREGAT_DATA";
const fileName = `${pos}_Mes_Size${IO === "O" ? "_Out" : ""}.txt`;
fs.rmdirSync(outPath, { recursive: true });
fs.mkdirSync(outPath);
fs.mkdirSync(outPath + "/" + pos);
fs.writeFileSync(outPath + "/" + pos + "/" + fileName, mesSizeOut);
