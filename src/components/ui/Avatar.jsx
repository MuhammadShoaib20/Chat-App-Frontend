import { useState } from 'react';

const Avatar = ({ src, name, size = 10 }) => {
  const [error, setError] = useState(false);
  const initials = name?.charAt(0).toUpperCase() || '?';

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-${Math.max(Math.floor(size / 3.5), 1)}xl shadow-sm flex-shrink-0 ring-2 ring-white dark:ring-gray-800`}
    >
      {initials}
    </div>
  );
};

export default Avatar;