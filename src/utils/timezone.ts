// Timezone utility functions
export const getCurrentTimeInTimezone = (timezone: string): Date => {
  // For current time, we can just return the current date
  // The formatting functions will handle the timezone conversion
  return new Date();
};

export const formatTimeInTimezone = (date: Date, timezone: string): string => {
  try {
    const formattedTime = date.toLocaleTimeString("en-US", { 
      timeZone: timezone,
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    console.log(`Formatting time for timezone ${timezone}:`, {
      originalDate: date.toISOString(),
      formattedTime: formattedTime,
      localTime: date.toLocaleTimeString()
    });
    
    return formattedTime;
  } catch (error) {
    console.log('Timezone formatting failed, using local time:', error);
    // Fallback to local time formatting
    return date.toLocaleTimeString();
  }
};

export const formatDateInTimezone = (date: Date, timezone: string): string => {
  try {
    return date.toLocaleDateString("en-US", { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    // Fallback to local date formatting
    return date.toLocaleDateString();
  }
};

export const formatDateTimeInTimezone = (date: Date, timezone: string): string => {
  try {
    return date.toLocaleString("en-US", { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    // Fallback to local datetime formatting
    return date.toLocaleString();
  }
};

export const createDateInTimezone = (timezone: string): Date => {
  return getCurrentTimeInTimezone(timezone);
}; 