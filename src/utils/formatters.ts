export const getMonthName = (monthNumber: number): string => {
  const mesi = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  return mesi[monthNumber - 1] || monthNumber.toString();
};