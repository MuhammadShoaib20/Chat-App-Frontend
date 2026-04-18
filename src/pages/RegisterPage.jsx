import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { uploadFile } from '../services/uploadService';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2 MB allowed'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please pick an image'); return; }
    setFormData((prev) => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      let avatarUrl = '';
      if (formData.avatar) {
        const { url } = await uploadFile(formData.avatar);
        avatarUrl = url;
      }
      await register(formData.username, formData.email, formData.password, avatarUrl);
      toast.success('Account created!');
      navigate('/chat');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const EyeButton = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
      {show ? (
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : (
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-10 relative overflow-hidden transition-colors duration-300">

      <div className="absolute top-[-60px] right-[-60px] w-72 h-72 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      <div className="w-full max-w-lg z-10 animate-slide-up">

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-7 transition-all group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </Link>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-4xl shadow-2xl shadow-blue-500/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 p-8 sm:p-10 transition-colors duration-300">

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Join SyncChat</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Create your free account in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Avatar upload */}
            <div className="flex flex-col items-center pb-5 border-b border-gray-100 dark:border-gray-800">
              <label htmlFor="avatar-input" className="cursor-pointer group">
                <div className="relative w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 overflow-hidden ring-4 ring-white dark:ring-gray-900 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-900/40 transition-all duration-300">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute translate-x-14 -translate-y-7 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-md text-white group-hover:bg-blue-700 transition-colors">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" /></svg>
                </div>
              </label>
              <input id="avatar-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-3">Profile photo (optional)</span>
            </div>

            {/* Username + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Username</label>
                <input name="username" type="text" required value={formData.username} onChange={handleChange} className="input-base" placeholder="johndoe" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Email</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="input-base" placeholder="you@example.com" />
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <input name="password" type={showPass ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="input-base pr-10" placeholder="••••••••" />
                  <EyeButton show={showPass} onToggle={() => setShowPass(!showPass)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ml-1">Confirm</label>
                <div className="relative">
                  <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className="input-base pr-10" placeholder="••••••••" />
                  <EyeButton show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-1"
            >
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account…</>
              ) : 'Create Account'}
            </button>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;