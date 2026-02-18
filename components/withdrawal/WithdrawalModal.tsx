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
  onError?: (error: string) => void;
}

export default function WithdrawalModal({ isOpen, onClose, taskPoints, onSuccess, onError }: WithdrawalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>(WithdrawalType.USDT_CRYPTO);
  const [cryptoNetwork, setCryptoNetwork] = useState<CryptoNetwork>(CryptoNetwork.SOL);
  
  // Form states
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  // Conversion rates
  const TP_TO_USD_RATE = 0.0006;
  const convertedAmount = parseFloat(amount || "0") * TP_TO_USD_RATE;

  const resetForm = () => {
    setAmount("");
    setWalletAddress("");
    setCryptoNetwork(CryptoNetwork.SOL);
    setWithdrawalType(WithdrawalType.USDT_CRYPTO);
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

      payload.cryptoDetails = {
        network: cryptoNetwork,
        walletAddress,
      };


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
        throw new Error(data.details || data.error || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process withdrawal";
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    const amountValid = parseFloat(amount) >= 500 && parseFloat(amount) <= taskPoints;
    
    return amountValid && walletAddress && walletAddress.length >= 10;
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


          {/* USDC Fields */}
          <>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Network</label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setCryptoNetwork(CryptoNetwork.SOL)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      cryptoNetwork === CryptoNetwork.SOL
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/50 hover:bg-muted"
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="font-semibold">SOL</div>
                    <div className="text-xs text-muted-foreground">Solana Network</div>
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

          {/* Processing Time Info */}
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-sm">
                <div className="font-medium">Estimated Processing Time</div>
                <div className="text-muted-foreground">
                  24 Hours
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
