'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { visualizeEquation, VisualizeEquationOutput } from '@/ai/flows/graph-equation-visualization';

type ChartDataPoint = {
    x: number;
    y: number;
};

export default function GraphingCalculator() {
  const [equation, setEquation] = useState('y = x^2');
  const [plotData, setPlotData] = useState<ChartDataPoint[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePlot = () => {
    setError(null);
    setSuggestions(null);
    setPlotData(null);
    startTransition(async () => {
      try {
        const result: VisualizeEquationOutput = await visualizeEquation({ equation });
        if (result.errorMessage) {
          setError(result.errorMessage);
        } else if (result.visualizationType === 'suggestions' && result.suggestions) {
          setSuggestions(result.suggestions);
        } else if (result.visualizationType === 'chart.js' && result.graphData) {
          try {
            const data = JSON.parse(result.graphData);
            if (Array.isArray(data) && data.every(p => typeof p.x === 'number' && typeof p.y === 'number')) {
                setPlotData(data);
            } else {
                setError("AI returned invalid data format for the chart.");
            }
          } catch (e) {
            setError('Failed to parse graph data from AI response.');
            console.error(e);
          }
        } else {
            setError("Could not visualize the equation. The AI may not support this format.");
        }
      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
        console.error(e);
      }
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Graphing Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="e.g., y = x^2 + 3x - 4"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePlot()}
            className="font-code"
          />
          <Button onClick={handlePlot} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Plot Graph
          </Button>
        </div>
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {suggestions && (
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Suggestions</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5">
                        {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </AlertDescription>
            </Alert>
        )}
        <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-4">
            {isPending && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {!isPending && plotData && (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={plotData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" type="number" domain={['auto', 'auto']} label={{ value: 'x', position: 'insideBottomRight', offset: -5 }}/>
                        <YAxis type="number" domain={['auto', 'auto']} label={{ value: 'y', position: 'insideTopLeft', offset: -20 }}/>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))'
                            }}
                            labelFormatter={(label) => `x: ${label}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name={equation.split('=')[0].trim() || 'y'} />
                    </LineChart>
                </ResponsiveContainer>
            )}
            {!isPending && !plotData && !error && !suggestions && (
                <p className="text-muted-foreground">Enter an equation and click "Plot Graph" to see the visualization.</p>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Powered by GenAI for equation parsing and data generation.</p>
      </CardFooter>
    </Card>
  );
}
