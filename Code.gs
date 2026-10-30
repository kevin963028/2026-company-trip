const SPREADSHEET_NAME = "2026_公司旅遊";
const RESPONSE_SHEET_NAME = "報名資料";
const SPREADSHEET_ID_KEY = "REGISTRATION_SPREADSHEET_ID";
const HEADERS = ["姓名", "Email", "單位", "電話", "暱稱", "報名時間"];

function setup() {
  const properties = PropertiesService.getScriptProperties();
  const savedId = properties.getProperty(SPREADSHEET_ID_KEY);
  const spreadsheet = savedId
    ? SpreadsheetApp.openById(savedId)
    : SpreadsheetApp.create(SPREADSHEET_NAME);
  const sheet = spreadsheet.getSheets()[0];

  sheet.setName(RESPONSE_SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange("A:E").setNumberFormat("@");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
  properties.setProperty(SPREADSHEET_ID_KEY, spreadsheet.getId());

  Logger.log("試算表已準備完成：" + spreadsheet.getUrl());
  return spreadsheet.getUrl();
}

function doPost(event) {
  try {
    const data = event.parameter;
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();

    if (!name || !email || !phone) {
      return responsePage("error", "請填寫姓名、Email 和電話。");
    }

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_KEY);
    if (!spreadsheetId) throw new Error("請先執行 setup() 建立試算表。");

    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(RESPONSE_SHEET_NAME);
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, 5).setNumberFormat("@");
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
      name,
      email,
      String(data.department || "").trim(),
      phone,
      String(data.nickname || "").trim(),
      new Date()
    ]]);

    return responsePage("success", "報名成功");
  } catch (error) {
    console.error(error);
    return responsePage("error", "系統暫時無法處理報名。");
  }
}

function responsePage(status, message) {
  const payload = JSON.stringify({
    type: "employee-trip-registration",
    status: status,
    message: message
  });
  const html = "<!doctype html><html><body><script>parent.postMessage(" + payload + ", '*');</script></body></html>";
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}