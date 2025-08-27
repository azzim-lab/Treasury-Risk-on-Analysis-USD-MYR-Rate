// FX Risk Calculation Utilities for Treasury Risk Management

export interface FXTrade {
  id: string;
  notionalUSD: number;
  tradeDate: Date;
  maturityDate: Date;
  direction: 'long' | 'short';
}

export interface RiskScenario {
  currentFXRate: number;
  shockedFXRate: number;
  interestRateShock: number; // basis points
  volatility: number;
}

export interface RiskMetrics {
  totalExposureUSD: number;
  totalPnL: number;
  unhedgedPnL: number;
  hedgedPnL: number;
  optimalHedgeRatio: number;
  hedgeCost: number;
  valueAtRisk: number;
}

// Generate dummy FX trades for simulation
export function generateFXTrades(count: number = 100): FXTrade[] {
  const trades: FXTrade[] = [];
  
  for (let i = 0; i < count; i++) {
    const baseNotional = 50000 + Math.random() * 2000000; // $50K to $2M
    const direction = Math.random() > 0.5 ? 'long' : 'short';
    const daysToMaturity = Math.floor(Math.random() * 365) + 30; // 30-395 days
    
    trades.push({
      id: `FX-${i.toString().padStart(3, '0')}`,
      notionalUSD: baseNotional,
      tradeDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      maturityDate: new Date(Date.now() + daysToMaturity * 24 * 60 * 60 * 1000),
      direction,
    });
  }
  
  return trades;
}

// Calculate FX rate after interest rate shock
export function calculateShockedFXRate(
  currentRate: number,
  interestRateShockBps: number,
  timeToMaturity: number = 1 // years
): number {
  // Simple interest rate parity adjustment
  const shockDecimal = interestRateShockBps / 10000;
  return currentRate * (1 + shockDecimal * timeToMaturity);
}

// Calculate P&L impact from unhedged FX exposure
export function calculateUnhedgedPnL(
  trades: FXTrade[],
  currentRate: number,
  shockedRate: number
): number {
  return trades.reduce((totalPnL, trade) => {
    const rateDelta = shockedRate - currentRate;
    const tradePnL = trade.direction === 'long' 
      ? trade.notionalUSD * rateDelta 
      : -trade.notionalUSD * rateDelta;
    return totalPnL + tradePnL;
  }, 0);
}

// Calculate hedge cost using simple forward premium
export function calculateHedgeCost(
  notionalUSD: number,
  forwardRate: number,
  spotRate: number,
  hedgeRatio: number = 1
): number {
  const forwardPoints = forwardRate - spotRate;
  return notionalUSD * hedgeRatio * forwardPoints;
}

// Calculate optimal hedge ratio using simplified portfolio optimization
export function calculateOptimalHedgeRatio(
  totalExposure: number,
  expectedVolatility: number,
  hedgeCost: number,
  riskAversion: number = 0.5
): number {
  // Simplified hedge ratio based on cost-benefit analysis
  const costPenalty = Math.abs(hedgeCost) / totalExposure;
  const volatilityBenefit = expectedVolatility * riskAversion;
  
  let optimalRatio = Math.min(1, volatilityBenefit / (volatilityBenefit + costPenalty));
  return Math.max(0, optimalRatio);
}

// Calculate Value at Risk (VaR) for 95% confidence
export function calculateVaR(
  totalExposure: number,
  volatility: number,
  confidenceLevel: number = 0.95,
  timeHorizon: number = 1 // days
): number {
  // Using normal distribution approximation
  const zScore = confidenceLevel === 0.95 ? 1.645 : 2.33; // 95% or 99%
  const scaledVolatility = volatility * Math.sqrt(timeHorizon / 252); // Annualized to daily
  return totalExposure * scaledVolatility * zScore;
}

// Main risk calculation function
export function calculateRiskMetrics(
  trades: FXTrade[],
  scenario: RiskScenario
): RiskMetrics {
  const totalExposureUSD = trades.reduce((sum, trade) => sum + trade.notionalUSD, 0);
  
  const unhedgedPnL = calculateUnhedgedPnL(trades, scenario.currentFXRate, scenario.shockedFXRate);
  
  const forwardRate = calculateShockedFXRate(
    scenario.currentFXRate,
    scenario.interestRateShock,
    0.25 // 3 months average maturity
  );
  
  const hedgeCost = calculateHedgeCost(totalExposureUSD, forwardRate, scenario.currentFXRate);
  
  const optimalHedgeRatio = calculateOptimalHedgeRatio(
    totalExposureUSD,
    scenario.volatility,
    hedgeCost
  );
  
  const hedgedPnL = unhedgedPnL * (1 - optimalHedgeRatio) - hedgeCost * optimalHedgeRatio;
  
  const valueAtRisk = calculateVaR(totalExposureUSD, scenario.volatility);
  
  return {
    totalExposureUSD,
    totalPnL: unhedgedPnL,
    unhedgedPnL,
    hedgedPnL,
    optimalHedgeRatio,
    hedgeCost,
    valueAtRisk,
  };
}

// Generate P&L sensitivity data for charting
export function generatePnLSensitivity(
  trades: FXTrade[],
  baseRate: number,
  shockRange: number = 0.5
): Array<{ fxRate: number; pnl: number; hedgedPnl: number }> {
  const sensitivity = [];
  const steps = 50;
  
  for (let i = 0; i <= steps; i++) {
    const rate = baseRate - shockRange + (2 * shockRange * i) / steps;
    const pnl = calculateUnhedgedPnL(trades, baseRate, rate);
    const hedgedPnl = pnl * 0.3; // Assuming 70% hedge ratio
    
    sensitivity.push({
      fxRate: rate,
      pnl: pnl / 1000000, // Convert to millions
      hedgedPnl: hedgedPnl / 1000000,
    });
  }
  
  return sensitivity;
}