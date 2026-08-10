'use client';

import { useState, useEffect } from 'react';
import { settingsAPI, AuditLogEntry } from '@/services/admin/settingsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faUser, 
  faSearch, 
  faSpinner,
  faRefresh,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faEye
} from '@fortawesome/free-solid-svg-icons';

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Filtres
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
        search: search || undefined,
      };

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await settingsAPI.getAuditLogs(params);

      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalLogs(data.pagination?.total || 0);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, entityFilter, actionFilter, search, dateFrom, dateTo]);

  const openDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
  };

  const closeModal = () => {
    setSelectedLog(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleRefresh = () => {
    setPage(1);
    loadLogs();
  };

  const resetFilters = () => {
    setSearch('');
    setEntityFilter('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">Journaux d'Activité</h1>
          <p className="text-black mt-2">
            {totalLogs > 0 ? `${totalLogs} logs au total` : 'Suivi complet des actions sur la plateforme'}
          </p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-2xl font-medium">
          <FontAwesomeIcon icon={faRefresh} className="text-orange-500" />
          Rafraîchir
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="flex-1 relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
              <input
                type="text"
                placeholder="Rechercher par utilisateur ou détails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-2xl px-4 py-3">
            <option value="">Toutes les entités</option>
            <option value="User">Utilisateur</option>
            <option value="Parking">Parking</option>
            <option value="Reservation">Réservation</option>
            <option value="Vehicle">Véhicule</option>
          </select>

          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-2xl px-4 py-3">
            <option value="">Toutes les actions</option>
            <option value="CREATE">Création</option>
            <option value="UPDATE">Modification</option>
            <option value="DELETE">Suppression</option>
            <option value="UPDATE_STATUS">Changement statut</option>
            <option value="LOGIN">Connexion</option>
          </select>

          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="border border-gray-300 rounded-2xl px-4 py-3" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="border border-gray-300 rounded-2xl px-4 py-3" />

          <button type="button" onClick={resetFilters} className="text-black hover:text-black font-medium">
            Réinitialiser
          </button>
        </form>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-orange-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-black">Aucun log trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-black w-48">Date & Heure</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-black w-52">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-black w-36">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-black w-40">Entité</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-black">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-black whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-black" />
                        <span className="font-medium">{log.userName || 'Système'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                        log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-black">{log.entity}</td>

                    {/* Colonne Détails optimisée */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-black truncate pr-2">
                          {log.details 
                            ? typeof log.details === 'string' 
                              ? log.details 
                              : JSON.stringify(log.details).slice(0, 30) + '...'
                            : '-'}
                        </div>
                        {log.details && (
                          <button 
                            onClick={() => openDetails(log)}
                            className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 text-sm font-medium whitespace-nowrap flex-shrink-0 px-3 py-1 hover:bg-orange-50 rounded-xl transition"
                          >
                            <FontAwesomeIcon icon={faEye} />
                            Voir tout
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Précédent
          </button>
          
          <span className="px-6 py-3 font-medium">Page {page} sur {totalPages}</span>
          
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-50 flex items-center gap-2"
          >
            Suivant <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Modal Détails */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center border-b px-8 py-5">
              <h2 className="text-2xl font-semibold">Détails du Log</h2>
              <button onClick={closeModal} className="text-black hover:text-black text-2xl">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-black">Date</p>
                  <p className="font-medium">{new Date(selectedLog.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-black">Utilisateur</p>
                  <p className="font-medium">{selectedLog.userName || 'Système'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-black">Action</p>
                <p className="inline-flex px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {selectedLog.action}
                </p>
              </div>

              <div>
                <p className="text-sm text-black">Entité</p>
                <p className="font-medium">{selectedLog.entity}</p>
              </div>

              {selectedLog.entityId && (
                <div>
                  <p className="text-sm text-black">ID Entité</p>
                  <p className="font-mono bg-gray-100 px-3 py-1.5 rounded-lg inline-block">{selectedLog.entityId}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-black mb-3">Détails complets</p>
                <pre className="bg-gray-900 text-black p-6 rounded-2xl overflow-auto text-sm font-mono leading-relaxed">
                  {typeof selectedLog.details === 'string' 
                    ? selectedLog.details 
                    : JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="border-t px-8 py-5 flex justify-end">
              <button onClick={closeModal} className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}