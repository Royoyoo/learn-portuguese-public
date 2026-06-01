import { createElement, setView, showError } from "../dom.js";
import { getDrillType } from "../drill-types/registry.js";
import { getProgress } from "../progress.js";
import { state } from "../state.js";
import { t } from "../strings.js";

export function renderExerciseScreen({ onHome, onNext, onAnswered, onRetry }) {
  if (!state.activeLesson) {
    onHome();
    return;
  }

  if (state.currentIndex >= state.activeLesson.exercises.length) {
    renderCompletionScreen({ onHome, onRetry });
    return;
  }

  state.isAnswered = false;
  const view = renderExerciseViewShell({ onHome });
  const shell = createElement("section", { className: "exercise-shell" });
  const progressText = createElement("p", {
    className: "progress-text",
    text: t("progress", {
      current: state.currentIndex + 1,
      total: state.activeLesson.exercises.length,
    }),
  });
  shell.append(progressText);

  const drillType = getDrillType(state.activeLesson.type);
  if (!drillType) {
    shell.append(
      createElement("div", {
        className: "error",
        text: t("unsupportedDrillType", { type: state.activeLesson.type }),
      }),
    );
  } else {
    const exercise = state.activeLesson.exercises[state.currentIndex];
    shell.append(
      drillType.renderExercise({
        exercise,
        getIsAnswered: () => state.isAnswered,
        onAnswered,
        renderNextButton: () => renderNextButton(onNext),
      }),
    );
  }

  view.append(shell);
  setView(view);
}

export function renderCompletionScreen({ onHome, onRetry }) {
  const view = renderExerciseViewShell({ onHome });
  const progress = state.activeLesson ? getProgress(state.activeLesson.id) : null;
  const correct = progress?.correct ?? state.correct;
  const total = progress?.total ?? state.activeLesson?.exercises.length ?? 0;
  const completion = createElement("section", { className: "completion" });
  completion.append(
    createElement("p", { className: "eyebrow", text: t("score") }),
    createElement("h2", { text: t("complete") }),
    createElement("p", { className: "score", text: `${correct}/${total}` }),
  );

  const actions = createElement("div", { className: "actions" });
  const retryButton = createElement("button", {
    className: "primary-button",
    text: t("retry"),
    attributes: { type: "button" },
  });
  retryButton.addEventListener("click", () => {
    if (onRetry) {
      onRetry();
      return;
    }
    onHome();
  });

  const homeButton = createElement("button", {
    className: "secondary-button",
    text: t("home"),
    attributes: { type: "button" },
  });
  homeButton.addEventListener("click", onHome);
  actions.append(retryButton, homeButton);
  completion.append(actions);
  view.append(completion);
  setView(view);
}

export function renderExerciseError(message, { onHome }) {
  const view = renderExerciseViewShell({ onHome });
  showError(message, view);
  setView(view);
}

function renderExerciseViewShell({ onHome }) {
  const view = createElement("main", { className: "view" });
  const header = createElement("div", { className: "exercise-header" });
  const homeButton = createElement("button", {
    className: "icon-button",
    text: "←",
    attributes: { type: "button", title: t("home"), "aria-label": t("home") },
  });
  homeButton.addEventListener("click", onHome);

  const title = createElement("h1", {
    text: state.activeLesson?.title || t("lessons"),
  });
  header.append(homeButton, title);
  view.append(header);
  return view;
}

function renderNextButton(onNext) {
  const button = createElement("button", {
    className: "primary-button",
    text: t("next"),
    attributes: { type: "button" },
  });
  button.addEventListener("click", onNext);
  return button;
}
