'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, faLock, faGlobe, faCreditCard, faChevronRight, 
  faMoon, faUser, faShieldAlt, faEye, faFingerprint,
  faCircleCheck, faEnvelope, faPhone, faMapMarkerAlt,
  faSlidersH, faLanguage, faQuestionCircle, faHeadset,
  faInfoCircle, faExclamationTriangle, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    promotions: true
  });
  
  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactView: false
  });

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <FontAwesomeIcon icon={faSlidersH} className="text-xl sm:text-2xl" />
            </div>
            Paramètres
          </h1>
          <p className="text-[10px] sm:text-xs font-black text-slate-400 mt-2 ml-1 uppercase tracking-widest">
            Personnalisez votre expérience et gérez votre sécurité
          </p>
        </div>
      </div>

      {/* Profile Shortcut Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-2xl transition-all">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shadow-inner">
            {user?.image ? (
              <img src={user.image} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white text-2xl font-black">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 group-hover:text-orange-500 transition-colors">{user?.prenom} {user?.nom}</h2>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-2 mt-1">
              <FontAwesomeIcon icon={faEnvelope} className="text-orange-500" />
              {user?.email}
            </p>
          </div>
        </div>
        <Link 
          href="/dashboard/client/profile"
          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-3 shadow-md shadow-orange-500/20"
        >
          Voir le profil complet
          <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Notifications Section */}
        <div className="space-y-6">
          <SectionHeader icon={faBell} title="Notifications" color="bg-blue-50 text-blue-500" />
          <div className="bg-white rounded-[2.5rem] shadow-lg shadow-slate-200/30 border border-slate-50 overflow-hidden divide-y divide-slate-50">
            <ToggleItem 
              title="Alertes par Email" 
              description="Recevoir les confirmations de réservation" 
              active={notifications.email} 
              onToggle={() => setNotifications({...notifications, email: !notifications.email})}
            />
            <ToggleItem 
              title="Notifications Push" 
              description="Alertes en temps réel sur mobile" 
              active={notifications.push} 
              onToggle={() => setNotifications({...notifications, push: !notifications.push})}
            />
            <ToggleItem 
              title="Alertes SMS" 
              description="Informations importantes par message" 
              active={notifications.sms} 
              onToggle={() => setNotifications({...notifications, sms: !notifications.sms})}
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-6">
          <SectionHeader icon={faShieldAlt} title="Sécurité" color="bg-emerald-50 text-emerald-500" />
          <div className="bg-white rounded-[2.5rem] shadow-lg shadow-slate-200/30 border border-slate-50 overflow-hidden divide-y divide-slate-50">
            <NavigationItem 
              icon={faLock} 
              title="Mot de passe" 
              description="Dernière modification il y a 3 mois" 
            />
            <NavigationItem 
              icon={faFingerprint} 
              title="Double authentification" 
              description="Sécurisez davantage votre accès" 
              label="Désactivé"
              labelColor="text-rose-500"
            />
            <NavigationItem 
              icon={faEye} 
              title="Sessions actives" 
              description="Gérez les appareils connectés" 
            />
          </div>
        </div>

        {/* Appearance & Language */}
        <div className="space-y-6">
          <SectionHeader icon={faMoon} title="Préférences" color="bg-indigo-50 text-indigo-500" />
          <div className="bg-white rounded-[2.5rem] shadow-lg shadow-slate-200/30 border border-slate-50 overflow-hidden divide-y divide-slate-50">
            <ToggleItem 
              title="Mode Sombre" 
              description="Réduire la fatigue oculaire" 
              active={appearance.darkMode} 
              onToggle={() => setAppearance({...appearance, darkMode: !appearance.darkMode})}
            />
            <NavigationItem 
              icon={faLanguage} 
              title="Langue de l'interface" 
              description="Français (Sénégal)" 
              label="Modifier"
            />
          </div>
        </div>

        {/* Payment & Billing */}
        <div className="space-y-6">
          <SectionHeader icon={faCreditCard} title="Paiement" color="bg-orange-50 text-orange-500" />
          <div className="bg-white rounded-[2.5rem] shadow-lg shadow-slate-200/30 border border-slate-50 overflow-hidden divide-y divide-slate-50">
            <NavigationItem 
              icon={faCreditCard} 
              title="Modes de paiement" 
              description="Wave, Orange Money, Cartes" 
            />
            <NavigationItem 
              icon={faInfoCircle} 
              title="Facturation" 
              description="Historique de vos transactions" 
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-10 border-t border-slate-100">
        <div className="bg-rose-50 rounded-[2.5rem] border border-rose-100 p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white text-rose-500 flex items-center justify-center text-2xl shadow-sm">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <div>
              <h3 className="text-lg font-black text-rose-900">Zone de Danger</h3>
              <p className="text-sm font-bold text-rose-600/70">Ces actions sont irréversibles. Soyez prudent.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all shadow-md flex items-center gap-3">
            <FontAwesomeIcon icon={faTrashAlt} />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, color }: { icon: any, title: string, color: string }) {
  return (
    <div className="flex items-center gap-4 px-2">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-sm shadow-inner`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h3>
    </div>
  );
}

function ToggleItem({ title, description, active, onToggle }: { title: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
      <div className="space-y-1">
        <h4 className="font-black text-slate-900 text-sm">{title}</h4>
        <p className="text-xs font-bold text-slate-400">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        aria-label={`Activer ${title}`}
        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${active ? 'bg-orange-500' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${active ? 'right-1' : 'left-1'}`}></div>
      </button>
    </div>
  );
}

function NavigationItem({ icon, title, description, label, labelColor = "text-orange-500" }: { icon: any, title: string, description: string, label?: string, labelColor?: string }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-orange-500 transition-all shadow-sm">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-slate-900 text-sm group-hover:text-orange-500 transition-colors">{title}</h4>
          <p className="text-xs font-bold text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {label && <span className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>{label}</span>}
        <FontAwesomeIcon icon={faChevronRight} className="text-slate-300 text-xs group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
