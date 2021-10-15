const { vl2portsRead } = require("./read-vl2ports");
const { sidRead } = require("./read-sid");
const { getApps, getPos } = require("./helpers");
const { makeData, makeParam, makeMesSize } = require("./makeFiles");
const fs = require("fs");

console.log("Start gen-fregat-data app...");

// проверка на наличие всех данных
const inputDir = fs.readdirSync("../");
if (
  !inputDir.includes("DA") ||
  !inputDir.includes("CONFIG") ||
  !inputDir.includes("apps.txt") ||
  !inputDir.includes("positions.txt")
) {
  console.log("Wrong data");
  return;
}

const apps = getApps();
const positions = getPos();
const sidDA = sidRead("DA");
const sidBITE =
  apps.includes("BITE") && inputDir.includes("BITE")
    ? sidRead("BITE")
    : undefined;

// GENERATE FILES
const OUT_PATH = "../FREGAT_DATA/";
fs.rmdirSync(OUT_PATH, { recursive: true });
fs.mkdirSync(OUT_PATH);

positions.forEach((pos) => {
  const afdx2tte = vl2portsRead(pos);
  if (!afdx2tte) return;
  console.log("Gen files for", pos);

  const mesDA = sidDA.messages;
  const mesBITE = sidBITE?.messages;

  const mesSizeOut = makeMesSize({ mesDA, mesBITE, afdx2tte, pos, IO: "O" });
  const mesSizeIn = makeMesSize({ mesDA, mesBITE, afdx2tte, pos, IO: "I" });

  const paramOut = makeParam({ table: sidDA.output, pos });
  const paramIn = makeParam({ table: sidDA.input, pos });
  const icdParamOut = makeParam({ table: sidDA.output, pos, ICD: true });
  const icdParamIn = makeParam({ table: sidDA.input, pos, ICD: true });

  const dataOut = makeData({ sid: sidDA, afdx2tte, pos, IO: "O" });
  const dataIn = makeData({ sid: sidDA, afdx2tte, pos, IO: "I" });

  const path = OUT_PATH + pos;
  fs.mkdirSync(path);
  fs.writeFileSync(path + `/${pos}_Data.txt`, dataIn);
  fs.writeFileSync(path + `/${pos}_Data_Out.txt`, dataOut);
  fs.writeFileSync(path + `/${pos}_Mes_Size.txt`, mesSizeIn);
  fs.writeFileSync(path + `/${pos}_Mes_Size_Out.txt`, mesSizeOut);
  fs.writeFileSync(path + `/${pos}_Param.utst`, paramIn);
  fs.writeFileSync(path + `/${pos}_Param_Out.utst`, paramOut);
  fs.writeFileSync(path + `/${pos}_ICD_Param.utst`, icdParamIn);
  fs.writeFileSync(path + `/${pos}_ICD_Param_Out.utst`, icdParamOut);

  if (!sidBITE) return;

  const paramOutBITE = makeParam({ table: sidDA.output, pos });
  const paramInBITE = makeParam({ table: sidDA.input, pos });
  const icdParamOutBITE = makeParam({ table: sidDA.output, pos, ICD: true });
  const icdParamInBITE = makeParam({ table: sidDA.input, pos, ICD: true });
  const dataOutBITE = makeData({ sid: sidDA, afdx2tte, pos, IO: "O" });
  const dataInBITE = makeData({ sid: sidDA, afdx2tte, pos, IO: "I" });

  fs.writeFileSync(path + `/${pos}_BITE_Data.txt`, dataInBITE);
  fs.writeFileSync(path + `/${pos}_BITE_Data_Out.txt`, dataOutBITE);
  fs.writeFileSync(path + `/${pos}_BITE_Param.utst`, paramInBITE);
  fs.writeFileSync(path + `/${pos}_BITE_Param_Out.utst`, paramOutBITE);
  fs.writeFileSync(path + `/${pos}_BITE_ICD_Param.utst`, icdParamInBITE);
  fs.writeFileSync(path + `/${pos}_BITE_ICD_Param_Out.utst`, icdParamOutBITE);
});

console.log("...end!");
