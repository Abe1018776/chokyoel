import { useState, useEffect, useCallback } from 'react';
import type { DailyChok, ChokSection, UserProgress, SefariaSheet } from '../types';
import { getDailyChok, buildChokSections } from '../services/chokService';
import progressService from '../services/progressService';
import sefariaService from '../services/sefaria';
import { getCurrentParsha } from '../data/parshiyot';

export function useChok() {
  const [dailyChok, setDailyChok] = useState<DailyChok | null>(null);
  const [progress, setProgress] = useState<UserProgress>(progressService.getProgress());
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sheet-based content from Sefaria collection
  const [currentSheet, setCurrentSheet] = useState<SefariaSheet | null>(null);
  const [sheetsByDay, setSheetsByDay] = useState<Map<number, SefariaSheet>>(new Map());
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [useSheetMode, setUseSheetMode] = useState(true); // Toggle between sheet mode and section mode

  // Load initial data
  useEffect(() => {
    async function loadChok() {
      try {
        setIsLoading(true);
        const chok = await getDailyChok();
        setDailyChok(chok);
        setSelectedDay(chok.dayNumber);

        // Try to load Chok sheets from Sefaria collection
        try {
          const sheets = await sefariaService.getChokSheetsByDay(chok.parsha);
          setSheetsByDay(sheets);

          // Set current day's sheet
          const todaySheet = sheets.get(chok.dayNumber);
          if (todaySheet) {
            setCurrentSheet(todaySheet);
          }
        } catch (sheetErr) {
          console.warn('Could not load Chok sheets from collection:', sheetErr);
          setUseSheetMode(false); // Fall back to section mode
        }
      } catch (err) {
        setError('Failed to load daily learning. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadChok();
  }, []);

  // Load sheet when selected day changes
  useEffect(() => {
    if (useSheetMode && sheetsByDay.size > 0) {
      const daySheet = sheetsByDay.get(selectedDay);
      setCurrentSheet(daySheet || null);
    }
  }, [selectedDay, sheetsByDay, useSheetMode]);

  // Fetch a specific sheet by ID
  const fetchSheet = useCallback(async (sheetId: number) => {
    setIsLoadingSheet(true);
    try {
      const sheet = await sefariaService.getSheet(sheetId);
      setCurrentSheet(sheet);
    } catch (err) {
      console.error('Failed to fetch sheet:', err);
    } finally {
      setIsLoadingSheet(false);
    }
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

  // Complete today's sheet learning
  const completeSheetLearning = useCallback(() => {
    if (!dailyChok) return;

    const today = new Date().toISOString().split('T')[0];

    // Mark all sections as completed when sheet is done
    const sectionTypes = ['torah', 'rashi', 'mishnah', 'gemara', 'zohar', 'halacha', 'mussar'];
    sectionTypes.forEach((type, idx) => {
      progressService.completeSection(
        `sheet-${selectedDay}-${idx}`,
        type,
        today,
        dailyChok.parsha,
        selectedDay
      );
    });

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

  // Check if today's sheet is completed
  const isSheetCompleted = useCallback((): boolean => {
    const todayProgress = progressService.getTodayProgress();
    return todayProgress?.isCompleted || false;
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
    // Sheet mode
    currentSheet,
    sheetsByDay,
    isLoadingSheet,
    useSheetMode,
    setUseSheetMode,
    fetchSheet,
    completeSheetLearning,
    isSheetCompleted,
  };
}
