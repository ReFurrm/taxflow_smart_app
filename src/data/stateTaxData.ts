export interface StateTaxInfo {
  name: string;
  code: string;
  taxRate: number;
  flatTax: boolean;
  estimatedPayments: boolean;
  quarterlyDates?: { q1: string; q2: string; q3: string; q4: string };
  brackets?: { min: number; max: number; rate: number }[];
  standardDeduction?: number;
  formName?: string;
  stateSpecificDeductions?: string[];
}

export const stateTaxData: Record<string, StateTaxInfo> = {
  CA: { 
    name: 'California', code: 'CA', taxRate: 0.093, flatTax: false, estimatedPayments: true,
    quarterlyDates: { q1: '04/15', q2: '06/15', q3: '09/15', q4: '01/15' },
    brackets: [
      { min: 0, max: 10099, rate: 0.01 },
      { min: 10100, max: 23942, rate: 0.02 },
      { min: 23943, max: 37788, rate: 0.04 },
      { min: 37789, max: 52455, rate: 0.06 },
      { min: 52456, max: 66295, rate: 0.08 },
      { min: 66296, max: 338639, rate: 0.093 },
      { min: 338640, max: 406364, rate: 0.103 },
      { min: 406365, max: 677275, rate: 0.113 },
      { min: 677276, max: Infinity, rate: 0.123 }
    ],
    standardDeduction: 5202,
    formName: 'Form 540',
    stateSpecificDeductions: ['Renter\'s Credit', 'College Access Tax Credit', 'CA Earned Income Tax Credit']
  },
  NY: { 
    name: 'New York', code: 'NY', taxRate: 0.109, flatTax: false, estimatedPayments: true,
    quarterlyDates: { q1: '04/15', q2: '06/15', q3: '09/15', q4: '01/15' },
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8501, max: 11700, rate: 0.045 },
      { min: 11701, max: 13900, rate: 0.0525 },
      { min: 13901, max: 80650, rate: 0.055 },
      { min: 80651, max: 215400, rate: 0.06 },
      { min: 215401, max: 1077550, rate: 0.0685 },
      { min: 1077551, max: 5000000, rate: 0.0965 },
      { min: 5000001, max: 25000000, rate: 0.103 },
      { min: 25000001, max: Infinity, rate: 0.109 }
    ],
    standardDeduction: 8000,
    formName: 'Form IT-201',
    stateSpecificDeductions: ['NYC School Tax Credit', 'Real Property Tax Credit', 'Child and Dependent Care Credit']
  },
  TX: { name: 'Texas', code: 'TX', taxRate: 0, flatTax: true, estimatedPayments: false, formName: 'No State Income Tax' },
  FL: { name: 'Florida', code: 'FL', taxRate: 0, flatTax: true, estimatedPayments: false, formName: 'No State Income Tax' },
  IL: { 
    name: 'Illinois', code: 'IL', taxRate: 0.0495, flatTax: true, estimatedPayments: true,
    quarterlyDates: { q1: '04/15', q2: '06/15', q3: '09/15', q4: '01/15' },
    standardDeduction: 2425,
    formName: 'Form IL-1040',
    stateSpecificDeductions: ['Property Tax Credit', 'Education Expense Credit']
  },
  WA: { name: 'Washington', code: 'WA', taxRate: 0, flatTax: true, estimatedPayments: false, formName: 'No State Income Tax' },
  PA: { 
    name: 'Pennsylvania', code: 'PA', taxRate: 0.0307, flatTax: true, estimatedPayments: true,
    quarterlyDates: { q1: '04/15', q2: '06/15', q3: '09/15', q4: '01/15' },
    formName: 'Form PA-40',
    stateSpecificDeductions: ['Tax Forgiveness Credit']
  },
  MA: { 
    name: 'Massachusetts', code: 'MA', taxRate: 0.05, flatTax: true, estimatedPayments: true,
    quarterlyDates: { q1: '04/15', q2: '06/15', q3: '09/15', q4: '01/15' },
    standardDeduction: 4400,
    formName: 'Form 1',
    stateSpecificDeductions: ['Rental Deduction', 'Student Loan Interest Deduction']
  }
};