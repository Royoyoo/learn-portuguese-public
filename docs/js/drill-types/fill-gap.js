import { createElement, renderFeedback, renderPrompt } from "../dom.js";
import { t } from "../strings.js";

const gapMarker = "___";

export const fillGapDrillType = {
  type: "fill_gap",
  label: "Fill Gap",
  validateExercise,
  renderExercise,
};

function validateExercise(exercise, index) {
  if (typeof exercise.prompt !== "string" || exercise.prompt.trim() === "") {
    throw new Error(`Exercise ${index} is missing prompt.`);
  }

  if (typeof exercise.sentence !== "string" || exercise.sentence.trim() === "") {
    throw new Error(`Exercise ${index} is missing sentence.`);
  }

  if (countGapMarkers(exercise.sentence) !== 1) {
    throw new Error(`Exercise ${index} sentence must contain exactly one ${gapMarker} marker.`);
  }

  if (!Array.isArray(exercise.options) || ![4, 6].includes(exercise.options.length)) {
    throw new Error(`Exercise ${index} must contain exactly four or six Options.`);
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
  fragment.append(renderPrompt(t("prompt"), exercise.prompt), renderGapSentence(exercise));

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

function renderGapSentence(exercise) {
  const sentence = createElement("p", { className: "gap-sentence" });
  const [sentenceBefore, sentenceAfter] = exercise.sentence.split(gapMarker);

  if (sentenceBefore) {
    sentence.append(document.createTextNode(sentenceBefore));
  }

  sentence.append(createElement("span", { className: "gap-blank", text: gapMarker }));

  if (sentenceAfter) {
    sentence.append(document.createTextNode(sentenceAfter));
  }

  return sentence;
}

function countGapMarkers(sentence) {
  return sentence.split(gapMarker).length - 1;
}
