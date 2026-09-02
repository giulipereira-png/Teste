import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  ShieldAlert,
  Sparkles,
  Clock
} from 'lucide-react';
import { usePhotos } from '../../context/PhotosContext';
import { AdminUser } from '../../types';

export const AdminUsersManagerTab: React.FC = () => {
  const { 
    adminUsers, 
    currentAdminProfile, 
    addAdminUser, 
    updateAdminUser, 
    deleteAdminUser, 
    updateAdminPin 
  } = usePhotos();

  // New Professor Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Professor' | 'Coordenador Técnico' | 'Treinador' | 'Super Admin'>('Professor');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  // Edit Admin/Professor State
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<string>('');
  const [editPin, setEditPin] = useState('');

  // Master PIN change form
  const [masterPin, setMasterPin] = useState('');
  const [confirmMasterPin, setConfirmMasterPin] = useState('');
  const [isSavingMasterPin, setIsSavingMasterPin] = useState(false);
  const [masterPinSuccess, setMasterPinSuccess] = useState('');
  const [masterPinError, setMasterPinError] = useState('');

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (!newName.trim() || !newEmail.trim()) {
      setAdminError('Preencha o nome e o e-mail do professor.');
      return;
    }

    if (newPin.trim().length < 4) {
      setAdminError('A senha/PIN deve ter no mínimo 4 dígitos.');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setAdminError('As senhas digitadas não coincidem.');
      return;
    }

    // Check if email already exists
    const emailExists = adminUsers.some(
      (a) => a.email.toLowerCase() === newEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setAdminError('Já existe um usuário cadastrado com este e-mail.');
      return;
    }

    setIsSavingAdmin(true);
    const success = await addAdminUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      pin: newPin.trim(),
      isActive: true,
    });
    setIsSavingAdmin(false);

    if (success) {
      setAdminSuccess(`Perfil de professor "${newName.trim()}" cadastrado com sucesso com PIN de acesso!`);
      setNewName('');
      setNewEmail('');
      setNewPin('');
      setConfirmPin('');
      setShowAddForm(false);
      setTimeout(() => setAdminSuccess(''), 5000);
    } else {
      setAdminError('Erro ao gravar perfil. Tente novamente.');
    }
  };

  const handleStartEdit = (admin: AdminUser) => {
    setEditingAdminId(admin.id);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditRole(admin.role);
    setEditPin(admin.pin || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editEmail.trim()) return;

    await updateAdminUser(id, {
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      role: editRole,
      pin: editPin.trim() || undefined,
    });

    setEditingAdminId(null);
    setAdminSuccess('Dados do perfil atualizados com sucesso!');
    setTimeout(() => setAdminSuccess(''), 4000);
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    if (admin.email === 'giuli.pereira@gmail.com' || admin.role === 'Super Admin') {
      alert('O perfil de Administrador Geral principal não pode ser desativado.');
      return;
    }
    if (admin.isActive && adminUsers.filter((a) => a.isActive).length <= 1) {
      alert('Não é possível desativar o único usuário ativo do sistema.');
      return;
    }
    await updateAdminUser(admin.id, { isActive: !admin.isActive });
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.email === 'giuli.pereira@gmail.com' || admin.role === 'Super Admin') {
      alert('O perfil de Administrador Geral principal (giuli.pereira@gmail.com) é protegido e não pode ser excluído.');
      return;
    }
    if (confirm(`Tem certeza que deseja remover o acesso de ${admin.name} (${admin.email})?`)) {
      const ok = await deleteAdminUser(admin.id);
      if (ok) {
        setAdminSuccess(`Perfil de ${admin.name} removido com sucesso.`);
        setTimeout(() => setAdminSuccess(''), 4000);
      }
    }
  };

  const handleUpdateMasterPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPinError('');
    setMasterPinSuccess('');

    if (masterPin.trim().length < 4) {
      setMasterPinError('A senha mestre deve possuir no mínimo 4 caracteres.');
      return;
    }

    if (masterPin.trim() !== confirmMasterPin.trim()) {
      setMasterPinError('As senhas digitadas não coincidem.');
      return;
    }

    setIsSavingMasterPin(true);
    const ok = await updateAdminPin(masterPin.trim());
    setIsSavingMasterPin(false);

    if (ok) {
      setMasterPinSuccess('Senha mestre de administrador atualizada com sucesso no banco de dados!');
      setMasterPin('');
      setConfirmMasterPin('');
      setTimeout(() => setMasterPinSuccess(''), 5000);
    } else {
      setMasterPinError('Erro ao atualizar a senha mestre. Verifique a conexão.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Gestão de Acessos & Perfis</span>
          </div>
          <h3 className="text-xl font-bold text-white font-serif">
            Gestão de Professores e Treinadores
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Seu perfil administrativo (<strong>giuli.pereira@gmail.com</strong>) possui controle total. Cadastre e gerencie os perfis dos professores da equipe técnica com acesso dedicado às atividades de piscina.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Fechar Formulário' : '+ Novo Perfil de Professor'}</span>
        </button>
      </div>

      {/* Scope Explanation Card */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Como funciona o perfil de Professor / Treinador:</p>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Ao fazer login com o PIN cadastrado, o professor terá acesso restrito exclusivamente às rotinas esportivas: <strong>Lista de Chamada & Presença</strong> (treinos e campeonatos), <strong>Cadastro de Atletas</strong>, <strong>Lançamento de Tempos e Recordes</strong>, <strong>Agenda/Campeonatos</strong> e <strong>Mural de Recados</strong>. O acesso a configurações de segurança e administradores é restrito ao Administrador Geral.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {adminSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{adminSuccess}</span>
        </div>
      )}

      {adminError && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{adminError}</span>
        </div>
      )}

      {/* Add New Professor Form */}
      {showAddForm && (
        <form onSubmit={handleAddAdminSubmit} className="p-6 rounded-2xl bg-[#081528] border-2 border-[#d4af37]/40 space-y-5 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-[#1e3a5f] pb-3">
            <UserPlus className="w-4 h-4 text-[#d4af37]" />
            <span>Cadastrar Novo Perfil de Professor / Treinador</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nome do(a) Professor(a) / Técnico(a) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Prof. Camila Ferreira"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                E-mail Profissional *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ex: camila.ferreira@acedep.org.br"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tipo de Perfil *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Professor">Professor(a) / Treinador(a) (Chamada, Atletas, Tempos, Agenda, Recados)</option>
                <option value="Coordenador Técnico">Coordenador Técnico</option>
                <option value="Super Admin">Administrador Geral (Acesso Completo)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Senha / PIN de Acesso *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e3a5f]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingAdmin}
              className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c058] text-[#060e1c] font-bold text-xs shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isSavingAdmin ? 'Gravando...' : 'Cadastrar Perfil de Professor'}
            </button>
          </div>
        </form>
      )}

      {/* Profiles List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
          <span>Equipe com Acesso ao Sistema ({adminUsers.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminUsers.map((admin) => {
            const isEditing = editingAdminId === admin.id;
            const isPrimarySuperAdmin = admin.email === 'giuli.pereira@gmail.com' || admin.role === 'Super Admin';

            return (
              <div
                key={admin.id}
                className={`p-5 rounded-2xl bg-[#0a192f] border transition-all shadow-md flex flex-col justify-between gap-4 ${
                  isPrimarySuperAdmin
                    ? 'border-[#d4af37]/60 ring-1 ring-[#d4af37]/30 bg-gradient-to-br from-[#0a192f] via-[#0d223f] to-[#0a192f]'
                    : admin.isActive 
                      ? 'border-[#1e3a5f] hover:border-[#d4af37]/40' 
                      : 'border-red-500/30 opacity-75'
                }`}
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome:</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">E-mail:</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Cargo / Função:</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white text-xs"
                        >
                          <option value="Professor">Professor(a) / Treinador(a)</option>
                          <option value="Coordenador Técnico">Coordenador Técnico</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Nova Senha / PIN:</label>
                        <input
                          type="password"
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value)}
                          placeholder="Manter atual se vazio"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingAdminId(null)}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(admin.id)}
                        className="px-3 py-1 rounded-lg bg-[#d4af37] text-black font-bold text-xs"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">{admin.name}</span>
                            {isPrimarySuperAdmin && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40">
                                Perfil Principal
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              admin.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {admin.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="text-xs text-[#d4af37] font-semibold mt-0.5 flex items-center gap-1.5">
                            <span>{admin.role === 'Super Admin' ? 'Administrador Geral' : `Perfil: ${admin.role}`}</span>
                            {admin.role === 'Professor' && (
                              <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 font-normal">
                                Chamada • Atletas • Tempos • Agenda • Recados
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-300 flex items-center gap-1 mt-1 font-mono">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{admin.email}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[#d4af37]">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>

                      {admin.lastLogin && (
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Último acesso: <strong>{admin.lastLogin}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#1e3a5f]/60 text-xs">
                      {!isPrimarySuperAdmin ? (
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            admin.isActive 
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {admin.isActive ? 'Desativar Acesso' : 'Ativar Acesso'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#f3e5ab] font-medium">Administrador Geral Protegido</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(admin)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Editar Perfil"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isPrimarySuperAdmin && (
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                            title="Remover Perfil de Professor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Change Master PIN Section */}
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 shadow-lg">
        <div className="border-b border-[#1e3a5f] pb-3">
          <h4 className="text-base font-bold text-white flex items-center gap-2 font-serif">
            <KeyRound className="w-4 h-4 text-[#d4af37]" />
            <span>Atualizar Senha Mestre de Emergência</span>
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Esta senha mestre permite o acesso geral em caso de emergência ou recuperação de credenciais.
          </p>
        </div>

        {masterPinSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{masterPinSuccess}</span>
          </div>
        )}

        {masterPinError && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{masterPinError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateMasterPinSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Nova Senha Mestre *
            </label>
            <input
              type="password"
              value={masterPin}
              onChange={(e) => setMasterPin(e.target.value)}
              placeholder="Digite a nova senha..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Confirmar Nova Senha *
            </label>
            <input
              type="password"
              value={confirmMasterPin}
              onChange={(e) => setConfirmMasterPin(e.target.value)}
              placeholder="Repita a nova senha..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSavingMasterPin || !masterPin.trim()}
            className="py-2.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#e5c058] text-[#060e1c] font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isSavingMasterPin ? 'Atualizando...' : 'Gravar Nova Senha Mestre'}
          </button>
        </form>
      </div>

    </div>
  );
};
