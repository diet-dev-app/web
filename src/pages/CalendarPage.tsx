import { useState } from 'react';
import CalendarGrid from '@/features/Calendar/CalendarGrid';
import DayModal from '@/features/Calendar/DayModal';

/**
 * Calendar page — route-level component.
 * Renders the monthly calendar and the day editor modal.
 */
export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  return (
    <>
      <CalendarGrid onDayClick={handleDayClick} />

      {selectedDate && (
        <DayModal
          show={!!selectedDate}
          date={selectedDate}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
