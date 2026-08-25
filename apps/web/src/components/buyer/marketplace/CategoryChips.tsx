'use client';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Flowers',
  'Medicinal',
  'Organic',
  'Waste Products'
];

interface CategoryChipsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat || (selected === '' && cat === 'All');
        return (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat === 'All' ? '' : cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isSelected 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50'
            }`}
          >
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}
