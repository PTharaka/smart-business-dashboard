/**
 * Simple Linear Regression Logic to predict next period sales
 * Y = mx + b
 */
export const predictNextPeriod = (salesData) => {
  if (!salesData || salesData.length < 2) {
    return { trend: 'Insufficient Data', percentage: 0, predictedValue: 0 };
  }

  // Sort by date just in case
  const sorted = [...salesData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const yValues = sorted.map(s => s.amount);
  
  const n = yValues.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i + 1; // time index
    const y = yValues[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = (n * sumX2) - (sumX * sumX);
  if (denominator === 0) return { trend: 'Stable', percentage: 0, predictedValue: yValues[n-1] };

  const m = ((n * sumXY) - (sumX * sumY)) / denominator;
  const b = (sumY - (m * sumX)) / n;

  // Next time index
  const nextX = n + 1;
  const predictedValue = (m * nextX) + b;
  const lastValue = yValues[n - 1];

  let percentage = 0;
  if (lastValue > 0) {
    percentage = ((predictedValue - lastValue) / lastValue) * 100;
  } else if (predictedValue > 0) {
    percentage = 100;
  }

  let trend = 'Stable';
  if (percentage > 2) trend = 'Growth';
  else if (percentage < -2) trend = 'Decline';

  return {
    trend,
    percentage: percentage.toFixed(2),
    predictedValue: predictedValue > 0 ? predictedValue.toFixed(2) : 0
  };
};
