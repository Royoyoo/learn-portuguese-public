import { createElement, setView } from "../dom.js";
import { getDrillType } from "../drill-types/registry.js";
import { getProgress } from "../progress.js";
import { state } from "../state.js";
import { t } from "../strings.js";

export function renderLessonList({ onOpenLesson, onSetUiLanguage }) {
  document.documentElement.lang = state.uiLanguage;
  const view = createElement("main", { className: "view" });
  const topbar = createElement("div", { className: "topbar" });
  const brand = createElement("div", { className: "brand" });
  brand.append(
    createElement("p", { className: "eyebrow", text: t("targetLanguage") }),
    createElement("h1", { text: t("lessons") }),
    createElement("p", { className: "lesson-meta", text: t("lessonListIntro") }),
  );
  topbar.append(brand, renderLanguageToggle(onSetUiLanguage));
  view.append(topbar);

  if (!state.storageAvailable) {
    view.append(createElement("div", { className: "storage-warning", text: t("storageWarning") }));
  }

  const lessons = state.manifest.filter((lesson) => lesson.lang === state.uiLanguage);
  const lessonList = createElement("div", { className: "lesson-list" });

  if (lessons.length === 0) {
    lessonList.append(createElement("p", { className: "lesson-meta", text: t("emptyLessons") }));
  } else {
    lessons.forEach((lesson) => lessonList.append(renderLessonButton(lesson, onOpenLesson)));
  }

  view.append(lessonList);
  setView(view);
}

function renderLanguageToggle(onSetUiLanguage) {
  const toggle = createElement("div", {
    className: "language-toggle",
    attributes: { "aria-label": "UI Language" },
  });

  ["en", "ru"].forEach((uiLanguage) => {
    const button = createElement("button", {
      text: uiLanguage.toUpperCase(),
      attributes: {
        type: "button",
        "aria-pressed": String(state.uiLanguage === uiLanguage),
      },
    });
    button.addEventListener("click", () => onSetUiLanguage(uiLanguage));
    toggle.append(button);
  });

  return toggle;
}

function renderLessonButton(lesson, onOpenLesson) {
  const progress = getProgress(lesson.id);
  const button = createElement("button", {
    className: "lesson-button",
    attributes: { type: "button", "aria-label": `${t("selectLesson")}: ${lesson.title}` },
  });
  const main = createElement("span", { className: "lesson-main" });
  const drillType = getDrillType(lesson.type);
  main.append(
    createElement("span", { className: "lesson-title", text: lesson.title }),
    createElement("span", { className: "lesson-meta", text: drillType?.label || lesson.type }),
  );

  const badgeText = getLessonBadgeText(progress);

  button.append(main);
  if (badgeText) {
    button.append(
      createElement("span", {
        className: "badge",
        text: badgeText,
      }),
    );
  }
  button.addEventListener("click", () => onOpenLesson(lesson.id));
  return button;
}

function getLessonBadgeText(progress) {
  if (!progress) {
    return "";
  }

  if (progress.completed) {
    return `${progress.correct}/${progress.total}`;
  }

  if (progress.currentIndex > 0 || progress.answered > 0) {
    return t("resume");
  }

  return "";
}
