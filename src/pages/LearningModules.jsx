import React, { useState, useEffect } from 'react';
import DashboardLayout from "../layouts/DashboardLayout";
import { useLearningSync } from '../hooks/useLearningSync';
import { BookOpen, CheckCircle, WifiOff, Loader2, ChevronRight, PlayCircle, FileText, BarChart } from 'lucide-react';
import axios from 'axios';
import { lessonDB } from '../db/learningDB';

// Offline Indicator Component
const OfflineIndicator = ({ isOffline }) => (
  <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${isOffline ? 'bg-orange-500 text-white' : 'bg-green-500 text-white opacity-0 pointer-events-none'}`}>
    <WifiOff size={18} />
    <span className="text-sm font-medium">Offline Mode</span>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
    <div 
      className="bg-green-500 h-2.5 transition-all duration-500 ease-out" 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

// Lesson Viewer Component
const LessonViewer = ({ lesson, onComplete, isCompleted, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-10">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-green-50">
          <div className="flex items-center gap-3">
            {lesson.type === 'video' ? <PlayCircle className="text-green-600" /> : <FileText className="text-green-600" />}
            <h3 className="text-xl font-bold text-gray-800">{lesson.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronRight className="rotate-90" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          {lesson.type === 'video' ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black mb-6">
              <iframe 
                src={lesson.content} 
                className="w-full h-full" 
                title={lesson.title}
                allowFullScreen
              />
            </div>
          ) : (
            <div className="prose prose-green max-w-none text-gray-700 leading-relaxed">
              {lesson.content}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => { onComplete(lesson.id); onClose(); }}
            disabled={isCompleted}
            className={`px-8 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isCompleted ? 'bg-green-100 text-green-600 cursor-default' : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg'}`}
          >
            {isCompleted ? <CheckCircle size={18} /> : null}
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Course Detail View Component
const CourseDetail = ({ course, progress, onLessonClick, onClose }) => {
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = course.modules.reduce((acc, m) => 
    acc + m.lessons.filter(l => progress[l.id] === 'completed').length, 0
  );
  const percentComplete = Math.round((completedLessons / totalLessons) * 100) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col md:flex-row animate-in fade-in duration-300">
      {/* Sidebar - Course Structure */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-white">
          <button onClick={onClose} className="flex items-center gap-2 text-green-600 font-bold mb-4 hover:gap-1 transition-all">
            <ChevronRight className="rotate-180" size={18} />
            Back to Courses
          </button>
          <h2 className="text-xl font-bold text-gray-800 leading-tight mb-2">{course.title}</h2>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span className="font-bold text-green-600">{percentComplete}%</span>
          </div>
          <ProgressBar progress={percentComplete} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {course.modules.map((module, idx) => (
            <div key={module.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <h4 className="font-bold text-gray-700 text-sm">{module.title}</h4>
              </div>
              <div className="divide-y divide-gray-50">
                {module.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonClick(lesson)}
                    className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      {progress[lesson.id] === 'completed' ? (
                        <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 group-hover:border-green-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${progress[lesson.id] === 'completed' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {lesson.title}
                      </span>
                    </div>
                    {lesson.type === 'video' ? <PlayCircle size={14} className="text-gray-400" /> : <FileText size={14} className="text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area - Welcome Screen or Current Lesson placeholder */}
      <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center p-10 text-center relative">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-6">
            <BookOpen size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Select a lesson to begin</h3>
          <p className="text-gray-500 leading-relaxed">
            Choose from the course curriculum on the left to start your learning journey. Your progress is automatically saved offline.
          </p>
        </div>
        
        {/* Course Banner - Hidden on mobile if needed */}
        <div className="absolute top-10 left-10 right-10 bottom-10 opacity-5 pointer-events-none overflow-hidden rounded-3xl">
          <img src={course.image} alt="" className="w-full h-full object-cover grayscale" />
        </div>
      </div>
    </div>
  );
};

// Learning Card Component
const LearningCard = ({ course, progress, onClick }) => {
  const completedLessons = Object.keys(progress).filter(id => id.startsWith(course.id.split('-')[0]) && progress[id] === 'completed').length;
  // This is a simplified progress calculation for the card
  const mockTotal = 5; 
  const percentComplete = Math.round((completedLessons / mockTotal) * 100) || 0;

  return (
    <div 
      onClick={() => onClick(course)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group cursor-pointer flex flex-col h-full"
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
          <span className="text-white font-bold flex items-center gap-2">
            Continue Learning <ChevronRight size={18} />
          </span>
        </div>
        {percentComplete > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-600 flex items-center gap-1 shadow-sm">
            <CheckCircle size={12} /> {percentComplete}% Done
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase tracking-wider">Course</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">{course.title}</h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{course.description}</p>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
            <span>Progress</span>
            <span>{percentComplete}%</span>
          </div>
          <ProgressBar progress={percentComplete} />
        </div>
      </div>
    </div>
  );
};

function LearningModules() {
  const { courses, progress, isOffline, syncing, updateLessonProgress } = useLearningSync();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeCourseData, setActiveCourseData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch full course data when a course is clicked
  const handleCourseClick = async (course) => {
    setLoading(true);
    try {
      // Try local cache first
      let fullData = await lessonDB.getLesson(course.id);
      
      if (!fullData && !isOffline) {
        const response = await axios.get(`/api/learning/${course.id}`);
        fullData = response.data;
        await lessonDB.saveLesson(fullData);
      }
      
      if (fullData) {
        setActiveCourseData(fullData);
        setSelectedCourse(course);
      }
    } catch (err) {
      console.error("Failed to load course details", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <OfflineIndicator isOffline={isOffline} />

      {/* Header */}
      <header className="bg-white py-8 px-10 border-b border-gray-100 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Learning Modules
          </h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <BookOpen size={16} /> Expand your agricultural knowledge
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {syncing && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold">
              <Loader2 className="animate-spin" size={16} /> Syncing...
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg">
              <BarChart size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800 leading-none">
                {Object.values(progress).filter(v => v === 'completed').length}
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lessons Done</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-10 bg-gray-50 min-h-screen">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 text-green-600 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-bold text-xl animate-pulse">Loading course data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {courses.map((course) => (
              <LearningCard 
                key={course.id} 
                course={course} 
                progress={progress}
                onClick={handleCourseClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Course Detail View */}
      {selectedCourse && activeCourseData && (
        <CourseDetail 
          course={activeCourseData} 
          progress={progress}
          onLessonClick={setActiveLesson}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* Lesson Viewer */}
      {activeLesson && (
        <LessonViewer 
          lesson={activeLesson}
          isCompleted={progress[activeLesson.id] === 'completed'}
          onComplete={(id) => updateLessonProgress(id, 'completed')}
          onClose={() => setActiveLesson(null)}
        />
      )}

    </DashboardLayout>
  );
}

export default LearningModules;