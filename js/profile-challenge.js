
"use strict";

const htmlEditor = document.getElementById("html-code");
const cssEditor = document.getElementById("css-code");
const previewFrame = document.getElementById("website-preview");
const previewButton = document.getElementById("preview-button");
const resetButton = document.getElementById("reset-button");
const editorMessage = document.getElementById("editor-message");
const checklistMessage = document.getElementById("checklist-message");
const checklistItems = document.querySelectorAll(
  '.check-item input[type="checkbox"]'
);

const starterHTML = `<main class="profile">
  <div class="avatar" aria-hidden="true">🌟</div>

  <h1>Hello, I'm Alex!</h1>

  <p class="introduction">
    I'm learning to build websites with HTML and CSS.
    I enjoy discovering new things and solving problems.
  </p>

  <section>
    <h2>My hobbies</h2>
    <ul>
      <li>Reading stories</li>
      <li>Playing football</li>
      <li>Learning to code</li>
    </ul>
  </section>

  <section>
    <h2>My favourite subject</h2>
    <p>Computer Studies</p>
  </section>

  <p class="footer-text">Thanks for visiting my profile!</p>
</main>`;

const starterCSS = `body {
  margin: 0;
  padding: 30px 16px;
  font-family: Arial, sans-serif;
  background: #eef2ff;
  color: #1e293b;
}

.profile {
  max-width: 520px;
  margin: 0 auto;
  padding: 28px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 8px 24px #c7d2fe;
}

.avatar {
  font-size: 48px;
  text-align: center;
}

h1 {
  color: #4f46e5;
  text-align: center;
}

h2 {
  color: #7c3aed;
}

.introduction {
  line-height: 1.7;
  text-align: center;
}

li {
  margin: 8px 0;
}

.footer-text {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #64748b;
}`;

function renderPreview() {
  const html = htmlEditor.value;
  const css = cssEditor.value;

  // The iframe has an empty sandbox, so scripts in learner HTML cannot run.
  // Keep CSS inside the iframe and prevent the learner's HTML from escaping it.
  const safeCSS = css.replace(/<\/style/gi, "<\\/style");

  previewFrame.srcdoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${safeCSS}</style>
</head>
<body>
${html}
</body>
</html>`;

  editorMessage.textContent =
    "Preview updated. Keep experimenting with your HTML and CSS.";
}

function resetCode() {
  htmlEditor.value = starterHTML;
  cssEditor.value = starterCSS;
  renderPreview();

  checklistItems.forEach((item) => {
    item.checked = false;
  });

  updateChecklist();
  editorMessage.textContent =
    "Starter code restored. Make your own changes and preview again.";
}

function updateChecklist() {
  const completed = Array.from(checklistItems).filter(
    (item) => item.checked
  ).length;

  checklistMessage.textContent =
    completed === checklistItems.length
      ? "Great work! You have completed every challenge checklist item."
      : `${completed} of ${checklistItems.length} checklist items completed.`;
}

if (
  htmlEditor &&
  cssEditor &&
  previewFrame &&
  previewButton &&
  resetButton &&
  editorMessage &&
  checklistMessage
) {
  htmlEditor.value = starterHTML;
  cssEditor.value = starterCSS;

  previewButton.addEventListener("click", renderPreview);
  resetButton.addEventListener("click", resetCode);

  checklistItems.forEach((item) => {
    item.addEventListener("change", updateChecklist);
  });

  renderPreview();
  updateChecklist();
} else {
  console.error("The profile challenge could not find one or more required page elements.");
}