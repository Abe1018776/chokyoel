import { useState } from 'react';
import { Trophy, Loader2, BookOpen, FileText } from 'lucide-react';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { DaySelector } from './components/DaySelector';
import { SectionCard } from './components/SectionCard';
import { SheetViewer } from './components/SheetViewer';
import { AchievementsPanel } from './components/AchievementsPanel';
import { useChok } from './hooks/useChok';

function App() {
  const {
    dailyChok,
    progress,
    selectedDay,
    setSelectedDay,
    isLoading,
    error,
    getSectionsForDay,
    completeSection,
    getCompletedDays,
    isSectionCompleted,
    todayCompletionPercent,
    // Sheet mode
    currentSheet,
    isLoadingSheet,
    useSheetMode,
    setUseSheetMode,
    completeSheetLearning,
    isSheetCompleted,
  } = useChok();

  const [showAchievements, setShowAchievements] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading today's learning...</p>
          <p className="text-2xl font-hebrew mt-2">טוען את הלימוד היומי...</p>
        </div>
      </div>
    );
  }

  if (error || !dailyChok) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <p className="text-red-500 text-lg mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sections = getSectionsForDay(selectedDay);
  const completedDays = getCompletedDays();

  return (
    <div className="min-h-screen bg-parchment-100">
      {/* Header */}
      <Header
        progress={progress}
        parsha={dailyChok.parsha}
        parshaHe={dailyChok.parshaHe}
        hebrewDate={dailyChok.hebrewDate}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Today's Progress */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-700">Today's Progress</h2>
            <button
              onClick={() => setShowAchievements(true)}
              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </button>
          </div>
          <ProgressBar percent={todayCompletionPercent} label="Daily Completion" />
        </div>

        {/* Day Selector */}
        <DaySelector
          currentDay={selectedDay}
          onDayChange={setSelectedDay}
          completedDays={completedDays}
        />

        {/* Day Info + Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Day {selectedDay} - {dailyChok.parsha}
              </h2>
              <p className="text-sm text-gray-500">{dailyChok.gregorianDate}</p>
            </div>
            <div className="text-right font-hebrew">
              <p className="text-lg">{dailyChok.parshaHe}</p>
              <p className="text-sm text-gray-500">יום {selectedDay}</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setUseSheetMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                useSheetMode
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Sefaria Sheet
            </button>
            <button
              onClick={() => setUseSheetMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !useSheetMode
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Section by Section
            </button>
          </div>
        </div>

        {/* Content - Sheet Mode or Section Mode */}
        {useSheetMode ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Chok LeYisrael Sheet from Sefaria
            </h3>
            <SheetViewer
              sheet={currentSheet}
              isLoading={isLoadingSheet}
              onComplete={completeSheetLearning}
              isCompleted={isSheetCompleted()}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Today's Learning Sections
            </h3>
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onComplete={completeSection}
                isCompleted={isSectionCompleted(section.id)}
              />
            ))}
          </div>
        )}

        {/* Completion Message */}
        {todayCompletionPercent === 100 && (
          <div className="mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold mb-1">Mazal Tov!</h3>
            <p className="text-green-100">You've completed today's Chok LeYisrael!</p>
            <p className="font-hebrew text-lg mt-2">יישר כח!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-hebrew text-lg mb-1">חק לישראל</p>
          <p className="text-sm">
            Powered by{' '}
            <a
              href="https://www.sefaria.org/collections/%D7%97%D7%A7-%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-white underline"
            >
              Sefaria's Chok LeYisrael Collection
            </a>
          </p>
          <p className="text-xs mt-2 text-amber-400">
            A daily Torah study program based on the teachings of the Arizal
          </p>
        </div>
      </footer>

      {/* Achievements Modal */}
      <AchievementsPanel
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
    </div>
  );
}

export default App;
