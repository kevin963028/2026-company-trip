const registrationForm = document.querySelector("#registration-form");
const formStatus = document.querySelector("#form-status");
const registrationFrame = document.querySelector("#registration-frame");
const appsScriptUrl = window.EVENT_CONFIG?.appsScriptUrl?.trim() ?? "";
let submissionPending = false;

registrationForm.addEventListener("submit", (event) => {
  if (!appsScriptUrl) {
    event.preventDefault();
    setStatus("報名系統尚未連結，請完成 Google 試算表部署後再試。", "error");
    return;
  }

  registrationForm.action = appsScriptUrl;
  submissionPending = true;
  setStatus("正在送出報名…");
});

registrationFrame.addEventListener("load", () => {
  if (!submissionPending) return;
  submissionPending = false;
  registrationForm.reset();
  setStatus("報名資料已送出，墾丁見！", "success");
});

window.addEventListener("message", (event) => {
  if (event.source !== registrationFrame.contentWindow) return;
  if (event.data?.type !== "employee-trip-registration") return;

  submissionPending = false;
  if (event.data.status === "success") {
    registrationForm.reset();
    setStatus("報名成功，墾丁見！", "success");
  } else {
    setStatus("送出失敗，請稍後再試或聯絡活動窗口。", "error");
  }
});

function setStatus(message, state = "") {
  formStatus.textContent = message;
  formStatus.dataset.state = state;
}