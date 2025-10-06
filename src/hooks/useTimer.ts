import { useState, useEffect } from 'react';

export interface TimerData {
  formattedTime: string;
  elapsedMinutes: number;
  calculatedAmount: number;
}

export const useTimer = (startTimestamp?: number, ratePerMinute: number = 5) => {
  const [timerData, setTimerData] = useState<TimerData>({
    formattedTime: '00:00:00',
    elapsedMinutes: 0,
    calculatedAmount: 0
  });

  useEffect(() => {
    if (!startTimestamp) {
      setTimerData({
        formattedTime: '00:00:00',
        elapsedMinutes: 0,
        calculatedAmount: 0
      });
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTimestamp); // Don't go negative for future times

      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      const totalMinutes = Math.floor(elapsed / 60000);
      const calculatedAmount = totalMinutes * ratePerMinute; // Charge for every minute elapsed

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      setTimerData({
        formattedTime,
        elapsedMinutes: totalMinutes,
        calculatedAmount
      });
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp, ratePerMinute]);

  return timerData;
};