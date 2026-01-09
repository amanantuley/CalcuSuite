'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eraser } from 'lucide-react';

const calculatorButtonVariants = cva(
  'text-lg md:text-xl h-12 md:h-14 w-full rounded-lg shadow-md transition-all duration-150 ease-in-out transform active:scale-95',
  {
    variants: {
      variant: {
        number: 'bg-card text-card-foreground hover:bg-muted',
        operator: 'bg-accent text-accent-foreground hover:bg-accent/90',
        function: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
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

const CalculatorButton = ({ className, variant, label, ...props }: CalculatorButtonProps) => (
  <Button className={cn(calculatorButtonVariants({ variant, className }))} {...props}>{label}</Button>
);

export default function ScientificCalculator() {
  const [input, setInput] = useState('0');
  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [isNewOperation, setIsNewOperation] = useState(true);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

  const processInput = (val: string) => {
    if (isNewOperation) {
        setInput(val);
        setIsNewOperation(false);
    } else {
        setInput(input === '0' ? val : input + val);
    }
  };

  const handleFunction = (func: string) => {
    const val = parseFloat(input);
    let result = 0;
    let newOutput = `${func}(${input})`;
    
    const toAngle = (v: number) => angleMode === 'deg' ? v * Math.PI / 180 : v;

    switch (func) {
      case '√': result = Math.sqrt(val); break;
      case 'x²': result = Math.pow(val, 2); break;
      case 'sin': result = Math.sin(toAngle(val)); break;
      case 'cos': result = Math.cos(toAngle(val)); break;
      case 'tan': result = Math.tan(toAngle(val)); break;
      case 'log': result = Math.log10(val); break;
      case 'ln': result = Math.log(val); break;
      case '±': result = -val; newOutput = `-${input}`; break;
    }
    const resultString = String(parseFloat(result.toPrecision(15)));
    setInput(resultString);
    setOutput(newOutput + ` = ${resultString}`);
    setIsNewOperation(true);
  };
  
  const handleConstant = (c: string) => {
    let val = 0;
    if (c === 'π') val = Math.PI;
    if (c === 'e') val = Math.E;
    setInput(String(parseFloat(val.toPrecision(15))));
    setIsNewOperation(true);
  };

  const handleOperation = (op: string) => {
    if (prevValue && operation && !isNewOperation) {
        calculate(false);
        setPrevValue(input);
    } else {
        setPrevValue(input);
    }
    setOperation(op);
    setOutput(`${input} ${op}`);
    setIsNewOperation(true);
  };

  const calculate = (fromEquals = true) => {
    if (!operation || prevValue === null) return;
    const current = parseFloat(input);
    const previous = parseFloat(prevValue);
    let result = 0;
    
    switch (operation) {
      case '+': result = previous + current; break;
      case '-': result = previous - current; break;
      case '×': result = previous * current; break;
      case '÷': result = previous / current; break;
      case 'xʸ': result = Math.pow(previous, current); break;
    }
    const resultString = String(parseFloat(result.toPrecision(15)));
    setInput(resultString);
    if(fromEquals) setOutput(`${previous} ${operation} ${current} = ${resultString}`);
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
    setInput(input.length > 1 ? input.slice(0, -1) : '0');
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardContent className="p-4">
          <div className="bg-background text-right p-4 rounded-lg mb-4 border shadow-inner">
            <div className="text-muted-foreground text-sm h-6 truncate" title={output}>{output}</div>
            <div className="text-foreground text-4xl font-bold break-all">{input}</div>
          </div>
          <RadioGroup value={angleMode} onValueChange={(v: 'deg'|'rad') => setAngleMode(v)} className="flex space-x-4 mb-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="deg" id="deg" /><Label htmlFor="deg">DEG</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="rad" id="rad" /><Label htmlFor="rad">RAD</Label></div>
          </RadioGroup>
          <div className="grid grid-cols-5 gap-2">
            <CalculatorButton variant="function" label="√" onClick={() => handleFunction('√')} />
            <CalculatorButton variant="function" label="x²" onClick={() => handleFunction('x²')} />
            <CalculatorButton variant="function" label="xʸ" onClick={() => handleOperation('xʸ')} />
            <CalculatorButton variant="function" label="AC" onClick={clearAll} />
            <CalculatorButton variant="function" label={<Eraser />} onClick={backspace} />
            
            <CalculatorButton variant="function" label="sin" onClick={() => handleFunction('sin')} />
            <CalculatorButton label="7" onClick={() => processInput('7')} />
            <CalculatorButton label="8" onClick={() => processInput('8')} />
            <CalculatorButton label="9" onClick={() => processInput('9')} />
            <CalculatorButton variant="operator" label="÷" onClick={() => handleOperation('÷')} />

            <CalculatorButton variant="function" label="cos" onClick={() => handleFunction('cos')} />
            <CalculatorButton label="4" onClick={() => processInput('4')} />
            <CalculatorButton label="5" onClick={() => processInput('5')} />
            <CalculatorButton label="6" onClick={() => processInput('6')} />
            <CalculatorButton variant="operator" label="×" onClick={() => handleOperation('×')} />

            <CalculatorButton variant="function" label="tan" onClick={() => handleFunction('tan')} />
            <CalculatorButton label="1" onClick={() => processInput('1')} />
            <CalculatorButton label="2" onClick={() => processInput('2')} />
            <CalculatorButton label="3" onClick={() => processInput('3')} />
            <CalculatorButton variant="operator" label="-" onClick={() => handleOperation('-')} />
            
            <CalculatorButton variant="function" label="log" onClick={() => handleFunction('log')} />
            <CalculatorButton label="0" onClick={() => processInput('0')} />
            <CalculatorButton label="." onClick={() => processInput('.')} />
            <CalculatorButton variant="operator" label="=" onClick={() => calculate()} />
            <CalculatorButton variant="operator" label="+" onClick={() => handleOperation('+')} />

            <CalculatorButton variant="function" label="ln" onClick={() => handleFunction('ln')} />
            <CalculatorButton variant="function" label="π" onClick={() => handleConstant('π')} />
            <CalculatorButton variant="function" label="e" onClick={() => handleConstant('e')} />
            <CalculatorButton variant="function" label="±" onClick={() => handleFunction('±')} />
            <CalculatorButton variant="function" label="(" onClick={() => processInput('(')} />

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
