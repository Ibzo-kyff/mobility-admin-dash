'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faArrowRight,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faCar,
  faShieldAlt,
  faCreditCard,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const AuthPageClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);
  const [mobilityAPI, setMobilityAPI] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    phone: '',
    address: '',
    role: 'CLIENT'
  });

  useEffect(() => {
    import('../../services/mobility-api').then((module) => {
      setMobilityAPI(module.mobilityAPI);
    });
    const tab = searchParams.get('tab') as 'login' | 'register';
    if (tab) setAuthTab(tab);
  }, []);  // Removed searchParams from deps as it's not needed for re-runs

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mobilityAPI) return;
   
    setIsLoading(true);
   
    try {
      await mobilityAPI.login(formData.email, formData.password);
      const user = await mobilityAPI.getCurrentUser();
      showToast('Connexion réussie!', 'success');
      setTimeout(() => redirectToDashboard(user.role), 1500);
    } catch (error: any) {
      showToast(error.message || 'Erreur de connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mobilityAPI) return;
   
    setIsLoading(true);
   
    try {
      if (!formData.nom || !formData.prenom || !formData.email || !formData.phone || !formData.password) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || '',
        password: formData.password,
        role: formData.role,
        status: 'PENDING' as const,
        emailVerified: false,
        isOnline: false,
        connectionCount: 0
      };
      await mobilityAPI.register(userData);
      const user = await mobilityAPI.getCurrentUser();
      showToast('Inscription réussie! Veuillez vérifier votre email.', 'success');
      setTimeout(() => redirectToDashboard(user.role), 2000);
    } catch (error: any) {
      showToast(error.message || "Erreur d'inscription", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToDashboard = (role: string) => {
    const paths: { [key: string]: string } = {
      'ADMIN': '/dashboard/admin',
      'PARKING': '/dashboard/parking',
      'CLIENT': '/dashboard/client'
    };
    router.push(paths[role] || '/dashboard/client');
  };

  const showToast = (message: string, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const switchTab = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      phone: '',
      address: '',
      role: 'CLIENT'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white text-gray-800 flex items-center justify-center p-4">
      {/* Conteneur principal avec hauteur limitée */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-orange-100 max-h-[90vh]">
       
        {/* Section gauche - Informations */}
        <div className="md:w-2/5 p-6 md:p-8 flex flex-col bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
                <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xl">M</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mobility</h1>
                <p className="text-orange-100 text-sm">Votre liberté, simplifiée</p>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4 leading-snug">
              Rejoignez la révolution de la mobilité urbaine intelligente
            </h2>
           
            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCar} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">500+ Véhicules</h3>
                  <p className="text-orange-100/80 text-sm">Une flotte diversifiée à votre disposition</p>
                </div>
              </div>
             
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Sécurité Maximale</h3>
                  <p className="text-orange-100/80 text-sm">Données cryptées & protégées</p>
                </div>
              </div>
             
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCreditCard} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Paiement Simplifié</h3>
                  <p className="text-orange-100/80 text-sm">Transactions rapides et sécurisées</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">74% complété</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4 rounded-full"></div>
            </div>
            <p className="text-sm text-orange-100/70 mt-3 text-center">
              Rejoignez <span className="font-bold text-white">10,000+</span> utilisateurs satisfaits
            </p>
          </div>
        </div>
        {/* Section droite - Formulaire */}
        <div className="md:w-3/5 p-6 md:p-8 flex flex-col">
          {/* Onglets */}
          <div className="mb-6">
            <div className="flex mb-2">
              <button
                className={`flex-1 py-3 font-semibold text-lg transition-all duration-300 relative ${authTab === 'login' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => switchTab('login')}
              >
                Connexion
                {authTab === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full"></div>
                )}
              </button>
              <button
                className={`flex-1 py-3 font-semibold text-lg transition-all duration-300 relative ${authTab === 'register' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => switchTab('register')}
              >
                Inscription
                {authTab === 'register' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
          {/* Conteneur du formulaire avec scroll */}
          <div className="flex-1 overflow-hidden">
            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6 h-full flex flex-col">
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className="w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                      <a href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-500 transition-colors">
                        Mot de passe oublié ?
                      </a>
                    </div>
                    <div className="relative">
                      <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Votre mot de passe"
                        className="w-full p-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                      </>
                    )}
                  </button>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Google</span>
                    </button>
                    <button type="button" className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Apple</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                <form onSubmit={handleRegister} className="space-y-6 pb-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Rôle</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                    >
                      <option value="CLIENT">Client</option>
                      <option value="PARKING">Parking partenaire</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          placeholder="Votre nom"
                          className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          placeholder="Votre prénom"
                          className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="06 12 34 56 78"
                          className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Adresse</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Votre adresse"
                          className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Créez un mot de passe sécurisé"
                        className="w-full p-3 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 outline-none"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 accent-orange-500"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      J'accepte les{' '}
                      <a href="/terms" className="text-orange-600 hover:text-orange-500 font-medium transition-colors">
                        conditions d'utilisation
                      </a>{' '}
                      et la{' '}
                      <a href="/privacy" className="text-orange-600 hover:text-orange-500 font-medium transition-colors">
                        politique de confidentialité
                      </a>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        Création du compte...
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
          {/* Lien pour changer d'onglet */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {authTab === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <button
                onClick={() => switchTab(authTab === 'login' ? 'register' : 'login')}
                className="text-orange-600 hover:text-orange-500 font-medium transition-colors ml-1"
              >
                {authTab === 'login' ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </p>
          </div>
        </div>
      </div>
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300"
            style={{
              backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#f97316',
              color: 'white',
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Styles inline pour éviter les problèmes de build */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
       
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
       
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
       
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 10px;
        }
       
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
       
        /* Pour Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #fb923c #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default AuthPageClient;