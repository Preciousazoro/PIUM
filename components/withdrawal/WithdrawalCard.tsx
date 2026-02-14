import { ArrowDown, Building2, Wallet, Clock, CheckCircle, XCircle } from 'lucide-react';
import { WithdrawalType, WithdrawalStatus } from '@/models/Withdrawal';

export interface Withdrawal {
  _id: string;
  userId: string;
  amount: number;
  convertedAmount: number;
  withdrawalType: WithdrawalType;
  status: WithdrawalStatus;
  processingTime?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  cryptoDetails?: {
    network: string;
    walletAddress: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WithdrawalCardProps {
  withdrawal: Withdrawal;
}

const WithdrawalCard: React.FC<WithdrawalCardProps> = ({ withdrawal }) => {
  const getStatusIcon = () => {
    switch (withdrawal.status) {
      case WithdrawalStatus.PENDING:
        return Clock;
      case WithdrawalStatus.APPROVED:
        return CheckCircle;
      case WithdrawalStatus.REJECTED:
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = () => {
    switch (withdrawal.status) {
      case WithdrawalStatus.PENDING:
        return "text-yellow-500 bg-yellow-500/10";
      case WithdrawalStatus.APPROVED:
        return "text-green-500 bg-green-500/10";
      case WithdrawalStatus.REJECTED:
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusText = () => {
    switch (withdrawal.status) {
      case WithdrawalStatus.PENDING:
        return "Pending";
      case WithdrawalStatus.APPROVED:
        return "Approved";
      case WithdrawalStatus.REJECTED:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getMethodIcon = () => {
    return withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? Building2 : Wallet;
  };

  const getMethodText = () => {
    return withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? "Bank Transfer" : "USDT Crypto";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = getStatusIcon();
  const MethodIcon = getMethodIcon();
  const statusColor = getStatusColor();

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-muted group-hover:bg-primary/10 transition-colors rounded-xl p-3 text-red-500">
            <MethodIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Withdrawal via {getMethodText()}</div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">
              {withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER 
                ? `Bank: ${withdrawal.bankDetails?.bankName || 'N/A'}`
                : `Network: ${withdrawal.cryptoDetails?.network || 'N/A'}`
              }
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(withdrawal.createdAt)}
              {withdrawal.processingTime && ` • ${withdrawal.processingTime}`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-black text-red-500">
            -{withdrawal.amount} TP
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            ≈ ${withdrawal.convertedAmount.toFixed(2)} USD
          </div>
          <div className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded ${statusColor}`}>
            <div className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {getStatusText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalCard;
