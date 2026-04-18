import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';

const features = [
  {
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    title: 'Real‑time Chat',
    description: 'Instant message delivery with live typing indicators and read receipts.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    title: 'Group Chats',
    description: 'Create squads with avatars, custom names, and member management.',
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Secure & Private',
    description: 'Your conversations are yours. Token‑based auth keeps data safe.',
  },
  {
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    title: 'File Sharing',
    description: 'Drop images and files right into chat, no compression, instant preview.',
  },
];

const HomePage = () => (
  <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden">
    <Header />

    {/* Hero */}
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
      {/* Gradient glow */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50/60 dark:from-blue-950/30 to-transparent pointer-events-none -z-10" />

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-7 border border-blue-100 dark:border-blue-800 animate-fade-in">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        v2.0 — Now live
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
        Connect beyond<br />
        <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          boundaries
        </span>
      </h1>

      <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in">
        Real‑time messaging designed for teams and friends. Secure, lightning‑fast, and beautifully simple.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link
          to="/register"
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
        >
          Get Started Free
        </Link>
        <Link
          to="/login"
          className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
        >
          Sign In
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="text-center mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Everything you need</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="group p-7 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 text-center cursor-default"
          >
            <div className="w-14 h-14 mx-auto mb-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:shadow-brand">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{f.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA Banner */}
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-4xl p-10 sm:p-14 text-center overflow-hidden shadow-2xl shadow-blue-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to start chatting?</h2>
        <p className="text-blue-100 mb-8 text-sm sm:text-base max-w-sm mx-auto">Join thousands of people already using SyncChat every day.</p>
        <Link
          to="/register"
          className="inline-block px-8 py-3.5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:scale-[1.03] active:scale-[0.97]"
        >
          Create Free Account
        </Link>
      </div>
    </section>
  </div>
);

export default HomePage;