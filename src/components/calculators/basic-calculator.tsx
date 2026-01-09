'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eraser } from 'lucide-react';

const calculatorButtonVariants = cva(
  'text-xl md:text-2xl h-16 md:h-20 w-full rounded-lg shadow-md transition-all duration-150 ease-in-out transform active:scale-95',
  {
    variants: {
      variant: {
        number:
          'bg-card text-card-foreground hover:bg-muted',
        operator:
          'bg-accent text-accent-foreground hover:bg-accent/90',
        action:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
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

export default function BasicCalculator() {
  const [input, setInput] = useState('0');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [isNewOperation, setIsNewOperation] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewOperation) {
      setInput(num);
      setIsNewOperation(false);
    } else {
      if (input === '0') {
        setInput(num);
      } else {
        setInput(input + num);
      }
    }
  };

  const handleDecimal = () => {
    if (isNewOperation) {
      setInput('0.');
      setIsNewOperation(false);
    }
    else if (!input.includes('.')) {
      setInput(input + '.');
    }
  };

  const handleOperation = (op: string) => {
    if (prevValue && operation && !isNewOperation) {
      calculate();
      setPrevValue(input);
    } else {
      setPrevValue(input);
    }
    setOperation(op);
    setOutput(`${input} ${op}`);
    setIsNewOperation(true);
  };
  
  const calculate = () => {
    if (!operation || prevValue === null) return;
  
    const current = parseFloat(input);
    const previous = parseFloat(prevValue);
    let result = 0;
  
    switch (operation) {
      case '+':
        result = previous + current;
        break;
      case '-':
        result = previous - current;
        break;
      case '×':
        result = previous * current;
        break;
      case '÷':
        if (current === 0) {
            setOutput('Error: Cannot divide by zero');
            setInput('0');
            setOperation(null);
            setPrevValue(null);
            setIsNewOperation(true);
            return;
        }
        result = previous / current;
        break;
    }
    const resultString = String(parseFloat(result.toPrecision(15)));
    setInput(resultString);
    setOutput(`${previous} ${operation} ${current} = ${resultString}`);
    setOperation(null);
    setPrevValue(null);
    setIsNewOperation(true);
  };

  const clearAll = () => {
    setInput('0');
    setOutput('');
    setOperation(null);
    setPrevValue(null);
    setIsNewOperation(true);
  };

  const backspace = () => {
    if (isNewOperation) return;
    if (input.length > 1) {
      setInput(input.slice(0, -1));
    } else {
      setInput('0');
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9') {
        handleNumber(event.key);
      } else if (event.key === '.') {
        handleDecimal();
      } else if (['+', '-', '*', '/'].includes(event.key)) {
        handleOperation(event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key);
      } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculate();
      } else if (event.key === 'Backspace') {
        backspace();
      } else if (event.key === 'Escape') {
        clearAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, operation, prevValue, isNewOperation]);

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardContent className="p-4 md:p-6">
          <div className="bg-background text-right p-4 rounded-lg mb-4 border shadow-inner">
            <div className="text-muted-foreground text-sm h-6 truncate" title={output}>
              {output}
            </div>
            <div className="text-foreground text-4xl md:text-5xl font-bold break-all">
              {input}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <CalculatorButton variant="action" label="AC" onClick={clearAll} className="col-span-2" />
            <CalculatorButton variant="action" label={<Eraser />} onClick={backspace} />
            <CalculatorButton variant="operator" label="÷" onClick={() => handleOperation('÷')} />

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

            <CalculatorButton label="0" onClick={() => handleNumber('0')} className="col-span-2" />
            <CalculatorButton label="." onClick={handleDecimal} />
            <CalculatorButton variant="operator" label="=" onClick={calculate} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
