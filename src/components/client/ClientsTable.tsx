'use client';

import { useEffect, useState } from 'react';
import { parkingAPI } from '@/services/parking/parking-api';
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search
} from 'lucide-react';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  status: 'APPROVED' | 'PENDING' | 'BLOCKED';
  createdAt: string;
  lastReservation?: string;
  totalSpent?: number;
}

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [filteredClients, setFilteredClients] = useState<Client[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    parkingAPI.getClients()
      .then((data) => {
        if (mounted) {
          const clientData = data && data.length > 0 ? data : getMockClients();
          setClients(clientData);
          setFilteredClients(clientData);
        }
      })
      .catch(() => {
        if (mounted) {
          const mockData = getMockClients();
          setClients(mockData);
          setFilteredClients(mockData);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!clients) return;

    let result = clients;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.nom.toLowerCase().includes(query) || 
        c.prenom.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    setFilteredClients(result);
  }, [searchQuery, statusFilter, clients]);

  function getMockClients(): Client[] {
    return [
      { id: 1, nom: 'Diallo', prenom: 'Moussa', email: 'moussa.diallo@email.com', phone: '+221 77 123 45 67', status: 'APPROVED', createdAt: '2024-01-15', totalSpent: 45000 },
      { id: 2, nom: 'Sow', prenom: 'Aissatou', email: 'a.sow@email.com', phone: '+221 78 987 65 43', status: 'APPROVED', createdAt: '2024-02-10', totalSpent: 12000 },
      { id: 3, nom: 'Ndiaye', prenom: 'Cheikh', email: 'cheikh.n@email.com', phone: '+221 70 456 12 89', status: 'PENDING', createdAt: '2024-04-01', totalSpent: 0 },
      { id: 4, nom: 'Fall', prenom: 'Fatou', email: 'fatou.fall@email.com', phone: '+221 76 321 00 11', status: 'BLOCKED', createdAt: '2023-11-20', totalSpent: 8500 },
    ];
  }

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleUpdateStatus = async (clientId: number, newStatus: Client['status']) => {
    try {
      await parkingAPI.updateClientStatus(clientId, newStatus);
      // Update local state
      setClients(prev => prev ? prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c) : null);
      if (selectedClient?.id === clientId) {
        setSelectedClient({ ...selectedClient, status: newStatus });
      }
      alert('Statut mis à jour avec succès');
    } catch (error: any) {
      alert('Erreur lors de la mise à jour: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" />
            Actif
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <ShieldAlert className="w-3 h-3" />
            Bloqué
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-black text-sm animate-pulse">Chargement des données clients...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="p-4 border-b border-gray-50 bg-gray-50/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            className="w-full sm:w-auto bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="APPROVED">Actifs</option>
            <option value="PENDING">En attente</option>
            <option value="BLOCKED">Bloqués</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {!filteredClients || filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-black font-semibold">Aucun résultat</h3>
            <p className="text-black text-sm mt-1">Aucun client ne correspond à votre recherche.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-wider">Inscrit le</th>
                <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-wider text-right">Dépenses</th>
                <th className="px-6 py-4 text-xs font-semibold text-black uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsPanelOpen(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {client.prenom[0]}{client.nom[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-black">{client.prenom} {client.nom}</div>
                        <div className="text-xs text-black flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" />
                          ID: #{client.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-black flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-black" />
                        {client.email}
                      </div>
                      <div className="text-sm text-black flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-black" />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(client.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-black" />
                      {new Date(client.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-black">
                      {client.totalSpent ? client.totalSpent.toLocaleString('fr-FR') : '0'} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-black hover:text-black">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {filteredClients && filteredClients.length > 0 && (
        <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-sm text-black">
            Affichage de <span className="font-medium text-black">{filteredClients.length}</span> sur <span className="font-medium text-black">{clients?.length}</span> clients
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm font-medium text-black bg-white border border-gray-200 rounded-md cursor-not-allowed">Précédent</button>
            <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      )}

      {/* Side Panel Detail View */}
      {isPanelOpen && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Détails du Client</h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5 rotate-90" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                    {selectedClient.prenom[0]}{selectedClient.nom[0]}
                  </div>
                  <h3 className="text-2xl font-bold text-black">{selectedClient.prenom} {selectedClient.nom}</h3>
                  <p className="text-black flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" />
                    ID Client: #{selectedClient.id}
                  </p>
                  <div className="mt-4">
                    {getStatusBadge(selectedClient.status)}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-semibold text-black uppercase tracking-wider">Informations de Contact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-black font-medium">{selectedClient.email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-sm text-black font-medium">{selectedClient.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Account Activity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-black mb-1">Total Dépensé</p>
                    <p className="text-lg font-bold text-black">{selectedClient.totalSpent?.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-black mb-1">Inscrit le</p>
                    <p className="text-sm font-bold text-black">{new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-black uppercase tracking-wider">Actions de Gestion</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedClient.status !== 'APPROVED' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedClient.id, 'APPROVED')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approuver le compte
                      </button>
                    )}
                    {selectedClient.status !== 'BLOCKED' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedClient.id, 'BLOCKED')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Bloquer le client
                      </button>
                    )}
                    {selectedClient.status === 'BLOCKED' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedClient.id, 'APPROVED')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Débloquer le client
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100">
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors shadow-lg"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
