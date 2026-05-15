'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeadset, 
  faQuestionCircle, 
  faEnvelope,
  faPhone,
  faMessage,
  faChevronDown,
  faChevronUp,
  faTicket,
  faClock,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    category: "Réservations",
    question: "Comment effectuer une réservation ?",
    answer: "Parcourez les véhicules ou parkings disponibles depuis la page de recherche. Sélectionnez l'élément qui vous intéresse, choisissez vos dates et cliquez sur 'Confirmer la réservation'. Un récapitulatif vous sera présenté avant le paiement."
  },
  {
    id: 2,
    category: "Paiements",
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons les paiements mobiles (Wave, Orange Money) via l'agrégateur Kkiapay, ainsi que les espèces directement sur place selon le type de réservation."
  },
  {
    id: 3,
    category: "Compte",
    question: "Comment modifier mes informations personnelles ?",
    answer: "Rendez-vous dans la section 'Mon Profil' de votre tableau de bord. Vous pourrez y modifier votre nom, prénom, email, téléphone et même votre photo de profil."
  },
  {
    id: 4,
    category: "Support",
    question: "Comment annuler une réservation en cours ?",
    answer: "Allez dans 'Mes Réservations', sélectionnez la réservation concernée et cliquez sur le bouton d'annulation. Veuillez noter que des frais peuvent s'appliquer selon le délai avant le début du service."
  },
  {
    id: 5,
    category: "Véhicules",
    question: "Puis-je louer un véhicule sans chauffeur ?",
    answer: "Cela dépend de l'annonce spécifique. Certains véhicules sont proposés avec chauffeur pour plus de confort, tandis que d'autres permettent la location simple. L'information est précisée dans les détails du véhicule."
  }
];

export default function HelpCenterPage() {
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '' });
  const [ticketSent, setTicketSent] = useState(false);

  const categories = ['all', ...new Set(faqs.map(f => f.category))];

  const toggleFaq = (id: number) => {
    setOpenFaqs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === selectedCategory);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ticket soumis:', ticketForm);
    setTicketSent(true);
    setTicketForm({ subject: '', description: '' });
    setTimeout(() => setTicketSent(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* En-tête */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-4">
          <FontAwesomeIcon icon={faHeadset} className="text-4xl text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Centre d'Aide</h1>
        <p className="text-gray-500 mt-2">Trouvez des réponses à vos questions ou contactez notre support</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-orange-500" />
                Questions fréquentes
              </h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <FontAwesomeIcon 
                      icon={openFaqs.includes(faq.id) ? faChevronUp : faChevronDown} 
                      className="text-gray-400"
                    />
                  </button>
                  {openFaqs.includes(faq.id) && (
                    <div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white mb-6">
            <FontAwesomeIcon icon={faMessage} className="text-3xl mb-3" />
            <h3 className="text-xl font-semibold mb-2">Support Prioritaire</h3>
            <p className="text-orange-100 text-sm mb-4">Réponse sous 24h ouvrées</p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} />
                support@mobility.sn
              </p>
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} />
                +221 33 800 00 00
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTicket} className="text-orange-500" />
              Ouvrir un ticket
            </h3>
            
            {ticketSent ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span className="text-sm">Ticket envoyé ! Nous vous répondrons rapidement.</span>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Sujet"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <textarea
                  placeholder="Décrivez votre problème..."
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Envoyer
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
