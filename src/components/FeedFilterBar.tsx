import React, { useState, useRef, useEffect } from 'react';
import { Filter, Users, Globe, ChevronDown, Check, Layers } from 'lucide-react';

export type FeedFilterType = 'all' | 'friends' | 'groups';

interface FeedFilterBarProps {
  activeFilter: FeedFilterType;
  onChangeFilter: (filter: FeedFilterType) => void;
  counts: {
    all: number;
    friends: number;
    groups: number;
  };
  darkMode: boolean;
}

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({
  activeFilter,
  onChangeFilter,
  counts,
  darkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOptions: { id: FeedFilterType; label: string; icon: React.ElementType; description: string; count: number }[] = [
    {
      id: 'all',
      label: 'All Posts',
      icon: Layers,
      description: 'See activity from all friends, groups, and public feeds',
      count: counts.all,
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: Users,
      description: 'Posts exclusively shared by your connected friends',
      count: counts.friends,
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: Globe,
      description: 'Updates & discussions from your joined communities',
      count: counts.groups,
    },
  ];

  const currentOption = filterOptions.find((o) => o.id === activeFilter) || filterOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div
      className={`p-2.5 px-3 rounded-lg border shadow-xs transition-colors flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 ${
        darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
      }`}
    >
      {/* Title & Dropdown Selector */}
      <div className="flex items-center justify-between sm:justify-start gap-2.5 relative" ref={dropdownRef}>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Filter className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[11px]">Feed:</span>
        </div>

        {/* Dropdown Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
            darkMode
              ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-blue-400'
              : 'bg-blue-50/80 border-blue-200 hover:bg-blue-100 text-blue-700'
          }`}
        >
          <CurrentIcon className="w-3.5 h-3.5" />
          <span>{currentOption.label}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-200/60 dark:bg-blue-900/80 font-bold">
            {currentOption.count}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu Overlay */}
        {isOpen && (
          <div
            className={`absolute top-full left-0 mt-1.5 w-64 sm:w-72 rounded-lg border shadow-xl z-40 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150 ${
              darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
            }`}
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/60 mb-1">
              Select Feed Filter
            </div>

            <div className="space-y-1">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = activeFilter === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onChangeFilter(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-md text-xs flex items-start gap-2.5 transition-colors ${
                      isSelected
                        ? darkMode
                          ? 'bg-blue-950/60 text-blue-300 font-medium'
                          : 'bg-blue-50 text-blue-700 font-medium'
                        : darkMode
                        ? 'hover:bg-gray-800 text-gray-200'
                        : 'hover:bg-gray-50 text-slate-800'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs">{option.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : darkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {option.count}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {option.description}
                      </p>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Filter Pill Buttons (for 1-tap switching) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
        {filterOptions.map((option) => {
          const isSelected = activeFilter === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onChangeFilter(option.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{option.label}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
