'use client';

import { useState, useMemo } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { safeEval } from '@/lib/safe-eval';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Formula {
  id: string;
  name: string;
  expression: string;
}

export default function ProgrammableCalculator() {
  const [formulas, setFormulas] = useLocalStorage<Formula[]>('programmable-formulas', []);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | string | null>(null);

  const [newFormulaName, setNewFormulaName] = useState('');
  const [newFormulaExpression, setNewFormulaExpression] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();

  const selectedFormula = useMemo(() => formulas.find(f => f.id === selectedFormulaId), [formulas, selectedFormulaId]);
  
  const variables = useMemo(() => {
    if (!selectedFormula) return [];
    // Basic regex to find variable-like names (words)
    const found = selectedFormula.expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    // Filter out numbers and common math constants/functions if any
    return [...new Set(found.filter(v => isNaN(parseFloat(v))))];
  }, [selectedFormula]);

  const handleSelectFormula = (id: string) => {
    setSelectedFormulaId(id);
    setVariableValues({});
    setResult(null);
  };
  
  const handleAddFormula = () => {
    if (!newFormulaName.trim() || !newFormulaExpression.trim()) {
      toast({ title: "Error", description: "Formula name and expression cannot be empty.", variant: "destructive" });
      return;
    }
    const newFormula: Formula = {
      id: Date.now().toString(),
      name: newFormulaName,
      expression: newFormulaExpression,
    };
    setFormulas([...formulas, newFormula]);
    setNewFormulaName('');
    setNewFormulaExpression('');
    toast({ title: "Success", description: "Formula saved successfully." });
    setIsDialogOpen(false);
  };

  const handleDeleteFormula = (id: string) => {
    setFormulas(formulas.filter(f => f.id !== id));
    if (selectedFormulaId === id) {
      setSelectedFormulaId(null);
    }
    toast({ title: "Success", description: "Formula deleted." });
  };

  const handleCalculate = () => {
    if (!selectedFormula) return;
    try {
      const allVarsFilled = variables.every(v => variableValues[v] && !isNaN(parseFloat(variableValues[v])));
      if (!allVarsFilled) {
        throw new Error('Please fill in all variable values.');
      }

      const numericValues: Record<string, number> = {};
      for (const key in variableValues) {
        numericValues[key] = parseFloat(variableValues[key]);
      }

      const calculationResult = safeEval(selectedFormula.expression, numericValues);
      setResult(calculationResult);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
      toast({ title: 'Calculation Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Formulas</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Formula</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="formula-name">Formula Name</Label>
                  <Input id="formula-name" placeholder="e.g., Profit Margin" value={newFormulaName} onChange={e => setNewFormulaName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formula-expression">Expression</Label>
                  <Input id="formula-expression" className="font-code" placeholder="e.g., (revenue - cost) / revenue" value={newFormulaExpression} onChange={e => setNewFormulaExpression(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleAddFormula}>Save Formula</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {formulas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No formulas saved yet. Click '+' to add one.</p>
          ) : (
            <div className="space-y-2">
              {formulas.map(f => (
                <div key={f.id} className="flex items-center gap-2">
                  <Button
                    variant={selectedFormulaId === f.id ? 'secondary' : 'ghost'}
                    className="flex-1 justify-start"
                    onClick={() => handleSelectFormula(f.id)}
                  >
                    {f.name}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteFormula(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{selectedFormula ? selectedFormula.name : 'Select a Formula'}</CardTitle>
          {selectedFormula && <CardDescription className="font-code">{selectedFormula.expression}</CardDescription>}
        </CardHeader>
        {selectedFormula ? (
          <>
            <CardContent className="space-y-4">
              {variables.length > 0 ? (
                variables.map(v => (
                  <div key={v} className="space-y-2">
                    <Label htmlFor={`var-${v}`} className="capitalize">{v}</Label>
                    <Input
                      id={`var-${v}`}
                      type="number"
                      placeholder={`Enter value for ${v}`}
                      value={variableValues[v] || ''}
                      onChange={e => setVariableValues({ ...variableValues, [v]: e.target.value })}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">This formula has no variables.</p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
              <Button onClick={handleCalculate}>Calculate</Button>
              {result !== null && (
                <Alert>
                  <AlertTitle>Result</AlertTitle>
                  <AlertDescription className="text-lg font-bold font-code break-all">
                    {typeof result === 'number' ? result.toLocaleString() : result}
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </>
        ) : (
          <CardContent>
            <p className="text-muted-foreground">Select a formula from the left to get started.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
