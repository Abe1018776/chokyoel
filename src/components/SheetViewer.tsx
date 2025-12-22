import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react';
import type { SefariaSheet, SefariaSheetSource } from '../types';

interface SheetViewerProps {
  sheet: SefariaSheet | null;
  isLoading: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
}

function SourceBlock({ source }: { source: SefariaSheetSource }) {
  const [showHebrew, setShowHebrew] = useState(true);

  // Handle different source types
  const hasText = source.text?.he || source.text?.en;
  const hasBiText = source.outsideBiText?.he || source.outsideBiText?.en;
  const hasOutsideText = source.outsideText;
  const hasComment = source.comment;

  if (!hasText && !hasBiText && !hasOutsideText && !hasComment) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
      {/* Reference header */}
      {source.ref && (
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
          <a
            href={`https://www.sefaria.org/${source.ref.replace(/ /g, '_')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            {source.heRef || source.ref}
            <ExternalLink className="w-3 h-3" />
          </a>
          {hasText && (
            <div className="flex gap-1">
              <button
                onClick={() => setShowHebrew(true)}
                className={`px-2 py-0.5 rounded text-xs ${showHebrew ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}
              >
                עברית
              </button>
              <button
                onClick={() => setShowHebrew(false)}
                className={`px-2 py-0.5 rounded text-xs ${!showHebrew ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}
              >
                EN
              </button>
            </div>
          )}
        </div>
      )}

      {/* Text content */}
      {hasText && (
        <div className={showHebrew ? 'hebrew-text' : 'text-gray-700 leading-relaxed'}>
          <div
            dangerouslySetInnerHTML={{
              __html: showHebrew ? (source.text?.he || '') : (source.text?.en || 'Translation not available')
            }}
          />
        </div>
      )}

      {/* BiText (outside bilingual text) */}
      {hasBiText && (
        <div className={showHebrew ? 'hebrew-text' : 'text-gray-700 leading-relaxed'}>
          <div
            dangerouslySetInnerHTML={{
              __html: showHebrew ? (source.outsideBiText?.he || '') : (source.outsideBiText?.en || '')
            }}
          />
        </div>
      )}

      {/* Outside text (usually headers or custom text) */}
      {hasOutsideText && source.outsideText && (
        <div
          className="text-gray-800 font-medium"
          dangerouslySetInnerHTML={{ __html: source.outsideText }}
        />
      )}

      {/* Comment */}
      {hasComment && source.comment && (
        <div
          className="mt-2 text-gray-600 italic text-sm border-l-2 border-amber-300 pl-3"
          dangerouslySetInnerHTML={{ __html: source.comment }}
        />
      )}
    </div>
  );
}

export function SheetViewer({ sheet, isLoading, onComplete, isCompleted }: SheetViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="ml-3 text-gray-600">Loading Chok LeYisrael sheet...</span>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        <p>No Chok LeYisrael sheet found for this day.</p>
        <p className="text-sm mt-2">The sheet may not be available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Sheet Header */}
      <div
        className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 cursor-pointer hover:from-amber-100 hover:to-amber-200 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-amber-900 font-hebrew">
              {sheet.title}
            </h2>
            {sheet.summary && (
              <p className="text-sm text-amber-700 mt-1">{sheet.summary}</p>
            )}
            <p className="text-xs text-amber-600 mt-1">
              {sheet.sources.length} sections • {sheet.views} views
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                ✓ Completed
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-amber-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-amber-600" />
            )}
          </div>
        </div>
      </div>

      {/* Sheet Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Sources */}
          <div className="space-y-2">
            {sheet.sources.map((source, idx) => (
              <SourceBlock key={idx} source={source} />
            ))}
          </div>

          {/* Complete Button */}
          {!isCompleted && onComplete && (
            <button
              onClick={onComplete}
              className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
            >
              ✓ Mark Today's Learning Complete
            </button>
          )}

          {/* Sefaria Link */}
          <div className="mt-4 text-center">
            <a
              href={`https://www.sefaria.org/sheets/${sheet.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center justify-center gap-1"
            >
              View on Sefaria <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
