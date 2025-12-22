import { useState, useEffect, useCallback } from 'react';
import type { DailyChok, ChokSection, UserProgress } from '../types';
import { getDailyChok, buildChokSections } from '../services/chokService';
import progressService from '../services/progressService';
import { getCurrentParsha } from '../data/parshiyot';

export function useChok() {
  const [dailyChok, setDailyChok] = useState<DailyChok | null>(null);
  const [progress, setProgress] = useState<UserProgress>(progressService.getProgress());
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadChok() {
      try {
        setIsLoading(true);
        const chok = await getDailyChok();
        setDailyChok(chok);
        setSelectedDay(chok.dayNumber);
      } catch (err) {
        setError('Failed to load daily learning. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadChok();
  }, []);

  // Get sections for selected day
  const getSectionsForDay = useCallback((day: number): ChokSection[] => {
    const parsha = getCurrentParsha();
    const sections = buildChokSections(parsha, day);

    // Mark completed sections
    return sections.map(section => ({
      ...section,
      isCompleted: progressService.isSectionCompleted(section.id),
    }));
  }, []);

  // Handle section completion
  const completeSection = useCallback((sectionId: string, sectionType: string) => {
    if (!dailyChok) return;

    const today = new Date().toISOString().split('T')[0];
    progressService.completeSection(
      sectionId,
      sectionType,
      today,
      dailyChok.parsha,
      selectedDay
    );

    // Update progress state
    setProgress(progressService.getProgress());
  }, [dailyChok, selectedDay]);

  // Get completed days for current week
  const getCompletedDays = useCallback((): number[] => {
    const progressData = progressService.getProgress();
    const thisWeek = progressData.history.filter(day => {
      const dayDate = new Date(day.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return dayDate >= weekAgo && day.isCompleted;
    });

    return thisWeek.map(day => day.dayNumber);
  }, []);

  // Check if a section is completed
  const isSectionCompleted = useCallback((sectionId: string): boolean => {
    return progressService.isSectionCompleted(sectionId);
  }, []);

  // Get today's completion percentage
  const todayCompletionPercent = progressService.getTodayCompletionPercent();

  return {
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
  };
}
