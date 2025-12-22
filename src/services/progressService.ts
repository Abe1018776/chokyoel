import type { UserProgress, DayProgress, SectionProgress } from '../types';

const STORAGE_KEY = 'chok_leyisrael_progress';

// Default user progress
const defaultProgress: UserProgress = {
  totalDaysCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalSectionsCompleted: 0,
  lastCompletedDate: null,
  history: [],
  points: 0,
  level: 1,
  achievements: [],
};

// Points for different section types
const SECTION_POINTS: Record<string, number> = {
  torah: 10,
  rashi: 15,
  haftarah: 10,
  mishnah: 12,
  gemara: 20,
  zohar: 15,
  halacha: 8,
  mussar: 8,
};

// Achievements
const ACHIEVEMENTS = {
  FIRST_DAY: { id: 'first_day', name: 'First Steps', description: 'Complete your first day of Chok LeYisrael', icon: '🌱' },
  WEEK_STREAK: { id: 'week_streak', name: 'Week Warrior', description: 'Complete 7 days in a row', icon: '🔥' },
  MONTH_STREAK: { id: 'month_streak', name: 'Monthly Master', description: 'Complete 30 days in a row', icon: '🏆' },
  PARSHA_COMPLETE: { id: 'parsha_complete', name: 'Parsha Pro', description: 'Complete an entire parsha', icon: '📜' },
  HUNDRED_SECTIONS: { id: 'hundred_sections', name: 'Century Scholar', description: 'Complete 100 sections', icon: '💯' },
  LEVEL_5: { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
  LEVEL_10: { id: 'level_10', name: 'Torah Scholar', description: 'Reach level 10', icon: '🎓' },
};

class ProgressService {
  private progress: UserProgress;

  constructor() {
    this.progress = this.loadProgress();
  }

  private loadProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultProgress, ...JSON.parse(stored) };
      }
    } catch {
      console.error('Failed to load progress from localStorage');
    }
    return { ...defaultProgress };
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {
      console.error('Failed to save progress to localStorage');
    }
  }

  getProgress(): UserProgress {
    return { ...this.progress };
  }

  // Mark a section as completed
  completeSection(sectionId: string, sectionType: string, date: string, parsha: string, dayNumber: number): void {
    const sectionProgress: SectionProgress = {
      sectionId,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: 0, // Could track actual time in future
    };

    // Find or create day progress
    let dayProgress = this.progress.history.find(d => d.date === date);
    if (!dayProgress) {
      dayProgress = {
        date,
        parsha,
        dayNumber,
        sections: [],
        isCompleted: false,
      };
      this.progress.history.push(dayProgress);
    }

    // Check if section already completed
    if (dayProgress.sections.some(s => s.sectionId === sectionId)) {
      return; // Already completed
    }

    dayProgress.sections.push(sectionProgress);
    this.progress.totalSectionsCompleted++;

    // Add points
    const points = SECTION_POINTS[sectionType] || 10;
    this.progress.points += points;

    // Check for level up (every 100 points)
    const newLevel = Math.floor(this.progress.points / 100) + 1;
    if (newLevel > this.progress.level) {
      this.progress.level = newLevel;
      this.checkLevelAchievements();
    }

    // Check if day is complete (all 7 or 8 sections)
    if (dayProgress.sections.length >= 7) {
      this.completeDay(date);
    }

    this.checkAchievements();
    this.saveProgress();
  }

  private completeDay(date: string): void {
    const dayProgress = this.progress.history.find(d => d.date === date);
    if (!dayProgress || dayProgress.isCompleted) return;

    dayProgress.isCompleted = true;
    this.progress.totalDaysCompleted++;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (this.progress.lastCompletedDate === yesterday || this.progress.lastCompletedDate === null) {
      this.progress.currentStreak++;
    } else if (this.progress.lastCompletedDate !== today) {
      this.progress.currentStreak = 1;
    }

    if (this.progress.currentStreak > this.progress.longestStreak) {
      this.progress.longestStreak = this.progress.currentStreak;
    }

    this.progress.lastCompletedDate = today;

    // Bonus points for completing a day
    this.progress.points += 25;
  }

  private checkAchievements(): void {
    const { achievements, totalDaysCompleted, currentStreak, totalSectionsCompleted } = this.progress;

    // First day
    if (totalDaysCompleted >= 1 && !achievements.includes(ACHIEVEMENTS.FIRST_DAY.id)) {
      achievements.push(ACHIEVEMENTS.FIRST_DAY.id);
    }

    // Week streak
    if (currentStreak >= 7 && !achievements.includes(ACHIEVEMENTS.WEEK_STREAK.id)) {
      achievements.push(ACHIEVEMENTS.WEEK_STREAK.id);
      this.progress.points += 50;
    }

    // Month streak
    if (currentStreak >= 30 && !achievements.includes(ACHIEVEMENTS.MONTH_STREAK.id)) {
      achievements.push(ACHIEVEMENTS.MONTH_STREAK.id);
      this.progress.points += 200;
    }

    // 100 sections
    if (totalSectionsCompleted >= 100 && !achievements.includes(ACHIEVEMENTS.HUNDRED_SECTIONS.id)) {
      achievements.push(ACHIEVEMENTS.HUNDRED_SECTIONS.id);
      this.progress.points += 100;
    }
  }

  private checkLevelAchievements(): void {
    const { achievements, level } = this.progress;

    if (level >= 5 && !achievements.includes(ACHIEVEMENTS.LEVEL_5.id)) {
      achievements.push(ACHIEVEMENTS.LEVEL_5.id);
    }

    if (level >= 10 && !achievements.includes(ACHIEVEMENTS.LEVEL_10.id)) {
      achievements.push(ACHIEVEMENTS.LEVEL_10.id);
    }
  }

  // Check if a section is completed for today
  isSectionCompleted(sectionId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const dayProgress = this.progress.history.find(d => d.date === today);
    return dayProgress?.sections.some(s => s.sectionId === sectionId) || false;
  }

  // Get today's progress
  getTodayProgress(): DayProgress | null {
    const today = new Date().toISOString().split('T')[0];
    return this.progress.history.find(d => d.date === today) || null;
  }

  // Get completion percentage for today
  getTodayCompletionPercent(): number {
    const today = this.getTodayProgress();
    if (!today) return 0;
    return Math.round((today.sections.length / 7) * 100);
  }

  // Reset progress (for testing)
  resetProgress(): void {
    this.progress = { ...defaultProgress };
    this.saveProgress();
  }

  // Get all achievements with their status
  getAllAchievements() {
    return Object.values(ACHIEVEMENTS).map(a => ({
      ...a,
      unlocked: this.progress.achievements.includes(a.id),
    }));
  }
}

export const progressService = new ProgressService();
export { ACHIEVEMENTS };
export default progressService;
