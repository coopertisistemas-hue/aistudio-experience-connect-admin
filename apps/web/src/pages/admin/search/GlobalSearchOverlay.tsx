import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '@/hooks/useGlobalSearch';
import { QUICK_ACTIONS, GROUP_ICONS, GROUP_PATHS, useRecentSearches } from '@/hooks/useGlobalSearch';
import { searchAll, groupResults } from './searchIndex';
import SearchResultRow from './SearchResultRow';

interface GlobalSearchOverlayProps {
  onClose: () => void;
}

const STATUS_LABEL_MAP: Record<string, string> = {
  confirmed: 'Reservas', transfers: 'Transfers',
  clients: 'Clientes', drivers: 'Motoristas',
};

function isMac(): boolean {
  return navigator.platform.toLowerCase().includes('mac');
}

export default function GlobalSearchOverlay({ onClose }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { getRecent, addRecent, clearRecent } = useRecentSearches();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    setRecentSearches(getRecent());
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [getRecent]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsSearching(false);
      setActiveIdx(-1);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(() => {
      setResults(searchAll(query));
      setIsSearching(false);
      setActiveIdx(-1);
    }, 150);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query]);

  // Flat navigable items
  const navigableItems = useMemo<SearchResult[]>(() => {
    if (query.length < 2) return [];
    return results;
  }, [results, query]);

  const grouped = useMemo(() => groupResults(results), [results]);

  const handleSelect = useCallback((result: SearchResult) => {
    addRecent(query.trim());
    navigate(result.path);
    onClose();
  }, [navigate, onClose, addRecent, query]);

  const handleQuickAction = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  const handleRecentSearch = useCallback((term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (navigableItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % navigableItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((prev) => prev <= 0 ? navigableItems.length - 1 : prev - 1);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(navigableItems[activeIdx]);
    }
  }, [navigableItems, activeIdx, handleSelect, onClose]);

  const isEmpty = query.length < 2;
  const hasResults = results.length > 0;
  const noResults = !isEmpty && !isSearching && !hasResults;
  const cmdKey = isMac() ? '⌘' : 'Ctrl';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-[12vh] -translate-x-1/2 w-full max-w-2xl mx-4 z-50 animate-slide-down"
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
      >
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden"
             style={{ boxShadow: '0 32px 80px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08)' }}>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {isSearching
                ? <i className="ri-loader-4-line text-navy-400 text-lg animate-spin"></i>
                : <i className="ri-search-line text-navy-400 text-lg"></i>
              }
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar reservas, clientes, motoristas, transfers…"
              className="flex-1 text-sm text-navy-800 placeholder-stone-400 bg-transparent outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-navy-500 text-[10px] font-medium">
                {cmdKey}
              </kbd>
              <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-navy-500 text-[10px] font-medium">
                K
              </kbd>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer flex-shrink-0"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto overscroll-contain">

            {/* Empty state — quick actions + recent */}
            {isEmpty && (
              <div className="p-4 space-y-5">
                {/* Quick actions */}
                <section>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-1 mb-2.5">Ações rápidas</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleQuickAction(action.path)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-stone-200/60 hover:border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer text-left group"
                      >
                        <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${action.bg} flex-shrink-0`}>
                          <i className={`${action.icon} ${action.color} text-sm`}></i>
                        </div>
                        <span className="text-navy-700 text-xs font-medium group-hover:text-navy-900 transition-colors">
                          {action.label}
                        </span>
                        <i className="ri-add-line text-stone-300 text-sm ml-auto"></i>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between px-1 mb-2.5">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Buscas recentes</p>
                      <button
                        type="button"
                        onClick={() => { clearRecent(); setRecentSearches([]); }}
                        className="text-[10px] text-stone-400 hover:text-navy-600 transition-colors cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => handleRecentSearch(term)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer text-left group"
                        >
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <i className="ri-time-line text-stone-300 text-sm group-hover:text-navy-400 transition-colors"></i>
                          </div>
                          <span className="text-navy-600 text-xs">{term}</span>
                          <i className="ri-arrow-right-up-line text-stone-300 text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Module navigation */}
                <section>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-1 mb-2.5">Navegar para</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.entries(GROUP_ICONS) as [string, string][]).map(([label, icon]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleQuickAction(GROUP_PATHS[label as keyof typeof GROUP_PATHS])}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200/60 hover:border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer group"
                      >
                        <i className={`${icon} text-stone-400 text-sm group-hover:text-navy-600 transition-colors`}></i>
                        <span className="text-navy-500 text-[11px] group-hover:text-navy-800 transition-colors">{label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Loading */}
            {!isEmpty && isSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-navy-400">
                  <i className="ri-loader-4-line text-xl animate-spin"></i>
                  <span className="text-sm font-light">Buscando…</span>
                </div>
              </div>
            )}

            {/* No results */}
            {noResults && (
              <div className="py-12 px-8 text-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-stone-100 mx-auto mb-4">
                  <i className="ri-search-line text-stone-400 text-xl"></i>
                </div>
                <p className="text-navy-700 text-sm font-medium mb-1">Sem resultados para "{query}"</p>
                <p className="text-stone-400 text-xs font-light">Tente buscar por nome, referência, e-mail ou rota.</p>
              </div>
            )}

            {/* Results */}
            {!isEmpty && !isSearching && hasResults && (
              <div className="p-3">
                {/* Stats bar */}
                <div className="flex items-center justify-between px-1 mb-3">
                  <p className="text-[10px] text-stone-400">
                    <span className="font-medium text-navy-600">{results.length}</span> resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                  </p>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[10px] text-stone-300">Navegar com</span>
                    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] text-navy-500">↑↓</kbd>
                    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] text-navy-500">Enter</kbd>
                  </div>
                </div>

                {/* Groups */}
                {Array.from(grouped.entries()).map(([group, items]) => {
                  const icon = GROUP_ICONS[group as keyof typeof GROUP_ICONS] ?? 'ri-folder-line';
                  return (
                    <div key={group} className="mb-4 last:mb-0">
                      {/* Group header */}
                      <div className="flex items-center gap-2 px-1 mb-1.5">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <i className={`${icon} text-stone-400 text-xs`}></i>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{group}</span>
                        <span className="text-[10px] text-stone-300 ml-auto">{items.length}</span>
                      </div>

                      {/* Result rows */}
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const globalIdx = navigableItems.findIndex((ni) => ni.id === item.id);
                          return (
                            <SearchResultRow
                              key={item.id}
                              result={item}
                              isActive={globalIdx === activeIdx}
                              onSelect={handleSelect}
                              onMouseEnter={() => setActiveIdx(globalIdx)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-stone-100 bg-stone-50/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center px-1 py-0.5 rounded bg-white border border-stone-200 text-[10px] text-navy-500">↑</kbd>
                <kbd className="inline-flex items-center px-1 py-0.5 rounded bg-white border border-stone-200 text-[10px] text-navy-500">↓</kbd>
                <span className="text-[10px] text-stone-400">navegar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] text-navy-500">Enter</kbd>
                <span className="text-[10px] text-stone-400">selecionar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] text-navy-500">Esc</kbd>
                <span className="text-[10px] text-stone-400">fechar</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-300 hidden md:block">
              Experience Connect — Busca operacional
            </p>
          </div>
        </div>
      </div>
    </>
  );
}