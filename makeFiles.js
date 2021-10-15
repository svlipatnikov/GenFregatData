const { TYPES } = require("./static");

module.exports.makeParam = ({ table, pos, ICD = false }) => {
  const indexEquipment = 0;
  const indexIdentity = table.headers.findIndex((h) => h === "Identity");
  const indexParam = ICD
    ? 7
    : table.headers.findIndex((h) => h === "Parameter name");

  return table.data
    .filter((r) => r[indexEquipment] === pos)
    .map((row, i) => {
      const index = i + 1; //fregat index started with 1
      const identity = ICD ? "_" + row[indexIdentity] : "";
      const param = row[indexParam];
      return "" + param + identity + " = " + index + "\r\n"; // Чтобы было как у Чекмарева
    })
    .join("");
};

module.exports.makeMesSize = ({ mesDA, mesBITE, afdx2tte, pos, IO }) => {
  const indexEquipmentDA = mesDA.headers.findIndex((h) => h === "Equipment");
  const indexAfdxPortDA = mesDA.headers.findIndex((h) => h === "AFDX Port");
  const indexMesSizeDA = mesDA.headers.findIndex((h) => h === "Size");

  const indexEquipmentBITE = mesBITE?.headers.findIndex(
    (h) => h === "Equipment"
  );
  const indexAfdxPortBITE = mesBITE?.headers.findIndex(
    (h) => h === "AFDX Port"
  );
  const indexMesSizeBITE = mesBITE?.headers.findIndex((h) => h === "Size");

  return Object.entries(afdx2tte)
    .filter(([port, { direction }]) => direction === IO)
    .map(([port, { tte }]) => {
      const message =
        mesDA.data
          .filter((r) => r[indexEquipmentDA] === pos)
          .find((r) => r[indexAfdxPortDA] === port) || {};
      let mesSize = message[indexMesSizeDA];

      if (!mesSize && mesBITE) {
        const messageBITE =
          mesBITE.data
            .filter((r) => r[indexEquipmentBITE] === pos)
            .find((r) => r[indexAfdxPortBITE] === port) || {};
        mesSize = messageBITE[indexMesSizeBITE];
      }

      return mesSize + " " + tte;
    })
    .sort((a, b) => a.split(" ")[1] - b.split(" ")[1])
    .join("\r\n");
};

module.exports.makeData = ({ sid, afdx2tte, pos, IO }) => {
  const data = IO === "I" ? sid.input.data : sid.output.data;
  const headers = IO === "I" ? sid.input.headers : sid.output.headers;

  const indexEquipment = headers.findIndex((h) => h === "Equipment");
  const indexVlName = headers.findIndex((h) => h === "VL Name");
  const indexFSMSW = headers.findIndex((h) => h === "FS MSW");
  const indexFSMSB = headers.findIndex((h) => h === "FS MSB");
  const indexType = headers.findIndex((h) => h === "type");
  const indexMSW = headers.findIndex((h) => h === "MSW");
  const indexMSB = headers.findIndex((h) => h === "MSB");
  const indexRange = headers.findIndex((h) => h === "Value Domain");

  return data
    .filter((r) => r[indexEquipment] === pos)
    .map((row) => {
      const afdxPort = getAfdxPortByVlName(sid.messages, row[indexVlName], pos);
      const range =
        row[indexRange] === "N/A"
          ? "0...0"
          : row[indexRange].replace("…", "...");

      let result = "";
      result += row[indexFSMSW];
      result += " " + row[indexFSMSB];
      result += " " + TYPES[row[indexType]];
      result += " " + row[indexMSW];
      result += " " + row[indexMSB];
      result += " " + afdx2tte[afdxPort].tte;
      result += " " + roundNum(range.split("...")[0], 16);
      result += " " + roundNum(range.split("...")[1], 16);

      return result;
    })
    .join("\r\n");
};

const getAfdxPortByVlName = (messages, vlName, pos) => {
  const indexEquipment = messages.headers.findIndex((h) => h === "Equipment");
  const indexVlName = messages.headers.findIndex((h) => h === "VL Name");
  const indexAfdxPort = messages.headers.findIndex((h) => h === "AFDX Port");
  return messages.data
    .filter((r) => r[indexEquipment] === pos)
    .find((r) => r[indexVlName] === vlName)[indexAfdxPort];
};

const roundNum = (number, count) => {
  if (number.length < count) return Number(number);
  const pow = Math.pow(10, count);
  return Math.round(number * pow) / pow;
};
