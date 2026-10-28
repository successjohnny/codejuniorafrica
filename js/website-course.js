
"use strict";

(() => {
    const htmlEditor = document.getElementById("html-code");
    const cssEditor = document.getElementById("css-code");
    const previewFrame = document.getElementById("website-preview");
    const previewButton = document.getElementById("preview-button");
    const resetButton = document.getElementById("reset-button");
    const editorMessage = document.getElementById("editor-message");
    const quizForm = document.getElementById("quiz-form");
    const quizResult = document.getElementById("quiz-result");

    if (
        !(htmlEditor instanceof HTMLTextAreaElement) ||
        !(cssEditor instanceof HTMLTextAreaElement) ||
        !(previewFrame instanceof HTMLIFrameElement) ||
        !(previewButton instanceof HTMLButtonElement) ||
        !(resetButton instanceof HTMLButtonElement) ||
        !(editorMessage instanceof HTMLElement) ||
        !(quizForm instanceof HTMLFormElement) ||
        !(quizResult instanceof HTMLElement)
    ) {
        console.error("The website course could not initialise.");
        return;
    }

    const starterHTML = htmlEditor.value;
    const starterCSS = cssEditor.value;

    /**
     * Render the learner's code inside a sandboxed preview.
     * The preview does not receive permission to run JavaScript.
     */
    function renderPreview() {
        const html = htmlEditor.value;
        const css = cssEditor.value;

        const documentContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${css}
</style>
</head>
<body>
${html}
</body>
</html>`;

        previewFrame.srcdoc = documentContent;
        editorMessage.textContent =
            "Preview updated! Keep experimenting with your code.";
    }

    previewButton.addEventListener("click", renderPreview);

    resetButton.addEventListener("click", () => {
        htmlEditor.value = starterHTML;
        cssEditor.value = starterCSS;
        renderPreview();
        editorMessage.textContent =
            "Starter code restored. Try making it your own!";
    });

    quizForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(quizForm);
        const answers = {
            q1: "a",
            q2: "b",
            q3: "c"
        };

        let score = 0;
        let answered = 0;

        for (const [question, correctAnswer] of Object.entries(answers)) {
            const answer = formData.get(question);

            if (answer !== null) {
                answered += 1;

                if (answer === correctAnswer) {
                    score += 1;
                }
            }
        }

        quizResult.classList.remove("success", "retry");

        if (answered < Object.keys(answers).length) {
            quizResult.textContent =
                `You've answered ${answered} of 3 questions. Please answer all three and try again.`;
            quizResult.classList.add("retry");
            return;
        }

        if (score === 3) {
            quizResult.textContent =
                "Excellent! 3 out of 3. You understand the basics of HTML and CSS!";
            quizResult.classList.add("success");
        } else {
            quizResult.textContent =
                `You scored ${score} out of 3. Review the lesson and try again!`;
            quizResult.classList.add("retry");
        }
    });

    renderPreview();
})();