import { useState, useEffect } from 'preact/hooks'
import { checkPocketBaseHealth, getCurrentDuplaId, getDuplaById } from '../lib/pocketbase.js'

export function Header({ currentPath = '/', onNavigate }) {
  const [pbOnline, setPbOnline] = useState(false)
  const [activeDupla, setActiveDupla] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function checkStatus() {
      const online = await checkPocketBaseHealth()
      if (isMounted) setPbOnline(online)

      const currentId = getCurrentDuplaId()
      if (currentId) {
        const d = await getDuplaById(currentId)
        if (isMounted) setActiveDupla(d)
      } else {
        if (isMounted) setActiveDupla(null)
      }
    }

    checkStatus()
    const timer = setInterval(checkStatus, 15000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [currentPath])

  const navItems = [
    { path: '/', label: 'Contexto', icon: '🏫' },
    { path: '/setup', label: 'Setup', icon: '📝' },
    { path: '/workspace', label: 'Workspace', icon: '🎒' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7EE] shadow-md border-b-2 border-amber-200/80 w-full overflow-hidden">
      {/* Régua Escolar Esqueomórfica no topo */}
      <div className="ruler-ticks h-6 w-full flex items-end px-3 select-none overflow-hidden opacity-85">
        <div className="flex justify-between w-full text-[9px] font-mono font-bold text-slate-500 pb-0.5">
          <span>0 cm</span>
          <span className="hidden sm:inline">5 cm</span>
          <span>10 cm</span>
          <span className="hidden sm:inline">15 cm</span>
          <span>20 cm</span>
          <span className="hidden sm:inline">25 cm</span>
          <span>30 cm</span>
        </div>
      </div>

      {/* Conteúdo Principal do Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo Bob Cute com título com mínimo de 2rem no desktop e clamp fluido no mobile */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-linear-to-b from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-[0_4px_0_#B45309] border-2 border-amber-600 group-hover:scale-105 transition-transform shrink-0">
              🎒
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[clamp(1.4rem,4.5vw,2rem)] sm:text-[2rem] font-bold font-heading text-slate-800 tracking-tight leading-none group-hover:text-amber-700 transition-colors">
                  EndoMkt<span className="text-orange-500">.Edu</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300 shrink-0">
                  Missão
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium font-hand hidden sm:block">
                Endomarketing & Pertencimento Escolar
              </p>
            </div>
          </div>

          {/* Status PocketBase no mobile (canto direito do header compacto) */}
          <div 
            title={pbOnline ? 'PocketBase Conectado (Online)' : 'Modo Local Ativo'}
            className={`sm:hidden flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
              pbOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${pbOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{pbOnline ? 'PB' : 'Local'}</span>
          </div>
        </div>

        {/* Indicador de Dupla Ativa e Navegação */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 flex-wrap">
          {activeDupla && (
            <div 
              onClick={() => onNavigate('/workspace')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 rounded-xl border border-amber-300 shadow-2xs cursor-pointer hover:bg-amber-200/80 transition-colors max-w-[170px] sm:max-w-none"
            >
              <span className="text-sm">📎</span>
              <div className="text-[11px] min-w-0">
                <span className="font-bold text-amber-900 block font-heading truncate">
                  {activeDupla.nome_dupla}
                </span>
              </div>
            </div>
          )}

          {/* Status PocketBase em telas maiores */}
          <div 
            title={pbOnline ? 'PocketBase Conectado (Online)' : 'Modo Offline / Persistência Local'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              pbOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs' 
                : 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${pbOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{pbOnline ? 'PocketBase' : 'Modo Local'}</span>
          </div>

          {/* Abas de Navegação */}
          <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto sm:ml-0">
            {navItems.map((item) => {
              const isActive = currentPath === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`btn-bob text-xs sm:text-sm px-2.5 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-all ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 border-2 border-amber-600 shadow-[0_3px_0_#B45309]'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-heading font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
