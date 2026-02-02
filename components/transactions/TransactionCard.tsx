import { ArrowUp, ArrowDown, Gift, ShoppingCart, CheckCircle, Clock, XCircle } from 'lucide-react';

export type TransactionType = "welcome_bonus" | "daily_login" | "task_completed" | "task_approved" | "reward_redeemed" | "admin_adjustment";

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  createdAt: string;
}

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const getIconByType = (type: TransactionType) => {
    switch (type) {
      case "welcome_bonus":
      case "daily_login":
        return Gift;
      case "task_completed":
      case "task_approved":
        return CheckCircle;
      case "reward_redeemed":
        return ShoppingCart;
      case "admin_adjustment":
        return ArrowUp;
      default:
        return ArrowUp;
    }
  };

  const getIconColor = (type: TransactionType) => {
    switch (type) {
      case "welcome_bonus":
        return "text-purple-500";
      case "daily_login":
        return "text-blue-500";
      case "task_completed":
      case "task_approved":
        return "text-green-500";
      case "reward_redeemed":
        return "text-orange-500";
      case "admin_adjustment":
        return "text-gray-500";
      default:
        return "text-primary";
    }
  };

  const formatTransactionType = (type: TransactionType) => {
    switch (type) {
      case "welcome_bonus":
        return "Welcome Bonus";
      case "daily_login":
        return "Daily Login";
      case "task_completed":
        return "Task Completed";
      case "task_approved":
        return "Task Approved";
      case "reward_redeemed":
        return "Reward Redeemed";
      case "admin_adjustment":
        return "Admin Adjustment";
      default:
        return "Unknown";
    }
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

  const Icon = getIconByType(transaction.type);
  const iconColor = getIconColor(transaction.type);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`bg-muted group-hover:bg-primary/10 transition-colors rounded-xl p-3 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">{transaction.description}</div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">
              {formatTransactionType(transaction.type)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(transaction.createdAt)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-black ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
            {transaction.amount > 0 ? "+" : ""}{transaction.amount} TP
          </div>
          <div className="text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded bg-green-500/10 text-green-500">
            Completed
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
