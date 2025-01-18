import React from 'react';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DateRangePicker} from '@mui/x-date-pickers-pro/DateRangePicker';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {DateRange} from '../types';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (dates: [Date | null, Date | null]) => void;
}

export const CustomDateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="date-range-picker">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateRangePicker
          value={[
            dateRange.startDate ? dayjs(dateRange.startDate) : null,
            dateRange.endDate ? dayjs(dateRange.endDate) : null,
          ]}
          onChange={(newValue) => {
            const [start, end] = newValue;
            onDateRangeChange([
              start ? start.toDate() : null,
              end ? end.toDate() : null,
            ]);
          }}
          maxDate={dayjs()}
          slotProps={{
            textField: {
              size: 'small',
              className: 'date-picker-input',
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};
