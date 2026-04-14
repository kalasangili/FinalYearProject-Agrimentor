import { useState, useEffect } from 'react';
import axios from 'axios';
import { courseDB, progressDB } from '../db/learningDB';

export const useLearningSync = () => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadInitialData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadInitialData = async () => {
    // Load local courses
    const localCourses = await courseDB.getAllCourses();
    if (localCourses.length > 0) setCourses(localCourses);

    // Load local progress
    const localProgress = await progressDB.getProgress();
    const progressMap = {};
    localProgress.forEach(p => {
      progressMap[p.lessonId] = p.status;
    });
    setProgress(progressMap);

    // Sync if online
    if (navigator.onLine) {
      syncWithAPI();
    }
  };

  const syncWithAPI = async () => {
    setSyncing(true);
    try {
      // 1. Fetch latest courses
      const response = await axios.get('/api/learning');
      const apiCourses = response.data;
      
      // Update local storage
      await courseDB.saveCourses(apiCourses);
      setCourses(apiCourses);

      // 2. Sync local progress to backend
      const localProgress = await progressDB.getProgress();
      if (localProgress.length > 0) {
        await axios.post('/api/learning/sync-progress', { progress: localProgress });
      }

      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setSyncing(false);
    }
  };

  const updateLessonProgress = async (lessonId, status) => {
    // Update local state
    setProgress(prev => ({ ...prev, [lessonId]: status }));
    // Update local DB
    await progressDB.updateProgress(lessonId, status);
    
    // Attempt to sync to backend if online
    if (navigator.onLine) {
      try {
        await axios.post('/api/learning/sync-progress', { 
          progress: [{ lessonId, status, updatedAt: new Date().toISOString() }] 
        });
      } catch (error) {
        console.warn('Sync to backend failed, will retry later', error);
      }
    }
  };

  return { courses, progress, isOffline, syncing, updateLessonProgress };
};
