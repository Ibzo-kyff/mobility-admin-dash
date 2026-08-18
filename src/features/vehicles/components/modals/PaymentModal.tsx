import React, { useState } from 'react';
import usePayment from '../../hooks/usePayment';

interface Props {
  open: boolean;
  amount?: number;
  onClose: () => void;
  onPaid?: (result: any) => void;
}

const PaymentModal: React.FC<Props> = ({ open, amount = 0, onClose, onPaid }) => {
  const { isProcessingPayment, processPayment } = usePayment();
  const [cardNumber, setCardNumber] = useState('4111111111111111');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded shadow p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">Paiement</h3>
        <p className="mt-2">Montant: {amount} €</p>

        <div className="mt-4">
          <label className="block text-sm">Numéro de carte</label>
          <input className="mt-1 w-full border p-2 rounded" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
          <button
            onClick={async () => {
              const res = await processPayment({ amount, cardNumber });
              if (onPaid) onPaid(res);
              if (res.success) onClose();
            }}
            disabled={isProcessingPayment}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {isProcessingPayment ? 'Traitement...' : 'Payer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
