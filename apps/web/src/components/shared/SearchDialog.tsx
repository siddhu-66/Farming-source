import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

export function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="p-0">
      <div className="flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          autoFocus
          className="ml-2 w-full bg-transparent outline-none placeholder:text-gray-400"
          placeholder="Search across platform..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="p-4">
        {query ? (
          <p className="text-sm text-gray-500">No results found for "{query}"</p>
        ) : (
          <p className="text-sm text-gray-500">Start typing to search...</p>
        )}
      </div>
    </Dialog>
  );
}
