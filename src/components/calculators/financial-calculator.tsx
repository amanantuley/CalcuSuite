'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const SimpleInterestCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<{
    interest: number;
    total: number;
  } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time);
    if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r <= 0 || t <= 0) {
      setResult(null);
      return;
    }
    const interest = (p * r * t) / 100;
    setResult({ interest, total: p + interest });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Interest</CardTitle>
        <CardDescription>
          Formula: Interest = P × R × T / 100
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="si-principal">Principal Amount (₹)</Label>
          <Input id="si-principal" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 100000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="si-rate">Annual Interest Rate (%)</Label>
          <Input id="si-rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="si-time">Time (Years)</Label>
          <Input id="si-time" type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., 10" />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <Button onClick={calculate}>Calculate</Button>
        {result && (
          <div className="w-full space-y-2 rounded-lg border p-4">
            <h3 className="font-semibold">Results</h3>
            <p>Interest Earned: {formatCurrency(result.interest)}</p>
            <p>Total Amount: {formatCurrency(result.total)}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const CompoundInterestCalculator = () => {
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [time, setTime] = useState('');
    const [frequency, setFrequency] = useState('1'); // Annually
    const [result, setResult] = useState<{
      interest: number;
      total: number;
    } | null>(null);
  
    const calculate = () => {
      const p = parseFloat(principal);
      const r = parseFloat(rate) / 100;
      const t = parseFloat(time);
      const n = parseInt(frequency);
      if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r <= 0 || t <= 0) {
        setResult(null);
        return;
      }
      const amount = p * Math.pow(1 + r / n, n * t);
      const interest = amount - p;
      setResult({ interest, total: amount });
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compound Interest</CardTitle>
          <CardDescription>
            Formula: A = P(1 + r/n)ⁿᵗ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ci-principal">Principal Amount (₹)</Label>
            <Input id="ci-principal" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 100000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-rate">Annual Interest Rate (%)</Label>
            <Input id="ci-rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-time">Time (Years)</Label>
            <Input id="ci-time" type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., 10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-frequency">Compounding Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="ci-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">Monthly</SelectItem>
                <SelectItem value="4">Quarterly</SelectItem>
                <SelectItem value="2">Semi-Annually</SelectItem>
                <SelectItem value="1">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <Button onClick={calculate}>Calculate</Button>
          {result && (
            <div className="w-full space-y-2 rounded-lg border p-4">
              <h3 className="font-semibold">Results</h3>
              <p>Interest Earned: {formatCurrency(result.interest)}</p>
              <p>Total Amount: {formatCurrency(result.total)}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    );
};

const EmiCalculator = () => {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState('');
    const [tenure, setTenure] = useState('');
    const [result, setResult] = useState<{
      emi: number;
      totalInterest: number;
      totalPayment: number;
    } | null>(null);
  
    const calculate = () => {
      const p = parseFloat(amount);
      const r = parseFloat(rate) / 100 / 12; // Monthly interest rate
      const n = parseFloat(tenure) * 12; // Total number of months
      if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r <= 0 || n <= 0) {
        setResult(null);
        return;
      }
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - p;
      setResult({ emi, totalInterest, totalPayment });
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>EMI Calculator</CardTitle>
          <CardDescription>
            Formula: E = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emi-amount">Loan Amount (₹)</Label>
            <Input id="emi-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 500000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emi-rate">Annual Interest Rate (%)</Label>
            <Input id="emi-rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., 8.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emi-tenure">Loan Tenure (Years)</Label>
            <Input id="emi-tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="e.g., 5" />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <Button onClick={calculate}>Calculate EMI</Button>
          {result && (
            <div className="w-full space-y-2 rounded-lg border p-4">
              <h3 className="font-semibold">Loan Repayment Details</h3>
              <p className='text-lg font-bold'>Monthly EMI: {formatCurrency(result.emi)}</p>
              <p>Total Interest Payable: {formatCurrency(result.totalInterest)}</p>
              <p>Total Payment (Principal + Interest): {formatCurrency(result.totalPayment)}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };

export default function FinancialCalculator() {
  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="simple-interest">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simple-interest">Simple Interest</TabsTrigger>
          <TabsTrigger value="compound-interest">Compound</TabsTrigger>
          <TabsTrigger value="emi">EMI</TabsTrigger>
        </TabsList>
        <TabsContent value="simple-interest">
          <SimpleInterestCalculator />
        </TabsContent>
        <TabsContent value="compound-interest">
          <CompoundInterestCalculator />
        </TabsContent>
        <TabsContent value="emi">
          <EmiCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
