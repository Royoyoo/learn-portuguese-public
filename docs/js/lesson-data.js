import { getDrillType } from "./drill-types/registry.js";

export async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Fetch failed for ${path}: ${response.status}`);
  }
  return response.json();
}

export function validateManifest(manifest) {
  if (!Array.isArray(manifest)) {
    throw new Error("Lesson Manifest must be an array.");
  }

  manifest.forEach((entry, index) => {
    const requiredFields = ["id", "title", "type", "lang"];
    requiredFields.forEach((field) => {
      if (typeof entry[field] !== "string" || entry[field].trim() === "") {
        throw new Error(`Lesson Manifest entry ${index} is missing ${field}.`);
      }
    });

    if (!getDrillType(entry.type)) {
      throw new Error(`Lesson Manifest entry ${entry.id} has an invalid Drill Type.`);
    }
  });
}

export function validateLesson(lesson) {
  const requiredFields = ["id", "title", "type", "lang"];
  requiredFields.forEach((field) => {
    if (typeof lesson[field] !== "string" || lesson[field].trim() === "") {
      throw new Error(`Lesson File is missing ${field}.`);
    }
  });

  const drillType = getDrillType(lesson.type);
  if (!drillType) {
    throw new Error(`Lesson File has an invalid Drill Type: ${lesson.type}.`);
  }

  if (!Array.isArray(lesson.exercises) || lesson.exercises.length === 0) {
    throw new Error("Lesson File must contain at least one Exercise.");
  }

  lesson.exercises.forEach((exercise, index) => {
    drillType.validateExercise(exercise, index);
  });
}
