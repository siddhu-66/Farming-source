import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { FileSignature, CheckCircle } from 'lucide-react';
import { Contract } from '@/types';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSign: (id: string) => void;
}

export function ContractModal({ isOpen, onClose, contract, onSign }: ContractModalProps) {
  if (!contract) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Smart Contract Review" className="max-w-2xl">
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm space-y-4">
           <h3 className="text-lg font-bold text-center border-b pb-2">AGRICULTURAL COMMODITY AGREEMENT</h3>
           <p><strong>Contract ID:</strong> {contract.id}</p>
           <p><strong>Date:</strong> {new Date(contract.createdAt).toLocaleDateString()}</p>
           <div className="py-4 space-y-2">
             <p>This agreement is made between Farmer (ID: {contract.farmerId}) and Buyer (ID: {contract.buyerId}).</p>
             <p>The Seller agrees to supply the Commodity (ID: {contract.cropId}) at the agreed price of <strong>₹{contract.price}/kg</strong>.</p>
             <p>Payment shall be held in escrow until delivery is confirmed by the Transport partner.</p>
           </div>
        </div>

        <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm text-yellow-800 dark:text-yellow-500">
           <div className="flex items-center"><FileSignature className="h-5 w-5 mr-2" /> By signing, you agree to the Terms of Service and Escrow conditions.</div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSign(contract.id)} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-4 w-4" /> Sign & Accept Contract
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
