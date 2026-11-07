import { useState, useEffect } from 'preact/hooks'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { SetupPage } from './pages/SetupPage.jsx'
import { WorkspacePage } from './pages/WorkspacePage.jsx'

export function App() {
  const getInitialPath = () => {
    // Suporte tanto a pathname quanto a hash para compatibilidade máxima de hospedagem
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '')
      if (['/', '/setup', '/workspace'].includes(hash)) return hash
    }
    const path = window.location.pathname
    if (['/setup', '/workspace'].includes(path)) return path
    return '/'
  }

  const [currentPath, setCurrentPath] = useState(getInitialPath)

  // Sincroniza histórico de navegação
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getInitialPath())
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('hashchange', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hashchange', handlePopState)
    }
  }, [])

  const handleNavigate = (path) => {
    setCurrentPath(path)
    window.history.pushState({}, '', path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-300 selection:text-amber-950">
      <Header currentPath={currentPath} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPath === '/' && <LandingPage onNavigate={handleNavigate} />}
        {currentPath === '/setup' && <SetupPage onNavigate={handleNavigate} />}
        {currentPath === '/workspace' && <WorkspacePage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
