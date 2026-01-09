'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eraser, Printer } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useLocalStorage from '@/hooks/use-local-storage';

const calculatorButtonVariants = cva(
  'text-xl h-14 w-full rounded-lg shadow-md transition-all duration-150 ease-in-out transform active:scale-95',
  {
    variants: {
      variant: {
        number: 'bg-card text-card-foreground hover:bg-muted',
        operator: 'bg-accent text-accent-foreground hover:bg-accent/90',
        action: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
    defaultVariants: {
      variant: 'number',
    },
  }
);

interface CalculatorButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof calculatorButtonVariants> {
  label: string | React.ReactNode;
}

const CalculatorButton = ({
  className,
  variant,
  label,
  ...props
}: CalculatorButtonProps) => {
  return (
    <Button
      className={cn(calculatorButtonVariants({ variant, className }))}
      {...props}
    >
      {label}
    </Button>
  );
};

interface HistoryEntry {
  id: number;
  line: string;
}

export default function PrintingCalculator() {
  const [input, setInput] = useState('0');
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('printing-calc-history', []);
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const tapeEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    tapeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);
  
  const addHistory = (line: string) => {
    setHistory([...history, { id: Date.now(), line }]);
  };

  const handleNumber = (num: string) => {
    if (input === '0' || operation) {
      setInput(num);
      if (operation) {
        setPrevValue(input);
        setOperation(null);
      }
    } else {
      setInput(input + num);
    }
  };

  const handleOperation = (op: string) => {
    if (input !== '0') {
      addHistory(input);
    }
    addHistory(op);
    setOperation(op);
  };
  
  const calculate = () => {
    if (!operation || !prevValue) return;

    const current = parseFloat(input);
    const previous = parseFloat(prevValue);
    let result = 0;

    switch (operation) {
      case '+': result = previous + current; break;
      case '-': result = previous - current; break;
      case '×': result = previous * current; break;
      case '÷': result = previous / current; break;
    }
    
    addHistory(input);
    addHistory('=');
    const resultString = String(parseFloat(result.toPrecision(15)));
    addHistory(resultString);
    addHistory('---');
    
    setInput(resultString);
    setOperation(null);
    setPrevValue(null);
  };

  const clearAll = () => {
    setInput('0');
    setOperation(null);
    setPrevValue(null);
    if (history.length > 0) {
      addHistory('Cleared');
      addHistory('---');
    }
  };
  
  const handlePrint = () => {
    document.body.classList.add('printing');
    window.print();
    document.body.classList.remove('printing');
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto h-full">
      <Card className="w-full md:w-1/2 shadow-xl printable-area">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2 no-print">
            <h3 className="font-semibold">Paper Tape</h3>
            <Button variant="ghost" size="icon" onClick={() => setHistory([])}>
                <Eraser className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-96 w-full bg-muted rounded-lg p-2 font-mono text-sm border shadow-inner">
            {history.map(entry => (
                <div key={entry.id} className={cn(
                    "text-right",
                    ['+', '-', '×', '÷', '='].includes(entry.line) && "text-accent-foreground",
                    entry.line === '---' && "text-center text-muted-foreground",
                    entry.line === 'Cleared' && "text-destructive",
                )}>
                    {entry.line}
                </div>
            ))}
            <div ref={tapeEndRef} />
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="w-full md:w-1/2 shadow-xl no-print">
        <CardContent className="p-4">
          <div className="bg-background text-right p-4 rounded-lg mb-4 border shadow-inner">
            <div className="text-foreground text-4xl font-bold break-all">
              {input}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <CalculatorButton variant="action" label="AC" onClick={clearAll} />
            <CalculatorButton variant="action" label={<Printer />} onClick={handlePrint}/>
            <CalculatorButton variant="operator" label="÷" onClick={() => handleOperation('÷')} className="col-span-2"/>
            
            <CalculatorButton label="7" onClick={() => handleNumber('7')} />
            <CalculatorButton label="8" onClick={() => handleNumber('8')} />
            <CalculatorButton label="9" onClick={() => handleNumber('9')} />
            <CalculatorButton variant="operator" label="×" onClick={() => handleOperation('×')} />
            
            <CalculatorButton label="4" onClick={() => handleNumber('4')} />
            <CalculatorButton label="5" onClick={() => handleNumber('5')} />
            <CalculatorButton label="6" onClick={() => handleNumber('6')} />
            <CalculatorButton variant="operator" label="-" onClick={() => handleOperation('-')} />

            <CalculatorButton label="1" onClick={() => handleNumber('1')} />
            <CalculatorButton label="2" onClick={() => handleNumber('2')} />
            <CalculatorButton label="3" onClick={() => handleNumber('3')} />
            <CalculatorButton variant="operator" label="+" onClick={() => handleOperation('+')} />

            <CalculatorButton label="0" onClick={() => handleNumber('0')} className="col-span-3" />
            <CalculatorButton variant="operator" label="=" onClick={calculate} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
