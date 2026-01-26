import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type CheckStatus = 'pending' | 'ok' | 'warning' | 'error' | 'skipped';

type CheckResult = {
  label: string;
  status: CheckStatus;
  message: string;
};

const tableChecks = [
  'profiles',
  'transactions',
  'receipts',
  'tax_years',
  'categories',
  'readiness_status',
  'income_entries',
  'expense_entries',
  'bank_connections',
  'bank_accounts',
  'efile_submissions',
  'efile_acknowledgments',
  'estimated_tax_payments',
  'tax_forms',
  'business_entities',
  'security_logs',
  'referrals',
  'incentives',
  'mileage_trips',
  'vehicle_expenses',
  'crypto_exchanges',
  'crypto_tax_lots',
  'entity_compliance_tasks',
  'irs_correspondence',
  'audit_logs',
  'backup_history',
  'invoices',
  'receipt_badges',
  'home_office',
  'vehicles',
  'audit_documentation',
];

const bucketChecks = ['receipt-images', 'tax-forms', 'database-backups'];

const safeFunctionChecks = ['log-security-event'];

const riskyFunctionChecks = [
  'create-subscription-checkout',
  'manage-subscription',
  'create-database-backup',
  'validate-and-efile',
  'generate-tax-form',
  'process-receipt-ocr',
  'match-receipts-to-transactions',
  'process-document-ocr',
  'identify-tax-loss-harvesting',
  'calculate-audit-risk',
  'tax-ai-assistant',
  'generate-form-8949',
  'import-crypto-transactions',
  'plaid-create-link-token',
  'plaid-exchange-token',
  'plaid-sync-transactions',
  'export-audit-package',
  'check-missing-receipts',
  'gmail-oauth',
  'scan-emails',
];

const statusVariant: Record<CheckStatus, 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  ok: 'success',
  warning: 'warning',
  error: 'destructive',
  pending: 'secondary',
  skipped: 'outline',
};

export default function HealthCheck() {
  const { user } = useAuth();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [includeRiskyFunctions, setIncludeRiskyFunctions] = useState(false);

  const runChecks = async () => {
    setRunning(true);
    const nextResults: CheckResult[] = [];

    const addResult = (label: string, status: CheckStatus, message: string) => {
      nextResults.push({ label, status, message });
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      addResult('Supabase env', 'error', 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    } else {
      addResult('Supabase env', 'ok', `Configured for ${supabaseUrl}`);
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      addResult('Auth session', 'error', sessionError.message);
    } else if (!sessionData.session) {
      addResult('Auth session', 'warning', 'No active session. Some checks may fail.');
    } else {
      addResult('Auth session', 'ok', `Session active for ${sessionData.session.user.email ?? 'user'}.`);
    }

    if (user?.id) {
      addResult('Auth user', 'ok', `User id: ${user.id}`);
    } else {
      addResult('Auth user', 'warning', 'No user loaded from context.');
    }

    for (const table of tableChecks) {
      const { error, count } = await supabase.from(table).select('id', { count: 'exact', head: true });
      if (error) {
        addResult(`Table: ${table}`, 'error', error.message);
      } else {
        addResult(`Table: ${table}`, 'ok', `Reachable${typeof count === 'number' ? ` (count: ${count})` : ''}`);
      }
    }

    for (const bucket of bucketChecks) {
      const { error } = await supabase.storage.from(bucket).list('', { limit: 1 });
      if (error) {
        addResult(`Bucket: ${bucket}`, 'error', error.message);
      } else {
        addResult(`Bucket: ${bucket}`, 'ok', 'Reachable');
      }
    }

    const functionList = includeRiskyFunctions
      ? [...safeFunctionChecks, ...riskyFunctionChecks]
      : safeFunctionChecks;

    for (const fn of functionList) {
      const { error } = await supabase.functions.invoke(fn, {
        body: { healthCheck: true },
        headers: { 'x-health-check': 'true' },
      });
      if (error) {
        addResult(`Function: ${fn}`, 'error', error.message);
      } else {
        addResult(`Function: ${fn}`, 'ok', 'Invoked successfully');
      }
    }

    if (!includeRiskyFunctions) {
      for (const fn of riskyFunctionChecks) {
        addResult(`Function: ${fn}`, 'skipped', 'Skipped (enable risky function checks to run)');
      }
    }

    setResults(nextResults);
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-heading font-bold text-charcoal">Health Check</h1>
          <p className="text-sm text-muted-foreground">
            Run connectivity checks for Supabase, tables, buckets, and edge functions.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Run checks</CardTitle>
            <CardDescription>
              Function checks can be expensive or side-effecting. Only safe ones run by default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-risky-functions"
                checked={includeRiskyFunctions}
                onCheckedChange={(checked) => setIncludeRiskyFunctions(Boolean(checked))}
              />
              <label htmlFor="include-risky-functions" className="text-sm text-charcoal">
                Include potentially side-effecting function checks
              </label>
            </div>
            <Button onClick={runChecks} disabled={running}>
              {running ? 'Running checks…' : 'Run health checks'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Errors usually indicate missing tables, RLS policies, or undeployed functions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No checks run yet.</p>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={`${result.label}-${result.status}-${result.message}`}
                    className="flex flex-col gap-2 rounded-md border border-border/60 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-charcoal">{result.label}</span>
                      <span className="text-xs text-muted-foreground">{result.message}</span>
                    </div>
                    <Badge variant={statusVariant[result.status]}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
