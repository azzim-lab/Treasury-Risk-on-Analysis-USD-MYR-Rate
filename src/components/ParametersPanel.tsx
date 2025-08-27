import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { PlayCircle, RotateCcw } from "lucide-react";

interface ParametersPanelProps {
  parameters: {
    currentFXRate: number;
    interestRateShock: number;
    volatility: number;
    numberOfTrades: number;
    timeHorizon: number;
  };
  onParameterChange: (key: string, value: number) => void;
  onRunSimulation: () => void;
  onReset: () => void;
}

export function ParametersPanel({ 
  parameters, 
  onParameterChange, 
  onRunSimulation, 
  onReset 
}: ParametersPanelProps) {
  return (
    <Card className="bg-gradient-card shadow-elegant border-border/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Risk Parameters</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="border-border hover:bg-secondary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={onRunSimulation}
            className="bg-gradient-primary hover:opacity-90"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Simulation
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Current FX Rate (MYR/USD): {parameters.currentFXRate.toFixed(4)}
          </Label>
          <Slider
            value={[parameters.currentFXRate]}
            onValueChange={(value) => onParameterChange('currentFXRate', value[0])}
            max={5.5}
            min={3.5}
            step={0.01}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Interest Rate Shock: {parameters.interestRateShock} bps
          </Label>
          <Slider
            value={[parameters.interestRateShock]}
            onValueChange={(value) => onParameterChange('interestRateShock', value[0])}
            max={500}
            min={-500}
            step={25}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            FX Volatility: {(parameters.volatility * 100).toFixed(1)}%
          </Label>
          <Slider
            value={[parameters.volatility]}
            onValueChange={(value) => onParameterChange('volatility', value[0])}
            max={0.5}
            min={0.05}
            step={0.01}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Number of Trades: {parameters.numberOfTrades}
          </Label>
          <Slider
            value={[parameters.numberOfTrades]}
            onValueChange={(value) => onParameterChange('numberOfTrades', value[0])}
            max={500}
            min={50}
            step={25}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Time Horizon (Days)</Label>
          <Input
            type="number"
            value={parameters.timeHorizon}
            onChange={(e) => onParameterChange('timeHorizon', parseInt(e.target.value) || 1)}
            min={1}
            max={365}
            className="bg-input border-border"
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-xs space-y-1 text-muted-foreground">
          <p>• Simulation models USD/MYR treasury exposure</p>
          <p>• Interest rate shock affects forward FX rates</p>
          <p>• Optimal hedge ratio minimizes risk-adjusted costs</p>
        </div>
      </div>
    </Card>
  );
}