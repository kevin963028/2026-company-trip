const registrationForm = document.querySelector("#registration-form");
const formStatus = document.querySelector("#form-status");
const registrationFrame = document.querySelector("#registration-frame");
const submissionNonceInput = document.querySelector("#submission-nonce");
const appsScriptUrl = window.EVENT_CONFIG?.appsScriptUrl?.trim() ?? "";
let submissionPending = false;
let submissionTimeout;
let activeSubmissionNonce = "";

registrationForm.addEventListener("submit", (event) => {
  if (!appsScriptUrl) {
    event.preventDefault();
    setStatus("報名系統尚未連結，請完成 Google 試算表部署後再試。", "error");
    return;
  }

  registrationForm.action = appsScriptUrl;
  const nonceBytes = new Uint32Array(4);
  crypto.getRandomValues(nonceBytes);
  activeSubmissionNonce = `${Date.now()}-${Array.from(nonceBytes).join("-")}`;
  submissionNonceInput.value = activeSubmissionNonce;
  submissionPending = true;
  setStatus("正在送出報名…");
  window.clearTimeout(submissionTimeout);
  submissionTimeout = window.setTimeout(() => {
    if (!submissionPending) return;
    submissionPending = false;
    activeSubmissionNonce = "";
    setStatus("送出逾時，請稍後再試或聯絡活動窗口。", "error");
  }, 15000);
});

window.addEventListener("message", (event) => {
  if (event.data?.type !== "employee-trip-registration") return;
  if (!activeSubmissionNonce || event.data.nonce !== activeSubmissionNonce) return;

  window.clearTimeout(submissionTimeout);
  submissionPending = false;
  activeSubmissionNonce = "";
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