const CONTACT = {
  name: "바이브코더",
  title: "바이브코딩 풀스택 개발자",
  tagline: "아이디어를 빠르게 제품으로.",
  email: "vibecoder@vibe.com",
  phoneDisplay: "010-0000-0000",
  phoneTel: "01000000000",
};

function $(sel, root = document) {
  return root.querySelector(sel);
}
function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 1400);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function wireCopyRows() {
  const rows = $all("[data-copy]");
  for (const row of rows) {
    row.addEventListener("click", async (e) => {
      // If user clicks the row, let normal action happen once.
      // If it was already opened or modifier keys, copy instead.
      const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const justCopy = isModified || row.dataset.clickedOnce === "true";

      if (justCopy) {
        e.preventDefault();
        const text = row.getAttribute("data-copy") || "";
        const ok = await copyText(text);
        row.dataset.copied = ok ? "true" : "false";
        showToast(ok ? "복사 완료" : "복사 실패");
        window.setTimeout(() => {
          delete row.dataset.copied;
        }, 900);
      } else {
        row.dataset.clickedOnce = "true";
        window.setTimeout(() => {
          delete row.dataset.clickedOnce;
        }, 1200);
      }
    });
  }
}

function buildVCard() {
  // vCard 3.0 is widely supported.
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${CONTACT.name}`,
    `N:${CONTACT.name};;;;`,
    `TITLE:${CONTACT.title}`,
    `EMAIL;TYPE=INTERNET:${CONTACT.email}`,
    `TEL;TYPE=CELL:${CONTACT.phoneTel}`,
    `NOTE:${CONTACT.tagline}`,
    "END:VCARD",
  ];
  return lines.join("\r\n");
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wireButtons() {
  const btnSave = $("#btnSave");
  const btnTheme = $("#btnTheme");

  btnSave?.addEventListener("click", () => {
    downloadText("vibecoder.vcf", buildVCard());
    showToast("vCard 저장됨");
  });

  btnTheme?.addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    btnTheme.setAttribute("aria-pressed", next === "light" ? "true" : "false");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  });
}

function restoreTheme() {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
      const btnTheme = $("#btnTheme");
      btnTheme?.setAttribute("aria-pressed", t === "light" ? "true" : "false");
    }
  } catch {}
}

restoreTheme();
wireCopyRows();
wireButtons();

