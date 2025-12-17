interface Receipt {
  id: string;
  amount: number;
  date: string;
  merchant_name: string;
  category: string;
  image_url: string;
  created_at: string;
  transaction_id?: string;
}

interface DuplicateMatch {
  receiptId: string;
  matchScore: number;
  reasons: string[];
  receipt: {
    id: string;
    amount: number;
    date: string;
    merchantName: string;
    category: string;
    imageUrl: string;
    createdAt: string;
  };
}

export function detectDuplicates(
  currentReceipt: Partial<Receipt>,
  existingReceipts: Receipt[]
): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];

  for (const receipt of existingReceipts) {
    if (receipt.id === currentReceipt.id) continue;

    let matchScore = 0;
    const reasons: string[] = [];

    // Check amount match (within 1% tolerance)
    if (currentReceipt.amount && receipt.amount) {
      const amountDiff = Math.abs(currentReceipt.amount - receipt.amount);
      const amountTolerance = currentReceipt.amount * 0.01;
      
      if (amountDiff <= amountTolerance) {
        matchScore += 40;
        reasons.push('Exact amount match');
      } else if (amountDiff <= currentReceipt.amount * 0.05) {
        matchScore += 20;
        reasons.push('Similar amount');
      }
    }

    // Check date match (within 3 days)
    if (currentReceipt.date && receipt.date) {
      const dateDiff = Math.abs(
        new Date(currentReceipt.date).getTime() - new Date(receipt.date).getTime()
      ) / (1000 * 60 * 60 * 24);
      
      if (dateDiff === 0) {
        matchScore += 30;
        reasons.push('Same date');
      } else if (dateDiff <= 1) {
        matchScore += 20;
        reasons.push('Within 1 day');
      } else if (dateDiff <= 3) {
        matchScore += 10;
        reasons.push('Within 3 days');
      }
    }

    // Check merchant name similarity
    if (currentReceipt.merchant_name && receipt.merchant_name) {
      const similarity = calculateStringSimilarity(
        currentReceipt.merchant_name.toLowerCase(),
        receipt.merchant_name.toLowerCase()
      );
      
      if (similarity > 0.8) {
        matchScore += 20;
        reasons.push('Same merchant');
      } else if (similarity > 0.6) {
        matchScore += 10;
        reasons.push('Similar merchant');
      }
    }

    // Check if linked to same transaction
    if (receipt.transaction_id && currentReceipt.transaction_id === receipt.transaction_id) {
      matchScore += 10;
      reasons.push('Linked to same transaction');
    }

    // Consider it a duplicate if score is above threshold
    if (matchScore >= 50) {
      duplicates.push({
        receiptId: receipt.id,
        matchScore,
        reasons,
        receipt: {
          id: receipt.id,
          amount: receipt.amount,
          date: receipt.date,
          merchantName: receipt.merchant_name,
          category: receipt.category,
          imageUrl: receipt.image_url,
          createdAt: receipt.created_at
        }
      });
    }
  }

  // Sort by match score (highest first)
  duplicates.sort((a, b) => b.matchScore - a.matchScore);

  return duplicates;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}