import { openDB } from 'idb';

const DB_NAME = 'AgriMentorDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Course Metadata Store
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      // User Progress Store
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'lessonId' });
      }
      // Cached Content Store (Full Lesson Data)
      if (!db.objectStoreNames.contains('lessons')) {
        db.createObjectStore('lessons', { keyPath: 'id' });
      }
    },
  });
};

export const courseDB = {
  async getAllCourses() {
    const db = await initDB();
    return db.getAll('courses');
  },
  async saveCourses(courses) {
    const db = await initDB();
    const tx = db.transaction('courses', 'readwrite');
    for (const course of courses) {
      tx.store.put(course);
    }
    await tx.done;
  },
  async getCourse(id) {
    const db = await initDB();
    return db.get('courses', id);
  },
};

export const progressDB = {
  async getProgress() {
    const db = await initDB();
    return db.getAll('progress');
  },
  async updateProgress(lessonId, status) {
    const db = await initDB();
    return db.put('progress', { lessonId, status, updatedAt: new Date().toISOString() });
  },
  async getLessonProgress(lessonId) {
    const db = await initDB();
    return db.get('progress', lessonId);
  },
};

export const lessonDB = {
  async saveLesson(lesson) {
    const db = await initDB();
    return db.put('lessons', lesson);
  },
  async getLesson(id) {
    const db = await initDB();
    return db.get('lessons', id);
  },
};
