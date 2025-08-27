import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  Calculator,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricsCard } from "@/components/MetricsCard";
import { RiskChart, DistributionChart } from "@/components/RiskChart";
import { ParametersPanel } from "@/components/ParametersPanel";
import { useToast } from "@/hooks/use-toast";
import {
  generateFXTrades,
  calculateRiskMetrics,
  generatePnLSensitivity,
  calculateShockedFXRate,
  type FXTrade,
  type RiskScenario,
  type RiskMetrics
} from "@/lib/fx-calculations";

const Index = () => {
  const { toast } = useToast();
  
  const [parameters, setParameters] = useState({
    currentFXRate: 4.65,
    interestRateShock: 200, // basis points
    volatility: 0.15, // 15% annualized
    numberOfTrades: 100,
    timeHorizon: 30, // days
  });

  const [trades, setTrades] = useState<FXTrade[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate trades when parameters change
  useEffect(() => {
    setTrades(generateFXTrades(parameters.numberOfTrades));
  }, [parameters.numberOfTrades]);

  // Calculate risk scenario
  const riskScenario = useMemo((): RiskScenario => {
    const shockedRate = calculateShockedFXRate(
      parameters.currentFXRate,
      parameters.interestRateShock,
      parameters.timeHorizon / 365
    );

    return {
      currentFXRate: parameters.currentFXRate,
      shockedFXRate: shockedRate,
      interestRateShock: parameters.interestRateShock,
      volatility: parameters.volatility,
    };
  }, [parameters]);

  // Generate P&L sensitivity data for charts
  const pnlSensitivityData = useMemo(() => {
    if (trades.length === 0) return [];
    return generatePnLSensitivity(trades, parameters.currentFXRate, 0.5);
  }, [trades, parameters.currentFXRate]);

  // Generate risk distribution data
  const riskDistributionData = useMemo(() => [
    { scenario: 'Best Case', probability: 0.05, loss: 0 },
    { scenario: 'Favorable', probability: 0.25, loss: -2 },
    { scenario: 'Expected', probability: 0.40, loss: -5 },
    { scenario: 'Adverse', probability: 0.25, loss: -10 },
    { scenario: 'Worst Case', probability: 0.05, loss: -20 },
  ], []);

  const handleParameterChange = (key: string, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const runSimulation = async () => {
    setIsLoading(true);
    
    try {
      // Simulate processing delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const metrics = calculateRiskMetrics(trades, riskScenario);
      setRiskMetrics(metrics);
      
      toast({
        title: "Simulation Complete",
        description: `Analyzed ${trades.length} FX trades with ${parameters.interestRateShock}bps shock scenario`,
      });
    } catch (error) {
      toast({
        title: "Simulation Error",
        description: "Failed to calculate risk metrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetParameters = () => {
    setParameters({
      currentFXRate: 4.65,
      interestRateShock: 200,
      volatility: 0.15,
      numberOfTrades: 100,
      timeHorizon: 30,
    });
    setRiskMetrics(null);
  };

  // Auto-run simulation on mount
  useEffect(() => {
    if (trades.length > 0) {
      runSimulation();
    }
  }, [trades.length]);

  const getRiskLevel = (pnl: number) => {
    if (pnl > 0) return 'positive';
    if (pnl < -10000000) return 'negative'; // > $10M loss
    return 'neutral';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              FX Risk Simulator
            </h1>
            <p className="text-muted-foreground">
              Treasury risk management for USD/MYR unhedged positions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              <BarChart3 className="w-4 h-4 mr-2" />
              Live Simulation
            </Badge>
            <Badge 
              variant={riskMetrics?.totalPnL && riskMetrics.totalPnL < 0 ? "destructive" : "secondary"}
              className="px-3 py-1"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {riskMetrics?.totalPnL && riskMetrics.totalPnL < -5000000 ? 'High Risk' : 'Moderate Risk'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Parameters Panel */}
        <div className="lg:col-span-1">
          <ParametersPanel
            parameters={parameters}
            onParameterChange={handleParameterChange}
            onRunSimulation={runSimulation}
            onReset={resetParameters}
          />
        </div>

        {/* Main Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {/* Key Metrics */}
          {riskMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Exposure"
                value={riskMetrics.totalExposureUSD}
                subtitle="USD Notional"
                icon={<DollarSign className="w-5 h-5" />}
                trend="neutral"
              />
              <MetricsCard
                title="Unhedged P&L"
                value={riskMetrics.unhedgedPnL}
                subtitle="Shock Impact"
                icon={riskMetrics.unhedgedPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                trend={getRiskLevel(riskMetrics.unhedgedPnL)}
              />
              <MetricsCard
                title="Hedge Cost"
                value={Math.abs(riskMetrics.hedgeCost)}
                subtitle="Forward Premium"
                icon={<Calculator className="w-5 h-5" />}
                trend="neutral"
              />
              <MetricsCard
                title="Optimal Hedge %"
                value={`${(riskMetrics.optimalHedgeRatio * 100).toFixed(1)}%`}
                subtitle="Risk-Adjusted"
                icon={<Shield className="w-5 h-5" />}
                trend="positive"
              />
            </div>
          )}

          {/* P&L Sensitivity Chart */}
          <RiskChart
            data={pnlSensitivityData}
            title="P&L Sensitivity Analysis"
            height={400}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <DistributionChart
              data={riskDistributionData}
              title="Loss Distribution"
              height={300}
            />

            {/* Risk Summary */}
            <Card className="bg-gradient-card shadow-elegant border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Risk Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Current FX Rate:</span>
                  <span className="font-medium">{riskScenario.currentFXRate.toFixed(4)} MYR/USD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Shocked FX Rate:</span>
                  <span className="font-medium">{riskScenario.shockedFXRate.toFixed(4)} MYR/USD</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Rate Shock:</span>
                  <span className="font-medium text-warning">{parameters.interestRateShock} bps</span>
                </div>
                {riskMetrics && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-sm text-muted-foreground">Value at Risk (95%):</span>
                      <span className="font-medium text-loss">
                        ${(riskMetrics.valueAtRisk / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Hedged P&L:</span>
                      <span className={`font-medium ${riskMetrics.hedgedPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                        ${(riskMetrics.hedgedPnL / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Trading Summary */}
          <Card className="bg-gradient-card shadow-elegant border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{trades.length}</p>
                <p className="text-sm text-muted-foreground">Active Trades</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {Math.round((parameters.volatility * 100))}%
                </p>
                <p className="text-sm text-muted-foreground">FX Volatility</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {parameters.timeHorizon}
                </p>
                <p className="text-sm text-muted-foreground">Days Horizon</p>
              </div>
            </div>
          </Card>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Running simulation...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;