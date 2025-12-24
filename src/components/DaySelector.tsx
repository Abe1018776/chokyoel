import { Sun, Moon, Zap, Coffee, Book, Star, Crown } from 'lucide-react';

interface DaySelectorProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  completedDays: number[];
}

const DAYS = [
  { num: 1, en: 'Sunday', he: 'ראשון', icon: Sun, color: 'text-yellow-500' },
  { num: 2, en: 'Monday', he: 'שני', icon: Moon, color: 'text-blue-500' },
  { num: 3, en: 'Tuesday', he: 'שלישי', icon: Zap, color: 'text-purple-500' },
  { num: 4, en: 'Wednesday', he: 'רביעי', icon: Coffee, color: 'text-brown-500' },
  { num: 5, en: 'Thursday', he: 'חמישי', icon: Book, color: 'text-green-500' },
  { num: 6, en: 'Friday', he: 'שישי', icon: Star, color: 'text-pink-500' },
  { num: 7, en: 'Shabbat', he: 'שבת', icon: Crown, color: 'text-gold-500' },
];

export function DaySelector({ currentDay, onDayChange, completedDays }: DaySelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Choose Your Day</h3>
      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day) => {
          const isActive = currentDay === day.num;
          const isCompleted = completedDays.includes(day.num);
          const isToday = new Date().getDay() === (day.num === 7 ? 0 : day.num);

          return (
            <button
              key={day.num}
              onClick={() => onDayChange(day.num)}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105
                ${isActive
                  ? 'bg-amber-500 text-white shadow-xl ring-4 ring-amber-200'
                  : isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-gray-200'}
                ${isToday && !isActive ? 'ring-2 ring-amber-300' : ''}
              `}
            >
              <day.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-white' : day.color}`} />
              <div className="text-xs font-medium">{day.en.slice(0, 3)}</div>
              <div className="text-sm font-hebrew">{day.he}</div>
              {isCompleted && !isActive && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
              )}
              {isToday && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
