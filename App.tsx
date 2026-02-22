/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users,
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search,
  Trash2,
  AlertTriangle,
  Activity,
  User,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PontoRecord {
  id: number;
  discord_id: string;
  nome: string;
  entrada: string;
  saida: string | null;
  status: string;
}

interface Foragido {
  id: number;
  nome: string;
  descricao: string;
  veiculo: string;
  motivo: string;
  status: 'procurado' | 'preso';
  data_adicao: string;
}

const LOGO_URL = "https://i.ibb.co/VWpKF0gc/30ed0ea0ffbf167b6923665de3afcaa6.png";

export default function App() {
  const [pontoRecords, setPontoRecords] = useState<PontoRecord[]>([]);
  const [foragidos, setForagidos] = useState<Foragido[]>([]);
  const [activeTab, setActiveTab] = useState<'ponto' | 'foragidos'>('ponto');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newForagidoNome, setNewForagidoNome] = useState('');
  const [newForagidoDesc, setNewForagidoDesc] = useState('');
  const [newForagidoVeiculo, setNewForagidoVeiculo] = useState('');
  const [newForagidoMotivo, setNewForagidoMotivo] = useState('');
  const [isAddingForagido, setIsAddingForagido] = useState(false);
  const [selectedForagidoId, setSelectedForagidoId] = useState<number | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this should be handled server-side. 
    // For this request, we'll use a simple hardcoded check.
    if (adminPassword === 'fvmp3810kd') {
      setIsAdmin(true);
      setShowAdminPrompt(false);
      setAdminPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const fetchData = async () => {
    try {
      const [pontoRes, foragidosRes] = await Promise.all([
        fetch('/api/ponto'),
        fetch('/api/foragidos')
      ]);
      const pontoData = await pontoRes.json();
      const foragidosData = await foragidosRes.json();
      setPontoRecords(pontoData);
      setForagidos(foragidosData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddForagido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForagidoNome) return;

    try {
      const res = await fetch('/api/foragidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome: newForagidoNome, 
          descricao: newForagidoDesc,
          veiculo: newForagidoVeiculo,
          motivo: newForagidoMotivo
        })
      });
      if (res.ok) {
        setNewForagidoNome('');
        setNewForagidoDesc('');
        setNewForagidoVeiculo('');
        setNewForagidoMotivo('');
        setIsAddingForagido(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error adding foragido:", error);
    }
  };

  const handleUpdateForagidoStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/foragidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteForagido = async (id: number) => {
    if (!confirm("Confirmar exclusão permanente do registro?")) return;
    try {
      const res = await fetch(`/api/foragidos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting foragido:", error);
    }
  };

  const filteredPonto = pontoRecords.filter(r => 
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.discord_id.includes(searchTerm)
  );

  const filteredForagidos = foragidos.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeOfficers = pontoRecords.filter(r => r.status === 'ativo').length;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans grid-bg">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#161618] border-r border-white/10 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <img src={LOGO_URL} alt="FVMP Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
          <div className="hidden md:block">
            <h1 className="font-display font-bold text-lg leading-none tracking-tight">FVMP</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-mono">Metro Police</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('ponto')}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === 'ponto' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Clock className="w-5 h-5 shrink-0" />
            <span className="hidden md:block font-medium text-sm">Bate Ponto</span>
          </button>
          <button 
            onClick={() => setActiveTab('foragidos')}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === 'foragidos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="hidden md:block font-medium text-sm">Foragidos</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 glow-active"></div>
              <span className="text-[10px] font-mono uppercase text-white/40">Status do Sistema</span>
            </div>
            <p className="text-xs font-medium">Operacional</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-20 md:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-widest">
              <Activity className="w-3 h-3" />
              <span>ID: 1429205235615928443</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminPrompt(true)}
              className={`px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all border ${isAdmin ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
            >
              {isAdmin ? 'Sair do Admin' : 'Acesso Restrito'}
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar registros..."
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-48 md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#161618] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-24 h-24" />
              </div>
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">Oficiais em Serviço</p>
              <h3 className="text-3xl font-bold font-display">{activeOfficers}</h3>
            </div>
            <div className="bg-[#161618] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <ShieldAlert className="w-24 h-24" />
              </div>
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">Procurados Ativos</p>
              <h3 className="text-3xl font-bold font-display text-red-500">{foragidos.filter(f => f.status === 'procurado').length}</h3>
            </div>
            <div className="bg-[#161618] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <CheckCircle2 className="w-24 h-24" />
              </div>
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">Casos Encerrados</p>
              <h3 className="text-3xl font-bold font-display text-emerald-500">{foragidos.filter(f => f.status === 'preso').length}</h3>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'ponto' ? (
              <motion.div 
                key="ponto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Monitoramento de Ponto</h2>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Filter className="w-3 h-3 text-white/40" />
                    <span className="text-[10px] font-mono uppercase text-white/60">Filtro: Todos</span>
                  </div>
                </div>

                <div className="bg-[#161618] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="p-4 text-[10px] font-mono uppercase text-white/40 tracking-widest">Oficial</th>
                          <th className="p-4 text-[10px] font-mono uppercase text-white/40 tracking-widest">Entrada</th>
                          <th className="p-4 text-[10px] font-mono uppercase text-white/40 tracking-widest">Saída</th>
                          <th className="p-4 text-[10px] font-mono uppercase text-white/40 tracking-widest">Duração</th>
                          <th className="p-4 text-[10px] font-mono uppercase text-white/40 tracking-widest text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredPonto.length > 0 ? filteredPonto.map((record) => (
                          <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{record.nome}</p>
                                  <p className="text-[10px] font-mono text-white/40">{record.discord_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <Calendar className="w-3 h-3" />
                                {new Date(record.entrada).toLocaleString('pt-BR')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-xs text-white/60">
                                {record.saida ? new Date(record.saida).toLocaleString('pt-BR') : '---'}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-mono text-blue-400">
                                {record.saida ? calculateDuration(record.entrada, record.saida) : 'EM PATRULHA'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${record.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                {record.status === 'ativo' && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>}
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-white/20 font-mono text-xs uppercase tracking-widest">Nenhum registro encontrado</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="foragidos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Base de Dados Criminal</h2>
                  {isAdmin && (
                    <button 
                      onClick={() => setIsAddingForagido(!isAddingForagido)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      {isAddingForagido ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isAddingForagido ? 'Cancelar Cadastro' : 'Novo Registro'}
                    </button>
                  )}
                </div>

                {isAdmin && isAddingForagido && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    onSubmit={handleAddForagido}
                    className="bg-[#161618] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl"
                  >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-white/40 tracking-widest">Nome Completo / Vulgo</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: João 'Sombra' Silva"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={newForagidoNome}
                        onChange={(e) => setNewForagidoNome(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-white/40 tracking-widest">Motivo da Procura</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: Homicídio, Tráfico"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={newForagidoMotivo}
                        onChange={(e) => setNewForagidoMotivo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-white/40 tracking-widest">Veículos Conhecidos (Separe por vírgula)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Sultan [ABC-1234], Elegy [XYZ-9876]"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={newForagidoVeiculo}
                        onChange={(e) => setNewForagidoVeiculo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-white/40 tracking-widest">Observações Adicionais</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Visto pela última vez no Pier"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={newForagidoDesc}
                        onChange={(e) => setNewForagidoDesc(e.target.value)}
                      />
                    </div>
                  </div>
                    <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all uppercase tracking-widest text-xs">
                      Confirmar Registro no Sistema
                    </button>
                  </motion.form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredForagidos.length > 0 ? filteredForagidos.map((f) => (
                    <motion.div 
                      layout
                      key={f.id} 
                      onClick={() => setSelectedForagidoId(selectedForagidoId === f.id ? null : f.id)}
                      className={`bg-[#161618] border rounded-2xl p-6 relative group transition-all cursor-pointer
                        ${f.status === 'procurado' 
                          ? 'border-red-500/50 bg-red-500/[0.03] shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                          : 'border-emerald-500/50 bg-emerald-500/[0.03] shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        } ${selectedForagidoId === f.id ? 'ring-2 ring-blue-500/50' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${f.status === 'procurado' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          <User className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest border ${f.status === 'procurado' ? 'bg-red-500 text-white border-red-500' : 'bg-emerald-500 text-white border-emerald-500'}`}>
                            {f.status}
                          </span>
                          <ChevronRight className={`w-4 h-4 text-white/20 transition-transform ${selectedForagidoId === f.id ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                      
                      <h3 className={`text-xl font-display font-bold mb-1 transition-colors ${f.status === 'procurado' ? 'text-red-400' : 'text-emerald-400'}`}>{f.nome}</h3>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Registro: {new Date(f.data_adicao).toLocaleDateString('pt-BR')}</p>

                      <AnimatePresence>
                        {selectedForagidoId === f.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4 pt-4 border-t border-white/5">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                  <p className="text-[8px] font-mono uppercase text-white/40 mb-1">Motivo</p>
                                  <p className="text-xs font-bold text-white/90">{f.motivo || 'NÃO INFORMADO'}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                  <p className="text-[8px] font-mono uppercase text-white/40 mb-1">Veículos</p>
                                  <div className="flex flex-wrap gap-1">
                                    {f.veiculo ? f.veiculo.split(',').map((v, i) => (
                                      <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/5 text-white/90">
                                        {v.trim()}
                                      </span>
                                    )) : (
                                      <p className="text-xs font-bold text-white/90">NÃO INFORMADO</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-[8px] font-mono uppercase text-white/40 mb-1">Observações</p>
                                <p className="text-xs italic text-white/70 leading-relaxed">
                                  "{f.descricao || 'Nenhuma observação criminal registrada.'}"
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!selectedForagidoId && (
                        <div className="mt-2 text-[8px] font-mono uppercase text-white/20 text-center animate-pulse">
                          Clique para ver detalhes
                        </div>
                      )}

                      {isAdmin && (
                        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                          {f.status === 'procurado' ? (
                            <button 
                              onClick={() => handleUpdateForagidoStatus(f.id, 'preso')}
                              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 p-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Capturado
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateForagidoStatus(f.id, 'procurado')}
                              className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 p-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Reabrir
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteForagido(f.id)}
                            className="bg-white/5 hover:bg-red-500 text-white/40 hover:text-white p-2.5 rounded-xl transition-all border border-white/10 hover:border-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                      <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-white/20 font-mono text-xs uppercase tracking-widest">Nenhum registro criminal ativo</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Admin Password Prompt */}
        <AnimatePresence>
          {showAdminPrompt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#161618] border border-white/10 p-8 rounded-2xl max-w-sm w-full shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Acesso Restrito</h3>
                    <p className="text-xs text-white/40 font-mono uppercase">Autenticação Necessária</p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-widest">Senha de Acesso</label>
                    <input 
                      autoFocus
                      type="password" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowAdminPrompt(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="p-8 border-t border-white/10 mt-auto">
          <div className="flex justify-center items-center opacity-30 text-[10px] font-mono uppercase tracking-[0.4em]">
            <span>Feito por Turzim</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function calculateDuration(entrada: string, saida: string) {
  const start = new Date(entrada).getTime();
  const end = new Date(saida).getTime();
  const diff = end - start;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
