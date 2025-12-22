interface DaySelectorProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  completedDays: number[];
}

const DAYS = [
  { num: 1, en: 'Sun', he: 'א׳' },
  { num: 2, en: 'Mon', he: 'ב׳' },
  { num: 3, en: 'Tue', he: 'ג׳' },
  { num: 4, en: 'Wed', he: 'ד׳' },
  { num: 5, en: 'Thu', he: 'ה׳' },
  { num: 6, en: 'Fri', he: 'ו׳' },
  { num: 7, en: 'Shabbat', he: 'ש׳' },
];

export function DaySelector({ currentDay, onDayChange, completedDays }: DaySelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Select Day</h3>
      <div className="flex justify-between gap-1">
        {DAYS.map((day) => {
          const isActive = currentDay === day.num;
          const isCompleted = completedDays.includes(day.num);
          const isToday = new Date().getDay() === (day.num === 7 ? 0 : day.num);

          return (
            <button
              key={day.num}
              onClick={() => onDayChange(day.num)}
              className={`
                flex-1 py-2 px-1 rounded-lg text-center transition-all
                ${isActive
                  ? 'bg-amber-500 text-white shadow-md'
                  : isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                ${isToday && !isActive ? 'ring-2 ring-amber-300' : ''}
              `}
            >
              <div className="text-xs font-medium">{day.en}</div>
              <div className="text-lg font-hebrew">{day.he}</div>
              {isCompleted && !isActive && (
                <div className="text-xs">✓</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
