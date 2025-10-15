/**
 * Date Utility Functions
 * Handles timezone issues between MySQL DATE fields and JavaScript Date objects
 */

/**
 * Format a MySQL DATE to YYYY-MM-DD string
 * Prevents timezone conversion issues
 * @param {Date|string} date - Date object or string from MySQL
 * @returns {string|null} - Formatted date string (YYYY-MM-DD) or null
 */
function formatDateToYYYYMMDD(date) {
  if (!date) return null;
  
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Convert to Date object if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) return null;
  
  // Use UTC methods to avoid timezone issues
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a MySQL DATETIME/TIMESTAMP to ISO string
 * @param {Date|string} datetime - DateTime object or string from MySQL
 * @returns {string|null} - ISO formatted datetime or null
 */
function formatDateTimeToISO(datetime) {
  if (!datetime) return null;
  
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
  if (isNaN(dateObj.getTime())) return null;
  
  return dateObj.toISOString();
}

/**
 * Format all date fields in a database row
 * Automatically detects and formats DATE and DATETIME fields
 * @param {Object} row - Database row object
 * @param {Array<string>} dateFields - Array of field names that are DATE type
 * @param {Array<string>} dateTimeFields - Array of field names that are DATETIME type
 * @returns {Object} - Row with formatted date fields
 */
function formatRowDates(row, dateFields = [], dateTimeFields = []) {
  if (!row) return row;
  
  const formatted = { ...row };
  
  // Format DATE fields
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDateToYYYYMMDD(formatted[field]);
    }
  });
  
  // Format DATETIME/TIMESTAMP fields
  dateTimeFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDateTimeToISO(formatted[field]);
    }
  });
  
  return formatted;
}

/**
 * Format date fields in an array of rows
 * @param {Array<Object>} rows - Array of database rows
 * @param {Array<string>} dateFields - Array of field names that are DATE type
 * @param {Array<string>} dateTimeFields - Array of field names that are DATETIME type
 * @returns {Array<Object>} - Rows with formatted date fields
 */
function formatRowsDates(rows, dateFields = [], dateTimeFields = []) {
  if (!Array.isArray(rows)) return rows;
  
  return rows.map(row => formatRowDates(row, dateFields, dateTimeFields));
}

module.exports = {
  formatDateToYYYYMMDD,
  formatDateTimeToISO,
  formatRowDates,
  formatRowsDates
};

