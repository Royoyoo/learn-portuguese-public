import { state } from "./state.js";

export const storageKeys = {
  uiLanguage: "lp:ui_language",
  progress: (lessonId) => `lp:progress:${lessonId}`,
};

export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    state.storageAvailable = false;
    console.warn("localStorage read failed.", error);
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    state.storageAvailable = false;
    console.warn("localStorage write failed.", error);
    return false;
  }
}
