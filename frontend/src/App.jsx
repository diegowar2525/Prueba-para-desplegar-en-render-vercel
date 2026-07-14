import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  UserPlus, 
  LogIn, 
  Loader, 
  Users, 
  CheckCircle, 
  XCircle, 
  Info,
  Calendar,
  X
} from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL;

function App() {
  // Authentication States
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Auth Form States
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Dashboard & CRUD States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null means "Create", otherwise "Edit"
  
  // User Form States
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Custom Toast Notification State
  const [toasts, setToasts] = useState([]);

  // Add a self-removing toast notification
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check for Google OAuth tokens in URL callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    
    // We also support the path /oauth-success
    if (oauthToken || window.location.pathname === '/oauth-success') {
      const activeToken = oauthToken || params.get('token');
      if (activeToken) {
        localStorage.setItem('token', activeToken);
        setToken(activeToken);
        addToast('Sesión iniciada con Google', 'success');
      }
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname === '/oauth-success' ? '/' : window.location.pathname);
    }
  }, []);

  // Fetch current user profile if token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setCurrentUser(null);
      setAuthLoading(false);
    }
  }, [token]);

  // Fetch all users once logged in
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      setAuthLoading(true);
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setCurrentUser(data.data);
      } else {
        // Token might be invalid or expired
        handleLogout();
        addToast(data.message || 'Sesión expirada', 'error');
      }
    } catch (err) {
      console.error(err);
      handleLogout();
      addToast('Error al conectar con el servidor', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        addToast(data.message || 'Error al cargar usuarios', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error de red al cargar usuarios', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      addToast('Por favor, completa todos los campos', 'error');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setCurrentUser(data.data);
        addToast('¡Bienvenido de nuevo!', 'success');
        // Clear login form
        setAuthEmail('');
        setAuthPassword('');
      } else {
        addToast(data.message || 'Credenciales inválidas', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error al conectar con el servidor', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authName || !authEmail || !authPassword) {
      addToast('Por favor, completa todos los campos', 'error');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setCurrentUser(data.data);
        addToast('Registro exitoso. ¡Bienvenido!', 'success');
        // Clear registration form
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      } else {
        addToast(data.message || 'Error en el registro', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error al conectar con el servidor', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    window.location.href = `${API_URL.replace('/api', '')}/api/auth/google`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCurrentUser(null);
    addToast('Sesión cerrada correctamente', 'info');
  };

  // Open Modal for Create User
  const openCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setShowModal(true);
  };

  // Open Modal for Edit User
  const openEditModal = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // Empty password field initially during edit
      role: user.role
    });
    setShowModal(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      addToast('El nombre y el correo son obligatorios', 'error');
      return;
    }

    // Email validation regex
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(userForm.email)) {
      addToast('Por favor ingrese un correo válido', 'error');
      return;
    }

    try {
      const url = editingUser 
        ? `${API_URL}/users/${editingUser._id}`
        : `${API_URL}/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Setup request body. For update, omit password if left blank.
      const requestBody = { ...userForm };
      if (editingUser && !requestBody.password) {
        delete requestBody.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      const data = await res.json();

      if (data.success) {
        addToast(data.message, 'success');
        setShowModal(false);
        fetchUsers();
        // If the user updated their own profile details, refresh the profile
        if (editingUser && editingUser._id === currentUser._id) {
          fetchProfile();
        }
      } else {
        addToast(data.message || 'Error al guardar el usuario', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error de red al guardar el usuario', 'error');
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        addToast('Usuario eliminado correctamente', 'success');
        fetchUsers();
      } else {
        addToast(data.message || 'No se pudo eliminar el usuario', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error de red al intentar eliminar el usuario', 'error');
    }
  };

  // Global Loading Spinner
  if (authLoading && !currentUser) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification Wrapper */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={18} color="var(--color-success)" />}
            {toast.type === 'error' && <XCircle size={18} color="var(--color-danger)" />}
            {toast.type === 'info' && <Info size={18} color="var(--color-primary)" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main App Layout */}
      {!currentUser ? (
        /* Login / Signup Screen */
        <div className="container flex-center" style={{ minHeight: '100vh' }}>
          <div className="auth-wrapper">
            <div className="auth-header">
              <h1 className="auth-title">Practica NodeJS</h1>
              <p className="auth-subtitle">CRUD de Usuarios & Autenticación JWT / Google OAuth</p>
            </div>

            <div className="glass-card">
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.5rem' }}>
                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                {authMode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Tu nombre completo" 
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        style={{ paddingLeft: '2.75rem' }}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="correo@ejemplo.com" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{ paddingLeft: '2.75rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{ paddingLeft: '2.75rem' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={authLoading}>
                  {authLoading ? (
                    <Loader size={18} className="spinner" style={{ margin: 0, width: '18px', height: '18px' }} />
                  ) : authMode === 'login' ? (
                    <>
                      <LogIn size={18} /> Iniciar Sesión
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} /> Registrarse
                    </>
                  )}
                </button>
              </form>

              <div className="auth-divider">o continuar con</div>

              <button onClick={handleGoogleLogin} className="btn btn-google" style={{ width: '100%' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.25rem' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Iniciar sesión con Google
              </button>


              <div className="auth-toggle">
                {authMode === 'login' ? (
                  <>
                    ¿No tienes una cuenta? 
                    <button onClick={() => setAuthMode('register')} className="auth-toggle-btn">Regístrate</button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes una cuenta? 
                    <button onClick={() => setAuthMode('login')} className="auth-toggle-btn">Inicia Sesión</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Dashboard */
        <>
          <header>
            <div className="nav-container">
              <div className="logo">
                <Shield size={24} style={{ color: 'var(--color-accent)' }} />
                <span>AdminPortal</span>
              </div>
              <div className="user-profile-nav">
                <div style={{ textAlign: 'right', display: 'none', display: 'block' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{currentUser.email}</div>
                </div>
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="avatar" />
                ) : (
                  <div className="avatar">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button onClick={handleLogout} className="btn btn-secondary btn-icon" title="Cerrar Sesión">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          <main className="container">
            {/* Dashboard Welcome Area & CRUD Operations Button */}
            <div className="dashboard-actions">
              <div className="dashboard-title-area">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Listado de Usuarios</h1>
                <p className="dashboard-subtitle">Gestiona registros, edita datos y elimina perfiles del sistema</p>
              </div>
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus size={18} /> Agregar Usuario
              </button>
            </div>

            {/* User List Table */}
            <div className="glass-card" style={{ padding: '1rem' }}>
              {usersLoading ? (
                <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Cargando usuarios registrados...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} className="empty-state-icon" />
                  <h3>No hay usuarios registrados</h3>
                  <p>Crea un nuevo usuario usando el botón superior derecho para comenzar.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Registro</th>
                        <th>Rol</th>
                        <th>Proveedor</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="user-cell">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="user-cell-img" />
                              ) : (
                                <div className="user-cell-initial">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span style={{ fontWeight: 600 }}>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              <Calendar size={14} />
                              {new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${user.role}`}>
                              {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                          </td>
                          <td>
                            {user.googleId ? (
                              <span className="badge badge-google">Google</span>
                            ) : (
                              <span className="badge badge-local">Local</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button onClick={() => openEditModal(user)} className="btn btn-secondary btn-icon" title="Editar">
                                <Edit size={16} color="var(--color-accent)" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user._id)} 
                                className="btn btn-secondary btn-icon" 
                                title="Eliminar"
                                disabled={user._id === currentUser._id}
                              >
                                <Trash2 size={16} color="var(--color-danger)" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* CRUD Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contraseña {editingUser && <span style={{ textTransform: 'lowercase', color: 'var(--text-muted)' }}>(dejar en blanco para no cambiar)</span>}
                </label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder={editingUser ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                  required={!editingUser}
                  minLength={userForm.password ? 6 : undefined}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol del Sistema</label>
                <select 
                  className="form-input form-select"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
