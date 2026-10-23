
// =========================
// MOBILE NAVIGATION
// =========================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function closeMenu() {
  navLinks.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("active");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
});

// Close the mobile menu after selecting a link.
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close the menu when Escape is pressed.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

// =========================
// INTERACTIVE CODING QUIZ
// =========================

const quizOptions = document.querySelectorAll(".quiz-option");
const quizFeedback = document.getElementById("quiz-feedback");
const resetQuiz = document.getElementById("reset-quiz");

quizOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const isCorrect = option.dataset.answer === "correct";

    // Prevent additional answers after a choice.
    quizOptions.forEach((button) => {
      button.disabled = true;

      if (button.dataset.answer === "correct") {
        button.classList.add("correct");
      }
    });

    quizFeedback.classList.remove("success", "error");

    if (isCorrect) {
      quizFeedback.textContent =
        "🎉 Excellent! Python calculates 2 + 3 and displays 5.";

      quizFeedback.classList.add("success");
    } else {
      option.classList.add("incorrect");

      quizFeedback.textContent =
        "Good try! The correct answer is 5 because Python adds the two numbers.";

      quizFeedback.classList.add("error");
    }
  });
});

// Reset the challenge.
resetQuiz.addEventListener("click", () => {
  quizOptions.forEach((option) => {
    option.disabled = false;
    option.classList.remove("correct", "incorrect");
  });

  quizFeedback.textContent = "";
  quizFeedback.classList.remove("success", "error");
});

// =========================
// AUTOMATIC COPYRIGHT YEAR
// =========================

const currentYear = document.getElementById("current-year");

currentYear.textContent = new Date().getFullYear();