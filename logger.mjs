// Paprastas duomenų bazės operacijų registravimo įrankis
export const logDB = (message) => {
  const timestamp = new Date().toISOString();
  if (typeof message === 'object') {
    console.log(`[DB][${timestamp}]`, JSON.stringify(message, null, 2));
  } else {
    console.log(`[DB][${timestamp}] ${message}`);
  }
};

export const logError = (message, error = '') => {
  const timestamp = new Date().toISOString();
  if (typeof message === 'object') {
    console.error(`[ERROR][${timestamp}]`, JSON.stringify(message, null, 2));
  } else {
    console.error(`[ERROR][${timestamp}] ${message}`, error ? `\n${error}` : '');
  }
};