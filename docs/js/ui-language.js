import { state } from "./state.js";
import { readStorage, storageKeys, writeStorage } from "./storage.js";
import { strings } from "./strings.js";

export function loadUiLanguage() {
  const storedLanguage = readStorage(storageKeys.uiLanguage);
  state.uiLanguage = strings[storedLanguage] ? storedLanguage : "en";
}

export function setUiLanguage(uiLanguage) {
  state.uiLanguage = uiLanguage;
  writeStorage(storageKeys.uiLanguage, uiLanguage);
}
