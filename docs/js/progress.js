import { readStorage, storageKeys, writeStorage } from "./storage.js";

export function getProgress(lessonId) {
  const rawProgress = readStorage(storageKeys.progress(lessonId));

  if (!rawProgress) {
    return null;
  }

  try {
    const progress = JSON.parse(rawProgress);
    if (!isValidProgress(progress)) {
      return null;
    }
    return progress;
  } catch (error) {
    console.warn(`Progress for ${lessonId} is invalid.`, error);
    return null;
  }
}

export function isValidProgress(progress) {
  return (
    typeof progress === "object" &&
    progress !== null &&
    typeof progress.completed === "boolean" &&
    Number.isInteger(progress.correct) &&
    Number.isInteger(progress.answered) &&
    Number.isInteger(progress.total) &&
    Number.isInteger(progress.currentIndex)
  );
}

export function saveProgress(lessonId, progress) {
  return writeStorage(storageKeys.progress(lessonId), JSON.stringify(progress));
}

export function resetProgress(lessonId) {
  const progress = {
    completed: false,
    correct: 0,
    answered: 0,
    total: 0,
    currentIndex: 0,
  };
  saveProgress(lessonId, progress);
  return progress;
}
