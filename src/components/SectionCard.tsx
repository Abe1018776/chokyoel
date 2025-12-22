import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, BookOpen, Loader2 } from 'lucide-react';
import type { ChokSection } from '../types';
import { fetchSectionContent } from '../services/chokService';

interface SectionCardProps {
  section: ChokSection;
  onComplete: (sectionId: string, sectionType: string) => void;
  isCompleted: boolean;
}

const SECTION_ICONS: Record<string, string> = {
  torah: '📖',
  rashi: '📝',
  haftarah: '📜',
  mishnah: '📚',
  gemara: '📕',
  zohar: '✨',
  halacha: '⚖️',
  mussar: '💭',
};

const SECTION_COLORS: Record<string, string> = {
  torah: 'border-blue-500 bg-blue-50',
  rashi: 'border-purple-500 bg-purple-50',
  haftarah: 'border-green-500 bg-green-50',
  mishnah: 'border-orange-500 bg-orange-50',
  gemara: 'border-red-500 bg-red-50',
  zohar: 'border-indigo-500 bg-indigo-50',
  halacha: 'border-teal-500 bg-teal-50',
  mussar: 'border-pink-500 bg-pink-50',
};

export function SectionCard({ section, onComplete, isCompleted }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState(section.content);
  const [isLoading, setIsLoading] = useState(false);
  const [showHebrew, setShowHebrew] = useState(true);

  const handleExpand = async () => {
    if (!isExpanded && !content) {
      setIsLoading(true);
      try {
        const updatedSection = await fetchSectionContent(section);
        setContent(updatedSection.content);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handleComplete = () => {
    if (!isCompleted) {
      onComplete(section.id, section.type);
    }
  };

  const colorClass = SECTION_COLORS[section.type] || 'border-gray-500 bg-gray-50';
  const icon = SECTION_ICONS[section.type] || '📄';

  return (
    <div className={`rounded-lg border-l-4 shadow-sm mb-3 transition-all ${colorClass} ${isCompleted ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={handleExpand}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{section.title.en}</h3>
            <p className="text-sm text-gray-600 font-hebrew">{section.title.he}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCompleted && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <Check className="w-4 h-4" /> Complete
            </span>
          )}
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200/50">
          {/* Reference */}
          <div className="flex items-center justify-between py-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {section.ref}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHebrew(true)}
                className={`px-2 py-1 rounded text-xs ${showHebrew ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
              >
                עברית
              </button>
              <button
                onClick={() => setShowHebrew(false)}
                className={`px-2 py-1 rounded text-xs ${!showHebrew ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Text Content */}
          <div className="mt-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="ml-2 text-gray-500">Loading text...</span>
              </div>
            ) : content ? (
              <div className={showHebrew ? 'hebrew-text' : 'text-gray-700 leading-relaxed'}>
                {showHebrew ? (
                  Array.isArray(content.he) ? (
                    content.he.map((verse, idx) => (
                      <p key={idx} className="verse" dangerouslySetInnerHTML={{ __html: verse }} />
                    ))
                  ) : (
                    <p className="verse" dangerouslySetInnerHTML={{ __html: content.he || '' }} />
                  )
                ) : (
                  Array.isArray(content.en) ? (
                    content.en.map((verse, idx) => (
                      <p key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: verse }} />
                    ))
                  ) : (
                    <p dangerouslySetInnerHTML={{ __html: content.en || 'English translation not available.' }} />
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Click to load content from Sefaria
              </p>
            )}
          </div>

          {/* Complete Button */}
          {!isCompleted && content && (
            <button
              onClick={handleComplete}
              className="mt-4 w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Mark as Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
