'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eraser } from 'lucide-react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
};

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

export default function GstCalculator() {
  const [amount, setAmount] = useState('0');
  const [gstRate, setGstRate] = useState('18');
  const [gstType, setGstType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [result, setResult] = useState<{
    baseAmount: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    totalAmount: number;
  } | null>(null);

  const [output, setOutput] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [isNewOperation, setIsNewOperation] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewOperation) {
      setAmount(num);
      setIsNewOperation(false);
    } else {
      if (amount === '0') {
        setAmount(num);
      } else {
        setAmount(amount + num);
      }
    }
    setResult(null);
  };

  const handleDecimal = () => {
    if (isNewOperation) {
      setAmount('0.');
      setIsNewOperation(false);
    }
    else if (!amount.includes('.')) {
      setAmount(amount + '.');
    }
    setResult(null);
  };

  const handleOperation = (op: string) => {
    if (prevValue && operation && !isNewOperation) {
      calculateBasic();
      setPrevValue(amount);
    } else {
      setPrevValue(amount);
    }
    setOperation(op);
    setOutput(`${amount} ${op}`);
    setIsNewOperation(true);
    setResult(null);
  };
  
  const calculateBasic = (fromEquals = true) => {
    if (!operation || prevValue === null) return;
  
    const current = parseFloat(amount);
    const previous = parseFloat(prevValue);
    let basicResult = 0;
  
    switch (operation) {
      case '+':
        basicResult = previous + current;
        break;
      case '-':
        basicResult = previous - current;
        break;
      case '×':
        basicResult = previous * current;
        break;
      case '÷':
        if (current === 0) {
            setOutput('Error: Cannot divide by zero');
            setAmount('0');
            setOperation(null);
            setPrevValue(null);
            setIsNewOperation(true);
            return;
        }
        basicResult = previous / current;
        break;
    }
    const resultString = String(parseFloat(basicResult.toPrecision(15)));
    setAmount(resultString);
    if(fromEquals) {
        setOutput(`${previous} ${operation} ${current} = ${resultString}`);
        setOperation(null);
        setPrevValue(null);
    } else {
        setOutput(`${resultString} ${operation}`);
    }
    setIsNewOperation(true);
    setResult(null);
  };

  const clearAll = () => {
    setAmount('0');
    setOutput('');
    setOperation(null);
    setPrevValue(null);
    setIsNewOperation(true);
    setResult(null);
  };

  const backspace = () => {
    if (isNewOperation) return;
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
    setResult(null);
  };

  const calculateGst = () => {
    calculateBasic(true); // Finalize any pending calculation

    const principalAmount = parseFloat(amount);
    const rate = parseFloat(gstRate);

    if (isNaN(principalAmount) || isNaN(rate) || principalAmount <= 0) {
      setResult(null);
      return;
    }

    let baseAmount, gstAmountValue, totalAmount;

    if (gstType === 'exclusive') {
      baseAmount = principalAmount;
      gstAmountValue = (baseAmount * rate) / 100;
      totalAmount = baseAmount + gstAmountValue;
    } else { // inclusive
      totalAmount = principalAmount;
      baseAmount = (totalAmount * 100) / (100 + rate);
      gstAmountValue = totalAmount - baseAmount;
    }

    const cgst = gstAmountValue / 2;
    const sgst = gstAmountValue / 2;

    setResult({ baseAmount, gstAmount: gstAmountValue, cgst, sgst, totalAmount });
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
        calculateBasic();
      } else if (event.key === 'Backspace') {
        backspace();
      } else if (event.key === 'Escape') {
        clearAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [amount, operation, prevValue, isNewOperation]);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
          <CardContent className="p-4">
            <div className="bg-background text-right p-4 rounded-lg mb-4 border shadow-inner">
                <div className="text-muted-foreground text-sm h-6 truncate" title={output}>
                {output}
                </div>
                <div className="text-foreground text-4xl font-bold break-all">
                {amount}
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
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
                <CalculatorButton variant="operator" label="=" onClick={() => calculateBasic()} />
            </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GST Calculator (India)</CardTitle>
          <CardDescription>
            Calculate GST amount from the total or base amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>GST Calculation Type</Label>
            <RadioGroup defaultValue="exclusive" value={gstType} onValueChange={(value: 'exclusive' | 'inclusive') => setGstType(value)} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exclusive" id="exclusive" />
                <Label htmlFor="exclusive">Exclusive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inclusive" id="inclusive" />
                <Label htmlFor="inclusive">Inclusive</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst-rate">GST Rate</Label>
            <Select value={gstRate} onValueChange={setGstRate}>
              <SelectTrigger id="gst-rate" className="w-[180px]">
                <SelectValue placeholder="Select GST Rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18%</SelectItem>
                <SelectItem value="28">28%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <Button onClick={calculateGst} className="w-full">Calculate GST</Button>
          {result && (
            <Card className="w-full bg-muted/50">
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span>{gstType === 'exclusive' ? 'Base Amount' : 'Amount (Inc. GST)'}:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                </div>
                <Separator/>
                <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span className="font-medium">{formatCurrency(result.baseAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span>CGST ({parseFloat(gstRate)/2}%):</span>
                    <span className="font-medium">{formatCurrency(result.cgst)}</span>
                </div>
                <div className="flex justify-between">
                    <span>SGST ({parseFloat(gstRate)/2}%):</span>
                    <span className="font-medium">{formatCurrency(result.sgst)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Total GST:</span>
                    <span className="font-medium">{formatCurrency(result.gstAmount)}</span>
                </div>
                <Separator/>
                <div className="flex justify-between font-bold text-base">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(result.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
