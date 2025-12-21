
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface UserManagementProps {
    currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form state
    const [formEmail, setFormEmail] = useState('');
    const [formName, setFormName] = useState('');
    const [formRole, setFormRole] = useState<'admin' | 'gestor' | 'prefeito'>('prefeito');
    const [formStates, setFormStates] = useState<string[]>([]);
    const [formPassword, setFormPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const availableStates = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setFormEmail('');
        setFormName('');
        setFormRole('prefeito');
        setFormStates([]);
        setFormPassword('');
        setError('');
        setShowAddModal(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setFormEmail(user.email);
        setFormName(user.full_name || '');
        setFormRole(user.role);
        setFormStates(user.states || []);
        setFormPassword('');
        setError('');
        setShowAddModal(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

        try {
            // Delete from profiles (auth user will remain but won't have access)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (err) {
            console.error('Erro ao excluir usuário:', err);
            alert('Erro ao excluir usuário');
        }
    };

    const handleSaveUser = async () => {
        setSaving(true);
        setError('');

        try {
            if (editingUser) {
                // Update existing user in profiles
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: formName,
                        role: formRole,
                        states: formStates
                    })
                    .eq('id', editingUser.id);

                if (error) throw error;
            } else {
                // Create new user via Supabase Auth
                if (!formPassword || formPassword.length < 6) {
                    setError('A senha deve ter pelo menos 6 caracteres');
                    setSaving(false);
                    return;
                }

                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formEmail,
                    password: formPassword,
                    options: {
                        data: {
                            display_name: formName
                        }
                    }
                });

                if (authError) throw authError;

                // Update the profile with role and states
                if (authData.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({
                            full_name: formName,
                            role: formRole,
                            states: formStates
                        })
                        .eq('id', authData.user.id);

                    if (profileError) throw profileError;
                }
            }

            setShowAddModal(false);
            fetchUsers();
        } catch (err: any) {
            console.error('Erro ao salvar usuário:', err);
            setError(err.message || 'Erro ao salvar usuário');
        } finally {
            setSaving(false);
        }
    };

    const toggleState = (state: string) => {
        if (formStates.includes(state)) {
            setFormStates(formStates.filter(s => s !== state));
        } else {
            setFormStates([...formStates, state]);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'gestor': return 'Gestor';
            case 'prefeito': return 'Prefeito';
            default: return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'gestor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'prefeito': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4 py-4 gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gerenciamento de Usuários</h2>
                <button
                    onClick={handleAddUser}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Novo Usuário
                </button>
            </div>

            <div className="space-y-3">
                {users.map(user => (
                    <div
                        key={user.id}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-slate-900 dark:text-white font-bold truncate">{user.full_name || 'Sem nome'}</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleColor(user.role)}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{user.email}</p>
                                {user.states && user.states.length > 0 && (
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                                        Estados: {user.states.join(', ')}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => handleEditUser(user)}
                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                </button>
                                {user.id !== currentUser.id && (
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Nome do usuário"
                                />
                            </div>

                            {!editingUser && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">E-mail</label>
                                        <input
                                            type="email"
                                            value={formEmail}
                                            onChange={(e) => setFormEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Senha</label>
                                        <input
                                            type="password"
                                            value={formPassword}
                                            onChange={(e) => setFormPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Função</label>
                                <select
                                    value={formRole}
                                    onChange={(e) => setFormRole(e.target.value as 'admin' | 'gestor' | 'prefeito')}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="prefeito">Prefeito</option>
                                    <option value="gestor">Gestor</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            {formRole === 'prefeito' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Estados</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableStates.map(state => (
                                            <button
                                                key={state}
                                                type="button"
                                                onClick={() => toggleState(state)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${formStates.includes(state)
                                                        ? 'bg-primary text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                {state}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSaveUser}
                                disabled={saving}
                                className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
                                        Salvar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
