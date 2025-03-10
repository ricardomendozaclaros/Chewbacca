const formatNumber = (num) => num.toString().padStart(2, '0');

export const formatSmartDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startDay = formatNumber(start.getDate());
  const startMonth = formatNumber(start.getMonth() + 1);
  const startYear = start.getFullYear();
  
  const endDay = formatNumber(end.getDate());
  const endMonth = formatNumber(end.getMonth() + 1);
  const endYear = end.getFullYear();

  // Si las fechas son iguales
  if (start.getTime() === end.getTime()) {
    return `${startDay}/${startMonth}/${startYear}`;
  }

  // Si solo varía el día
  if (startYear === endYear && startMonth === endMonth) {
    return `Del ${startDay} - ${endDay}/${startMonth}/${startYear}`;
  }

  // Si varía el mes
  if (startYear === endYear) {
    return `Del ${startDay}/${startMonth} - ${endDay}/${endMonth}/${startYear}`;
  }

  // Si varía el año
  return `Del ${startDay}/${startMonth}/${startYear} - ${endDay}/${endMonth}/${endYear}`;
};

export const formatDateRange = (dateRange, daysAgo = 20) => {
  if (!dateRange[0]) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysAgo);
    return formatSmartDateRange(startDate, today);
  }

  const start = new Date(dateRange[0]);
  const end = dateRange[1] ? new Date(dateRange[1]) : start;
  return formatSmartDateRange(start, end);
};