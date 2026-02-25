import { useState } from 'react';
import CalendarGrid from '@/features/Calendar/CalendarGrid';
import DayModal from '@/features/Calendar/DayModal';
import MealGenerationModal from '@/features/Calendar/MealGenerationModal';

/**
 * Calendar page — route-level component.
 * Renders the monthly calendar, the day editor modal, and the AI meal generation modal.
 */
export default function CalendarPage() {
  const [selectedDate, setSelectedDate]     = useState<string | null>(null);
  const [generateDate, setGenerateDate]     = useState<string | null>(null);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => {
            // Default generation for today
            const today = new Date();
            const yyyy  = today.getFullYear();
            const mm    = String(today.getMonth() + 1).padStart(2, '0');
            const dd    = String(today.getDate()).padStart(2, '0');
            setGenerateDate(`${yyyy}-${mm}-${dd}`);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 transition-colors shadow-sm"
        >
          ✨ Generar plan del día
        </button>
      </div>

      <CalendarGrid
        onDayClick={handleDayClick}
        onGenerateClick={(date) => setGenerateDate(date)}
      />

      {/* Day detail modal */}
      {selectedDate && (
        <DayModal
          show={!!selectedDate}
          date={selectedDate}
          onClose={handleCloseModal}
        />
      )}

      {/* AI meal generation modal */}
      {generateDate && (
        <MealGenerationModal
          show={!!generateDate}
          date={generateDate}
          onClose={() => setGenerateDate(null)}
          onSaved={() => setGenerateDate(null)}
        />
      )}
    </>
  );
}

