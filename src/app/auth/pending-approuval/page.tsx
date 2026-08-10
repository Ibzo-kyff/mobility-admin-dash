'use client';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEnvelope, faHome } from '@fortawesome/free-solid-svg-icons';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
          <FontAwesomeIcon icon={faClock} className="text-4xl text-orange-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-black mb-3">Compte en attente d'approbation</h1>
        <p className="text-black mb-8 text-lg">
          Votre compte Parking est en cours de vérification par notre équipe.<br />
          Vous recevrez un email dès qu'il sera approuvé (généralement sous 24h).
        </p>

        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <p className="text-sm text-black">
            En attendant, vérifiez votre boîte email (y compris les spams) pour la confirmation.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition"
          >
            Retour à la connexion
          </Link>
          <Link
            href="/"
            className="block w-full py-3 border border-gray-300 text-black font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faHome} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}