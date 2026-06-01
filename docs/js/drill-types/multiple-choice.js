import { createElement, renderFeedback, renderPrompt } from "../dom.js";
import { t } from "../strings.js";

export const multipleChoiceDrillType = {
  type: "multiple_choice",
  label: "Multiple Choice",
  validateExercise,
  renderExercise,
};

function validateExercise(exercise, index) {
  if (typeof exercise.question !== "string" || exercise.question.trim() === "") {
    throw new Error(`Exercise ${index} is missing question.`);
  }

  if (!Array.isArray(exercise.options) || exercise.options.length !== 4) {
    throw new Error(`Exercise ${index} must contain exactly four Options.`);
  }

  exercise.options.forEach((option, optionIndex) => {
    if (typeof option !== "string" || option.trim() === "") {
      throw new Error(`Option ${optionIndex} in Exercise ${index} is invalid.`);
    }
  });

  if (
    !Number.isInteger(exercise.correct) ||
    exercise.correct < 0 ||
    exercise.correct >= exercise.options.length
  ) {
    throw new Error(`Exercise ${index} has an invalid correct Option index.`);
  }

  if (typeof exercise.explanation !== "string") {
    throw new Error(`Exercise ${index} is missing explanation.`);
  }
}

function renderExercise({ exercise, getIsAnswered, onAnswered, renderNextButton }) {
  const fragment = document.createDocumentFragment();
  fragment.append(renderPrompt(t("question"), exercise.question));

  const optionList = createElement("div", { className: "option-list" });
  const feedbackContainer = createElement("div");
  const actions = createElement("div", { className: "actions" });

  exercise.options.forEach((option, optionIndex) => {
    const button = createElement("button", {
      className: "option-button",
      text: option,
      attributes: { type: "button" },
    });
    button.addEventListener("click", () => {
      if (getIsAnswered()) {
        return;
      }

      const isCorrect = optionIndex === exercise.correct;
      optionList.querySelectorAll("button").forEach((optionButton, index) => {
        optionButton.disabled = true;
        if (index === exercise.correct) {
          optionButton.classList.add("correct");
        }
        if (index === optionIndex && !isCorrect) {
          optionButton.classList.add("incorrect");
        }
      });

      onAnswered(isCorrect);
      feedbackContainer.replaceChildren(
        renderFeedback(isCorrect, exercise.explanation, exercise.options[exercise.correct]),
      );
      actions.replaceChildren(renderNextButton());
    });
    optionList.append(button);
  });

  fragment.append(optionList, actions, feedbackContainer);
  return fragment;
}
