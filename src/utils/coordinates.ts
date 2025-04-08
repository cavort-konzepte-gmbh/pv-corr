/**
 * Validates if a string is a valid decimal coordinate
 * @param value The coordinate string to validate
 * @returns True if the coordinate is valid, false otherwise
 */
export const isValidCoordinate = (value: string | undefined | null): boolean => {
  if (!value) return false;
  
  // Trim the value to handle whitespace
  const trimmedValue = value.trim();
  
  // Regex for decimal coordinates (allows positive/negative values with optional decimal places)
  // Examples: 57.123456, -10.987654, 57, -10
  const decimalPattern = /^-?\d+(\.\d+)?$/;
  
  // Check if the value matches the pattern
  if (!decimalPattern.test(trimmedValue)) {
    return false;
  }
  
  // Additional validation for reasonable coordinate ranges
  const num = parseFloat(trimmedValue);
  
  // Latitude must be between -90 and 90
  // Longitude must be between -180 and 180
  // We don't know which one this is, so we'll use the wider range
  return num >= -180 && num <= 180;
};

/**
 * Formats a coordinate to a standard decimal format with 6 decimal places
 * @param value The coordinate string to format
 * @returns Formatted coordinate string or empty string if invalid
 */
export const formatCoordinate = (value: string | undefined | null): string => {
  if (!isValidCoordinate(value)) return '';
  
  // Parse and format to 6 decimal places
  const num = parseFloat(value!.trim());
  return num.toFixed(6);
};

/**
 * Checks if both latitude and longitude are valid coordinates
 * @param latitude Latitude string
 * @param longitude Longitude string
 * @returns True if both coordinates are valid
 */
export const areValidCoordinates = (latitude: string | undefined | null, longitude: string | undefined | null): boolean => {
  return isValidCoordinate(latitude) && isValidCoordinate(longitude);
};

/**
 * Formats a coordinate pair for display or storage
 * @param latitude Latitude string
 * @param longitude Longitude string
 * @returns Object with formatted coordinates or null if invalid
 */
export const formatCoordinatePair = (
  latitude: string | undefined | null, 
  longitude: string | undefined | null
): { latitude: string; longitude: string } | null => {
  if (!areValidCoordinates(latitude, longitude)) return null;
  
  return {
    latitude: formatCoordinate(latitude),
    longitude: formatCoordinate(longitude)
  };
};