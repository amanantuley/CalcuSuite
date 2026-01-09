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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
};

export default function GstCalculator() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [gstType, setGstType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [result, setResult] = useState<{
    baseAmount: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    totalAmount: number;
  } | null>(null);

  const calculate = () => {
    const principalAmount = parseFloat(amount);
    const rate = parseFloat(gstRate);

    if (isNaN(principalAmount) || isNaN(rate) || principalAmount <= 0) {
      setResult(null);
      return;
    }

    let baseAmount, gstAmount, totalAmount;

    if (gstType === 'exclusive') {
      baseAmount = principalAmount;
      gstAmount = (baseAmount * rate) / 100;
      totalAmount = baseAmount + gstAmount;
    } else { // inclusive
      totalAmount = principalAmount;
      baseAmount = (totalAmount * 100) / (100 + rate);
      gstAmount = totalAmount - baseAmount;
    }

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    setResult({ baseAmount, gstAmount, cgst, sgst, totalAmount });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>GST Calculator (India)</CardTitle>
          <CardDescription>
            Calculate GST amount from the total or base amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>GST Calculation Type</Label>
            <RadioGroup defaultValue="exclusive" value={gstType} onValueChange={(value: 'exclusive' | 'inclusive') => setGstType(value)} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exclusive" id="exclusive" />
                <Label htmlFor="exclusive">Exclusive (GST added to amount)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inclusive" id="inclusive" />
                <Label htmlFor="inclusive">Inclusive (GST included in amount)</Label>
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
          <Button onClick={calculate}>Calculate GST</Button>
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
