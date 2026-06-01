import { state } from "./state.js";

export const strings = {
  en: {
    appName: "Portuguese Drill App",
    targetLanguage: "Brazilian Portuguese",
    lessons: "Lessons",
    lessonListIntro: "Pick a lesson and practice one Exercise at a time.",
    resume: "Resume",
    home: "Home",
    next: "Next",
    retry: "Try Again",
    complete: "Lesson complete",
    score: "Score",
    progress: "Exercise {current} of {total}",
    loadingLessons: "Loading Lessons...",
    loadingLesson: "Loading Lesson...",
    prompt: "Prompt",
    question: "Question",
    correct: "Correct",
    incorrect: "Incorrect",
    correctAnswer: "Correct answer: {answer}",
    selectLesson: "Open Lesson",
    storageWarning: "Progress cannot be saved in this browser session.",
    emptyLessons: "No Lessons are available for this UI Language.",
    answerPlaceholder: "Build the answer here",
    unsupportedDrillType: "Unsupported Drill Type: {type}",
    validationError: "The Lesson data is not valid.",
    fetchError: "The Lesson data could not load.",
  },
  ru: {
    appName: "Тренажер португальского",
    targetLanguage: "Бразильский португальский",
    lessons: "Уроки",
    lessonListIntro: "Выберите урок и выполняйте упражнения по одному.",
    resume: "Продолжить",
    home: "Главная",
    next: "Далее",
    retry: "Попробовать снова",
    complete: "Урок завершен",
    score: "Счет",
    progress: "Упражнение {current} из {total}",
    loadingLessons: "Загрузка уроков...",
    loadingLesson: "Загрузка урока...",
    prompt: "Задание",
    question: "Вопрос",
    correct: "Верно",
    incorrect: "Неверно",
    correctAnswer: "Правильный ответ: {answer}",
    selectLesson: "Открыть урок",
    storageWarning: "Прогресс нельзя сохранить в этом сеансе браузера.",
    emptyLessons: "Для этого языка интерфейса нет уроков.",
    answerPlaceholder: "Соберите ответ здесь",
    unsupportedDrillType: "Неподдерживаемый тип упражнения: {type}",
    validationError: "Данные урока некорректны.",
    fetchError: "Не удалось загрузить данные урока.",
  },
};

export function t(key, replacements = {}) {
  const languageStrings = strings[state.uiLanguage] || strings.en;
  let value = languageStrings[key];

  if (!value) {
    console.warn(`Missing UI shell string "${key}" for ${state.uiLanguage}.`);
    value = strings.en[key] || key;
  }

  return Object.entries(replacements).reduce(
    (text, [name, replacement]) => text.replace(`{${name}}`, replacement),
    value,
  );
}
