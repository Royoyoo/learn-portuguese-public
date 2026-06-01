import { createElement, renderFeedback, renderPrompt } from "../dom.js";
import { t } from "../strings.js";

export const wordBlocksDrillType = {
  type: "word_blocks",
  label: "Word Blocks",
  validateExercise,
  renderExercise,
};

function validateExercise(exercise, index) {
  if (typeof exercise.prompt !== "string" || exercise.prompt.trim() === "") {
    throw new Error(`Exercise ${index} is missing prompt.`);
  }

  if (typeof exercise.answer !== "string" || exercise.answer.trim() === "") {
    throw new Error(`Exercise ${index} is missing answer.`);
  }

  if (!Array.isArray(exercise.distractors)) {
    throw new Error(`Exercise ${index} is missing Distractors.`);
  }

  exercise.distractors.forEach((distractor, distractorIndex) => {
    if (typeof distractor !== "string" || distractor.trim() === "") {
      throw new Error(`Distractor ${distractorIndex} in Exercise ${index} is invalid.`);
    }
  });
}

function renderExercise({ exercise, getIsAnswered, onAnswered, renderNextButton }) {
  const fragment = document.createDocumentFragment();
  fragment.append(renderPrompt(t("prompt"), exercise.prompt));

  const wordBlocks = createElement("div", { className: "word-blocks" });
  const answerRow = createElement("div", {
    className: "answer-row",
    attributes: { "aria-label": t("answerPlaceholder") },
  });
  const tokenPool = createElement("div", { className: "token-pool" });
  const feedbackContainer = createElement("div");
  const actions = createElement("div", { className: "actions" });
  const answerTokens = tokenizeAnswer(exercise.answer);
  const placedTokens = [];
  const poolTokens = shuffleTokens([
    ...answerTokens.map((token, index) => ({ id: `answer-${index}`, text: token })),
    ...exercise.distractors.map((token, index) => ({ id: `distractor-${index}`, text: token })),
  ]);

  function renderRows() {
    answerRow.replaceChildren();
    tokenPool.replaceChildren();

    if (placedTokens.length === 0) {
      answerRow.append(createElement("span", { className: "empty-row", text: t("answerPlaceholder") }));
    }

    placedTokens.forEach((token, index) => {
      const button = createElement("button", {
        className: "token-button",
        text: token.text,
        attributes: { type: "button" },
      });
      button.disabled = getIsAnswered();
      button.addEventListener("click", () => {
        if (getIsAnswered()) {
          return;
        }
        poolTokens.push(...placedTokens.splice(index, 1));
        renderRows();
      });
      answerRow.append(button);
    });

    poolTokens.forEach((token, index) => {
      const button = createElement("button", {
        className: "token-button",
        text: token.text,
        attributes: { type: "button" },
      });
      button.disabled = getIsAnswered();
      button.addEventListener("click", () => {
        if (getIsAnswered()) {
          return;
        }
        placedTokens.push(...poolTokens.splice(index, 1));
        renderRows();
        maybeValidateWordBlocks();
      });
      tokenPool.append(button);
    });
  }

  function maybeValidateWordBlocks() {
    if (placedTokens.length !== answerTokens.length || getIsAnswered()) {
      return;
    }

    const learnerAnswer = placedTokens.map((token) => token.text).join(" ");
    const isCorrect = normalizeAnswer(learnerAnswer) === normalizeAnswer(exercise.answer);
    answerRow.classList.add(isCorrect ? "correct" : "incorrect");
    onAnswered(isCorrect);
    renderRows();
    feedbackContainer.replaceChildren(renderFeedback(isCorrect, "", exercise.answer));
    actions.replaceChildren(renderNextButton());
  }

  renderRows();
  wordBlocks.append(answerRow, tokenPool);
  fragment.append(wordBlocks, feedbackContainer, actions);
  return fragment;
}

function tokenizeAnswer(answer) {
  return answer.trim().split(/\s+/);
}

function normalizeAnswer(answer) {
  return answer.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function shuffleTokens(tokens) {
  const shuffled = [...tokens];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}
