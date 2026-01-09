'use client';

import {
  Calculator,
  FlaskConical,
  IndianRupee,
  LineChart,
  Landmark,
  Printer,
  Code,
  PanelLeft,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

import BasicCalculator from '@/components/calculators/basic-calculator';
import ScientificCalculator from '@/components/calculators/scientific-calculator';
import GstCalculator from '@/components/calculators/gst-calculator';
import GraphingCalculator from '@/components/calculators/graphing-calculator';
import FinancialCalculator from '@/components/calculators/financial-calculator';
import PrintingCalculator from '@/components/calculators/printing-calculator';
import ProgrammableCalculator from '@/components/calculators/programmable-calculator';

type CalculatorId =
  | 'basic'
  | 'scientific'
  | 'gst'
  | 'graphing'
  | 'financial'
  | 'printing'
  | 'programmable';

const calculatorModules = {
  basic: {
    component: BasicCalculator,
    label: 'Basic',
    icon: Calculator,
  },
  scientific: {
    component: ScientificCalculator,
    label: 'Scientific',
    icon: FlaskConical,
  },
  gst: {
    component: GstCalculator,
    label: 'GST',
    icon: IndianRupee,
  },
  graphing: {
    component: GraphingCalculator,
    label: 'Graphing',
    icon: LineChart,
  },
  financial: {
    component: FinancialCalculator,
    label: 'Financial',
    icon: Landmark,
  },
  printing: {
    component: PrintingCalculator,
    label: 'Printing',
    icon: Printer,
  },
  programmable: {
    component: ProgrammableCalculator,
    label: 'Programmable',
    icon: Code,
  },
};

function Header({
  activeCalculator,
}: {
  activeCalculator: CalculatorId;
}) {
  const { toggleSidebar, isMobile } = useSidebar();
  const { label, icon: Icon } = calculatorModules[activeCalculator];

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <PanelLeft className="h-6 w-6" />
      </Button>
      <div className="flex items-center gap-2">
        <Icon className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold md:text-xl">{label} Calculator</h1>
      </div>
      <div className="ml-auto">
        {!isMobile && <ThemeToggle />}
      </div>
    </header>
  );
}

export default function Home() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorId>('basic');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const ActiveCalculatorComponent = calculatorModules[activeCalculator].component;

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-2 p-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold">CalcuSuite</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {Object.keys(calculatorModules).map((key) => {
              const id = key as CalculatorId;
              const { label, icon: Icon } = calculatorModules[id];
              return (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    onClick={() => setActiveCalculator(id)}
                    isActive={activeCalculator === id}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex-row items-center border-t p-2 md:flex">
           <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header activeCalculator={activeCalculator} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <ActiveCalculatorComponent />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
