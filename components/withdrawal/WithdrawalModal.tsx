"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";
import { X, Loader2, Building2, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { WithdrawalType, CryptoNetwork } from "@/models/Withdrawal";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskPoints: number;
  onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, taskPoints, onSuccess }: WithdrawalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>(WithdrawalType.BANK_TRANSFER);
  const [cryptoNetwork, setCryptoNetwork] = useState<CryptoNetwork>(CryptoNetwork.TRC20);
  
  // Form states
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  // Conversion rates
  const TP_TO_USD_RATE = 0.0006;
  const convertedAmount = parseFloat(amount || "0") * TP_TO_USD_RATE;

  const resetForm = () => {
    setAmount("");
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setWalletAddress("");
    setCryptoNetwork(CryptoNetwork.TRC20);
    setWithdrawalType(WithdrawalType.BANK_TRANSFER);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const payload: any = {
        amount: parseFloat(amount),
        withdrawalType,
      };

      if (withdrawalType === WithdrawalType.BANK_TRANSFER) {
        payload.bankDetails = {
          bankName,
          accountName,
          accountNumber,
        };
      } else {
        payload.cryptoDetails = {
          network: cryptoNetwork,
          walletAddress,
        };
      }

      const response = await fetch("/api/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        handleClose();
        // Toast will be handled by the parent component
      } else {
        throw new Error(data.error || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      // Error toast will be handled by the parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    const amountValid = parseFloat(amount) >= 500 && parseFloat(amount) <= taskPoints;
    
    if (withdrawalType === WithdrawalType.BANK_TRANSFER) {
      return amountValid && bankName && accountName && accountNumber;
    } else {
      return amountValid && walletAddress && walletAddress.length >= 10;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold">Withdraw TP</h3>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector */}
        <div className="mb-8">
          <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">Withdrawal Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWithdrawalType(WithdrawalType.BANK_TRANSFER)}
              className={`p-4 rounded-xl border-2 transition-all ${
                withdrawalType === WithdrawalType.BANK_TRANSFER
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 hover:bg-muted"
              }`}
            >
              <Building2 className="w-6 h-6 mb-2 mx-auto" />
              <div className="font-semibold">Bank Transfer</div>
              <div className="text-xs text-muted-foreground mt-1">24-48 hours</div>
            </button>
            
            <button
              type="button"
              onClick={() => setWithdrawalType(WithdrawalType.USDT_CRYPTO)}
              className={`p-4 rounded-xl border-2 transition-all ${
                withdrawalType === WithdrawalType.USDT_CRYPTO
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 hover:bg-muted"
              }`}
            >
              <Wallet className="w-6 h-6 mb-2 mx-auto" />
              <div className="font-semibold">USDC (Crypto)</div>
              <div className="text-xs text-muted-foreground mt-1">5-30 minutes</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Amount (TP)</label>
            <input
              required
              type="number"
              min="500"
              max={taskPoints}
              step="1"
              placeholder="Min 500 TP"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20"
              disabled={isProcessing}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available: {taskPoints.toLocaleString()} TP</span>
              {amount && (
                <span className="text-primary">
                  ≈ ${convertedAmount.toFixed(2)} USD
                </span>
              )}
            </div>
            {amount && parseFloat(amount) < 500 && (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                Minimum withdrawal is 500 TP
              </div>
            )}
            {amount && parseFloat(amount) > taskPoints && (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                Insufficient balance
              </div>
            )}
          </div>

          {/* Bank Transfer Fields */}
          {withdrawalType === WithdrawalType.BANK_TRANSFER && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Bank Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20"
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Account Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20"
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Account Number</label>
                <input
                  required
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20"
                  disabled={isProcessing}
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-green-500">Local Currency Conversion</div>
                    <div className="text-muted-foreground mt-1">
                      {amount && (
                        <>
                          {parseFloat(amount).toLocaleString()} TP = ${convertedAmount.toFixed(2)} USD
                          <br />
                          <span className="text-xs">Will be converted to your local currency at current exchange rate</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* USDT Fields */}
          {withdrawalType === WithdrawalType.USDT_CRYPTO && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Network</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCryptoNetwork(CryptoNetwork.TRC20)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      cryptoNetwork === CryptoNetwork.TRC20
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/50 hover:bg-muted"
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="font-semibold">TRC20</div>
                    <div className="text-xs text-muted-foreground">Low fees</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setCryptoNetwork(CryptoNetwork.ERC20)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      cryptoNetwork === CryptoNetwork.ERC20
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/50 hover:bg-muted"
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="font-semibold">ERC20</div>
                    <div className="text-xs text-muted-foreground">Ethereum</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Wallet Address</label>
                <input
                  required
                  type="text"
                  placeholder={`Enter ${cryptoNetwork} wallet address`}
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20"
                  disabled={isProcessing}
                />
                {walletAddress && walletAddress.length < 10 && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    Please enter a valid wallet address
                  </div>
                )}
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-yellow-500">Network Warning</div>
                    <div className="text-muted-foreground mt-1">
                      Make sure your wallet supports {cryptoNetwork} network. Sending to wrong network may result in loss of funds.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-green-500">Conversion Preview</div>
                    <div className="text-muted-foreground mt-1">
                      {amount && (
                        <>
                          {parseFloat(amount).toLocaleString()} TP = ${convertedAmount.toFixed(2)} USD = {convertedAmount.toFixed(2)} USDT
                          <br />
                          <span className="text-xs">1 TP = ${TP_TO_USD_RATE} USD</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Processing Time Info */}
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-sm">
                <div className="font-medium">Estimated Processing Time</div>
                <div className="text-muted-foreground">
                  {withdrawalType === WithdrawalType.BANK_TRANSFER ? "24-48 hours" : "5-30 minutes"}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || isProcessing}
            className="w-full py-4 bg-linear-to-r from-green-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </div>
            ) : (
              `Confirm Withdrawal${amount ? ` (${parseFloat(amount).toLocaleString()} TP)` : ""}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
