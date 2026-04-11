/**
 * Business Intelligence Utility
 * Handles Anomaly Detection and Smart Recommendations
 */

export const analyzeIntelligence = (sales, expenses, goals) => {
  const insights = [];
  const anomalies = [];

  // 1. ANOMALY DETECTION (Last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentPeriodSales = sales.filter(s => new Date(s.date) >= sevenDaysAgo);
  const previousPeriodSales = sales.filter(s => new Date(s.date) >= fourteenDaysAgo && new Date(s.date) < sevenDaysAgo);

  const currentSum = currentPeriodSales.reduce((sum, s) => sum + s.amount, 0);
  const previousSum = previousPeriodSales.reduce((sum, s) => sum + s.amount, 0);

  if (previousSum > 0) {
    const variance = ((currentSum - previousSum) / previousSum) * 100;
    if (variance < -30) {
      anomalies.push({
        type: 'Negative Variance',
        message: `⚠️ Critical: Sales dropped by ${Math.abs(variance).toFixed(1)}% compared to last week.`,
        severity: 'high'
      });
    } else if (variance > 50) {
      anomalies.push({
        type: 'Positive Spike',
        message: `🚀 Insight: Sales are up ${variance.toFixed(1)}%! Consider checking what drove this burst.`,
        severity: 'low'
      });
    }
  }

  // 2. SMART RECOMMENDATIONS
  // Recommendation A: High Expense Ratio
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (totalRevenue > 0 && (totalExpenses / totalRevenue) > 0.7) {
    insights.push({
      title: 'Reduce Operational Costs',
      text: 'Your expense ratio is over 70%. Auditing "General" categories could improve margins.',
      action: 'Review Expenses'
    });
  }

  // Recommendation B: Top Product Focus
  if (sales.length > 5) {
    const productCounts = sales.reduce((acc, s) => {
      acc[s.product] = (acc[s.product] || 0) + s.amount;
      return acc;
    }, {});
    const topProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b);
    insights.push({
      title: 'Scale Top Performer',
      text: `${topProduct} is your highest grossing product. Consider a dedicated promo campaign.`,
      action: 'Marketing Boost'
    });
  }

  // 3. GOAL TRACKING INSIGHTS
  goals.forEach(goal => {
    if (goal.status === 'active') {
       const progress = (goal.currentAmount / goal.targetAmount) * 100;
       if (progress < 20 && new Date(goal.deadline) < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)) {
         anomalies.push({
           type: 'Goal Risk',
           message: `📅 Warning: Goal "${goal.title}" is at risk. Deadline is very close.`,
           severity: 'medium'
         });
       }
    }
  });

  return { anomalies, insights };
};
