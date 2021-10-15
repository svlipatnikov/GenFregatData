const xlsx = require("xlsx");
const { SHEETS } = require("./static");
const { getSheetData, getFileName } = require("./helpers");

module.exports.sidRead = (application) => {
  const fileName = getFileName("../" + application, ".xlsx");
  const excelData = xlsx.readFile("../" + application + "/" + fileName);
  const resultData = {};

  Object.entries(SHEETS).forEach(([key, name]) => {
    const sheetDataWithHeader = getSheetData(
      xlsx.utils.sheet_to_json(excelData.Sheets[name], { header: 1 })
    );

    if (sheetDataWithHeader?.length)
      resultData[key] = {
        headers: sheetDataWithHeader.shift(),
        data: sheetDataWithHeader,
      };
  });

  return resultData;
};
