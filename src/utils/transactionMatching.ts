export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  description: string;
  source: string;
}

export interface Receipt {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  imageUrl?: string;
}

export interface MatchedPair {
  transaction: Transaction;
  receipt: Receipt;
  confidence: number;
  matchedBy: string[];
}

export function matchTransactionsWithReceipts(
  transactions: Transaction[],
  receipts: Receipt[]
): {
  matched: MatchedPair[];
  unmatchedTransactions: Transaction[];
  unmatchedReceipts: Receipt[];
} {
  const matched: MatchedPair[] = [];
  const unmatchedTransactions: Transaction[] = [];
  const unmatchedReceipts: Receipt[] = [...receipts];

  for (const transaction of transactions) {
    let bestMatch: { receipt: Receipt; confidence: number; matchedBy: string[] } | null = null;

    for (let i = 0; i < unmatchedReceipts.length; i++) {
      const receipt = unmatchedReceipts[i];
      const { confidence, matchedBy } = calculateMatchConfidence(transaction, receipt);

      if (confidence > 0.7 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { receipt, confidence, matchedBy };
      }
    }

    if (bestMatch) {
      matched.push({
        transaction,
        receipt: bestMatch.receipt,
        confidence: bestMatch.confidence,
        matchedBy: bestMatch.matchedBy,
      });
      const index = unmatchedReceipts.findIndex(r => r.id === bestMatch!.receipt.id);
      unmatchedReceipts.splice(index, 1);
    } else {
      unmatchedTransactions.push(transaction);
    }
  }

  return { matched, unmatchedTransactions, unmatchedReceipts };
}

function calculateMatchConfidence(
  transaction: Transaction,
  receipt: Receipt
): { confidence: number; matchedBy: string[] } {
  let confidence = 0;
  const matchedBy: string[] = [];

  // Amount matching (most important)
  if (Math.abs(transaction.amount - receipt.amount) < 0.01) {
    confidence += 0.5;
    matchedBy.push('Exact amount');
  } else if (Math.abs(transaction.amount - receipt.amount) < 1) {
    confidence += 0.3;
    matchedBy.push('Similar amount');
  }

  // Date matching
  const transDate = new Date(transaction.date);
  const receiptDate = new Date(receipt.date);
  const daysDiff = Math.abs((transDate.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    confidence += 0.3;
    matchedBy.push('Same date');
  } else if (daysDiff <= 2) {
    confidence += 0.2;
    matchedBy.push('Within 2 days');
  }

  // Merchant matching
  const transMerchant = transaction.merchant.toLowerCase();
  const receiptMerchant = receipt.merchant.toLowerCase();

  if (transMerchant === receiptMerchant) {
    confidence += 0.2;
    matchedBy.push('Exact merchant');
  } else if (transMerchant.includes(receiptMerchant) || receiptMerchant.includes(transMerchant)) {
    confidence += 0.15;
    matchedBy.push('Similar merchant');
  }

  return { confidence, matchedBy };
}
