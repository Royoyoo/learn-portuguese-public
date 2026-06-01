import { createElement, setView, showError } from "./dom.js";
import { loadJson, validateLesson, validateManifest } from "./lesson-data.js";
import { getProgress, resetProgress, saveProgress } from "./progress.js";
import { state } from "./state.js";
import { t } from "./strings.js";
import { loadUiLanguage, setUiLanguage } from "./ui-language.js";
import { renderCompletionScreen, renderExerciseError, renderExerciseScreen } from "./views/exercise-screen.js";
import { renderLessonList } from "./views/lesson-list.js";

const lessonHashPrefix = "#lesson=";

async function initialize() {
  loadUiLanguage();
  await loadManifest();
  route();
}

async function loadManifest() {
  setView(createElement("p", { text: t("loadingLessons") }));

  try {
    const manifest = await loadJson("manifest.json");
    validateManifest(manifest);
    state.manifest = manifest;
  } catch (error) {
    console.error(error);
    showError(t("fetchError"));
  }
}

function route() {
  const lessonId = getLessonIdFromHash();
  if (lessonId) {
    openLesson(lessonId, { updateHash: false });
    return;
  }

  showLessonList();
}

function getLessonIdFromHash() {
  if (!window.location.hash.startsWith(lessonHashPrefix)) {
    return "";
  }

  return decodeURIComponent(window.location.hash.slice(lessonHashPrefix.length));
}

function showLessonList() {
  document.documentElement.lang = state.uiLanguage;
  renderLessonList({
    onOpenLesson: (lessonId) => openLesson(lessonId),
    onSetUiLanguage: handleSetUiLanguage,
  });
}

function goHome() {
  state.activeLesson = null;
  if (window.location.hash) {
    window.location.hash = "";
    return;
  }

  showLessonList();
}

function handleSetUiLanguage(uiLanguage) {
  setUiLanguage(uiLanguage);
  showLessonList();
}

async function openLesson(lessonId, { updateHash = true } = {}) {
  if (updateHash) {
    const nextHash = `${lessonHashPrefix}${encodeURIComponent(lessonId)}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }
  }

  setView(createElement("p", { text: t("loadingLesson") }));

  try {
    const lesson = await loadJson(`lessons/${lessonId}.json`);
    validateLesson(lesson);
    state.activeLesson = lesson;
    if (lesson.lang !== state.uiLanguage) {
      setUiLanguage(lesson.lang);
    }
    document.documentElement.lang = state.uiLanguage;
    const progress = getProgress(lessonId);

    if (progress && progress.completed) {
      state.currentIndex = lesson.exercises.length;
      state.correct = progress.correct;
      state.answered = progress.answered;
      renderCompletionScreen({ onHome: goHome, onRetry: retryActiveLesson });
      return;
    }

    state.currentIndex = Math.min(progress?.currentIndex || 0, lesson.exercises.length);
    state.correct = progress?.correct || 0;
    state.answered = progress?.answered || 0;
    renderActiveExercise();
  } catch (error) {
    console.error(error);
    state.activeLesson = null;
    renderExerciseError(t("fetchError"), { onHome: goHome });
  }
}

function renderActiveExercise() {
  renderExerciseScreen({
    onHome: goHome,
    onNext: goToNextExercise,
    onAnswered: completeExercise,
    onRetry: retryActiveLesson,
  });
}

function completeExercise(isCorrect) {
  state.isAnswered = true;
  const nextIndex = Math.min(state.currentIndex + 1, state.activeLesson.exercises.length);
  state.correct += isCorrect ? 1 : 0;
  state.answered += 1;

  saveProgress(state.activeLesson.id, {
    completed: nextIndex === state.activeLesson.exercises.length,
    correct: state.correct,
    answered: state.answered,
    total: state.activeLesson.exercises.length,
    currentIndex: nextIndex,
  });
}

function goToNextExercise() {
  state.currentIndex += 1;
  renderActiveExercise();
}

function retryActiveLesson() {
  if (!state.activeLesson) {
    goHome();
    return;
  }

  resetProgress(state.activeLesson.id);
  state.currentIndex = 0;
  state.correct = 0;
  state.answered = 0;
  renderActiveExercise();
}

window.addEventListener("hashchange", route);

initialize();
