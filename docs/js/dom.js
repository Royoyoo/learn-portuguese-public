import { t } from "./strings.js";

export const app = document.querySelector("#app");

export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  return element;
}

export function setView(view) {
  app.replaceChildren(view);
}

export function showError(message, target = app) {
  const error = createElement("div", {
    className: "error",
    text: message,
    attributes: { role: "alert" },
  });
  target.replaceChildren(error);
}

export function renderPrompt(label, text) {
  const prompt = createElement("div", { className: "prompt" });
  prompt.append(
    createElement("p", { className: "prompt-label", text: label }),
    createElement("p", { className: "prompt-text", text }),
  );
  return prompt;
}

export function renderFeedback(isCorrect, explanation, correctAnswer) {
  const feedback = createElement("div", {
    className: `feedback ${isCorrect ? "correct" : "incorrect"}`,
    attributes: { role: "status" },
  });
  feedback.append(createElement("strong", { text: isCorrect ? t("correct") : t("incorrect") }));

  if (explanation) {
    feedback.append(createElement("p", { text: explanation }));
  }

  if (!isCorrect) {
    feedback.append(
      createElement("p", {
        className: "correct-answer",
        text: t("correctAnswer", { answer: correctAnswer }),
      }),
    );
  }

  return feedback;
}
