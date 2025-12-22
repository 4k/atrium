'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pockets } from '@/lib/mock-data';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  ArrowLeftRight, 
  Plus, 
  Minus, 
  ArrowRight,
  Wallet,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

type TransferType = 'between' | 'topup' | 'expense';

interface QuickAction {
  type: TransferType;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    type: 'between',
    icon: ArrowLeftRight,
    label: 'Transfer Between Pockets',
    description: 'Move money from one pocket to another',
    color: 'bg-blue-500',
  },
  {
    type: 'topup',
    icon: Plus,
    label: 'Top Up Pocket',
    description: 'Add money from main balance',
    color: 'bg-green-500',
  },
  {
    type: 'expense',
    icon: Minus,
    label: 'Record Expense',
    description: 'Log spending from a pocket',
    color: 'bg-red-500',
  },
];

export function PocketTransfers() {
  const [selectedAction, setSelectedAction] = useState<TransferType | null>(null);
  const [fromPocket, setFromPocket] = useState<string | null>(null);
  const [toPocket, setToPocket] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleActionSelect = (type: TransferType) => {
    setSelectedAction(type);
    setFromPocket(null);
    setToPocket(null);
    setAmount('');
  };

  const handleSimulateTransfer = () => {
    // In a real app, this would call an API
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedAction(null);
      setFromPocket(null);
      setToPocket(null);
      setAmount('');
    }, 2000);
  };

  const canSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return false;
    if (selectedAction === 'between' && (!fromPocket || !toPocket || fromPocket === toPocket)) return false;
    if (selectedAction === 'topup' && !toPocket) return false;
    if (selectedAction === 'expense' && !fromPocket) return false;
    return true;
  };

  const PocketSelector = ({ 
    value, 
    onChange, 
    label,
    excludeId 
  }: { 
    value: string | null; 
    onChange: (id: string) => void; 
    label: string;
    excludeId?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pockets
          .filter((p) => p.id !== excludeId)
          .map((pocket) => (
            <button
              key={pocket.id}
              onClick={() => onChange(pocket.id)}
              className={cn(
                'p-3 rounded-lg border-2 text-left transition-all',
                value === pocket.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{pocket.icon}</span>
                <div>
                  <p className="text-sm font-medium">{pocket.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(pocket.currentBalance)}
                  </p>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Quick Pocket Actions
        </CardTitle>
        <CardDescription>
          Simulate transfers and record pocket expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-green-700 dark:text-green-300 font-medium">
              Transaction simulated successfully!
            </p>
          </div>
        )}

        {/* Action Selection */}
        {!selectedAction && !showSuccess && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.type}
                onClick={() => handleActionSelect(action.type)}
                className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all text-left group"
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3',
                  action.color
                )}>
                  <action.icon className="h-5 w-5" />
                </div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Transfer Form */}
        {selectedAction && !showSuccess && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSelectedAction(null)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to actions
            </button>

            {/* Action Title */}
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                quickActions.find((a) => a.type === selectedAction)?.color
              )}>
                {selectedAction === 'between' && <ArrowLeftRight className="h-5 w-5" />}
                {selectedAction === 'topup' && <Plus className="h-5 w-5" />}
                {selectedAction === 'expense' && <Minus className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium">
                  {quickActions.find((a) => a.type === selectedAction)?.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {quickActions.find((a) => a.type === selectedAction)?.description}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* From Pocket (for between and expense) */}
              {(selectedAction === 'between' || selectedAction === 'expense') && (
                <PocketSelector
                  value={fromPocket}
                  onChange={setFromPocket}
                  label={selectedAction === 'between' ? 'From Pocket' : 'Select Pocket'}
                  excludeId={toPocket || undefined}
                />
              )}

              {/* Arrow between pockets */}
              {selectedAction === 'between' && fromPocket && (
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* To Pocket (for between and topup) */}
              {(selectedAction === 'between' || selectedAction === 'topup') && (
                <PocketSelector
                  value={toPocket}
                  onChange={setToPocket}
                  label={selectedAction === 'between' ? 'To Pocket' : 'Select Pocket to Top Up'}
                  excludeId={fromPocket || undefined}
                />
              )}

              {/* Top up source indicator */}
              {selectedAction === 'topup' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    From: Main Balance
                  </span>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border bg-background text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {[10, 25, 50, 100, 200].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-3 py-1.5 rounded-md border hover:bg-muted transition-colors text-sm"
                  >
                    €{quickAmount}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSimulateTransfer}
                disabled={!canSubmit()}
                className={cn(
                  'w-full py-3 rounded-lg font-medium transition-colors',
                  canSubmit()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {selectedAction === 'between' && 'Simulate Transfer'}
                {selectedAction === 'topup' && 'Simulate Top Up'}
                {selectedAction === 'expense' && 'Record Expense'}
              </button>

              {/* Note */}
              <p className="text-xs text-muted-foreground text-center">
                This is a simulation. In production, this would update your Revolut account.
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity Preview */}
        {!selectedAction && !showSuccess && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Recent Pocket Activity</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Transfer</Badge>
                  <span>Bills → Emergency</span>
                </div>
                <span className="text-muted-foreground">€50.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">Top Up</Badge>
                  <span>Groceries</span>
                </div>
                <span className="text-muted-foreground">€100.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">Expense</Badge>
                  <span>Bills (Electric)</span>
                </div>
                <span className="text-muted-foreground">€85.00</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
