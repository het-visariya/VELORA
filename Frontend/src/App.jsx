import { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ClosetPage from './pages/ClosetPage';
import OutfitBuilderPage from './pages/OutfitBuilderPage';
import PlannerPage from './pages/PlannerPage';
import AISuggestionsPage from './pages/AISuggestionsPage';
import TryOnPage from './pages/TryOnPage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import { useCloset } from './hooks/useCloset';
import outfitsApi from './api/outfits.api';
import plannerApi from './api/planner.api';
import aiApi from './api/ai.api';

const normalizeOutfit = (outfit) => ({
  ...outfit,
  createdAt: outfit.createdAt || (outfit.created_at ? new Date(outfit.created_at).toLocaleDateString() : ''),
  items: outfit.items || []
});

const normalizeEvent = (event) => ({
  ...event,
  assignedClothes: event.assignedClothes || event.assigned_clothes || []
});

export default function App() {
  const { isAuthenticated, user, login, logout, updateUser } = useContext(AuthContext);
  const { items: closetItems, setItems: setClosetItems, addItem: handleAddClosetItem, loadItems: loadClosetItems } = useCloset();

  const [isScrolled, setScrolled] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [view, setView] = useState('home');
  const lastScrollY = useRef(0);
  const [pendingView, setPendingView] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [plannerEvents, setPlannerEvents] = useState([]);
  const [plannerNotice, setPlannerNotice] = useState('');

  const handleViewChange = (newView) => {
    if (newView === 'profile' && isAuthenticated) {
      setShowProfile(true);
      return;
    }
    if (newView !== 'home' && !isAuthenticated) {
      setPendingView(newView);
      setShowSignIn(true);
    } else {
      setView(newView);
      window.scrollTo(0, 0);
    }
  };

  const handleLogout = () => {
    logout();
    setView('home');
    setShowProfile(false);
    setSavedOutfits([]);
    setPlannerEvents([]);
    setAnalysisData(null);
    setAnalysisError('');
    setAnalysisLoading(false);
    setPendingAnalyzeEmail(null);
    window.scrollTo(0, 0);
  };

  const loadSavedOutfits = async () => {
    if (!localStorage.getItem('velora_token')) return;
    try {
      const response = await outfitsApi.getSaved();
      setSavedOutfits((response.data || []).map(normalizeOutfit));
    } catch (err) {
      console.error('Failed to load outfits from backend:', err);
    }
  };

  const loadPlannerEvents = async () => {
    if (!localStorage.getItem('velora_token')) return;
    try {
      const response = await plannerApi.getEvents();
      setPlannerEvents((response.data || []).map(normalizeEvent));
    } catch (err) {
      console.error('Failed to load planner events from backend:', err);
    }
  };

  const handleSaveOutfit = async (outfit) => {
    const response = await outfitsApi.saveOutfit({
      name: outfit.name,
      items: outfit.items.map((item) => ({ id: item.id }))
    });
    const saved = normalizeOutfit({ ...response.data, items: outfit.items });
    setSavedOutfits((current) => [saved, ...current]);
    return saved;
  };

  const handleDeleteOutfit = async (outfitId) => {
    await outfitsApi.deleteOutfit(outfitId);
    setSavedOutfits((current) => current.filter((outfit) => outfit.id !== outfitId));
  };

  const handleAddPlannerEvent = async (event) => {
    const response = await plannerApi.addEvent(event);
    const saved = normalizeEvent(response.data);
    setPlannerEvents((current) => [saved, ...current]);
    const outfitText = saved.assignedClothes.length > 0
      ? ` with ${saved.assignedClothes.length} selected outfit item${saved.assignedClothes.length === 1 ? '' : 's'}`
      : '';
    setPlannerNotice(`Your event "${saved.title}" is being planned on ${saved.date}/${saved.month + 1}/${saved.year}${outfitText}.`);
    window.setTimeout(() => setPlannerNotice(''), 4500);
    return saved;
  };

  const handleDeletePlannerEvent = async (eventId) => {
    await plannerApi.deleteEvent(eventId);
    setPlannerEvents((current) => current.filter((event) => event.id !== eventId));
  };

  const [analysisData, setAnalysisData] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [pendingAnalyzeEmail, setPendingAnalyzeEmail] = useState(null);

  const handleAnalyzeStyle = async (email) => {
    const normalizedEmail = email?.trim() || user?.email?.trim();

    if (!isAuthenticated) {
      setPendingView('ai');
      setPendingAnalyzeEmail(normalizedEmail || null);
      setShowSignIn(true);
      return;
    }

    if (!normalizedEmail) {
      setAnalysisError('Please provide an email address to run your style analysis.');
      setView('ai');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError('');

    try {
      const response = await aiApi.analyzeStyle(normalizedEmail);
      const data = response.data || response;
      setAnalysisData(data);
      setView('ai');
    } catch (err) {
      console.error('Failed to analyze style:', err);
      setAnalysisError(err.message || 'Unable to generate your AI analysis at this time.');
      setView('ai');
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && pendingAnalyzeEmail) {
      const pendingEmail = pendingAnalyzeEmail;
      setPendingAnalyzeEmail(null);
      handleAnalyzeStyle(pendingEmail);
    }
  }, [isAuthenticated, pendingAnalyzeEmail]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadClosetItems();
    loadSavedOutfits();
    loadPlannerEvents();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleTriggerSignIn = () => setShowSignIn(true);
    window.addEventListener('trigger-signin', handleTriggerSignIn);
    return () => window.removeEventListener('trigger-signin', handleTriggerSignIn);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.className = 'bg-black text-neutral-50 antialiased selection:bg-amber-500/30 selection:text-amber-100 overflow-x-hidden';
    return () => { document.body.className = ''; };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showSignIn ? 'hidden' : '';
  }, [showSignIn]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          activeObserver.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    const observeElements = () => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    };

    const animationId = requestAnimationFrame(observeElements);
    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [view]);

  const renderView = () => {
    switch (view) {
      case 'closet':
        return <ClosetPage items={closetItems} setItems={setClosetItems} onAddItem={handleAddClosetItem} />;
      case 'builder':
        return <OutfitBuilderPage items={closetItems} savedOutfits={savedOutfits} setSavedOutfits={setSavedOutfits} onSaveOutfit={handleSaveOutfit} onDeleteOutfit={handleDeleteOutfit} />;
      case 'calendar':
        return <PlannerPage items={closetItems} savedOutfits={savedOutfits} events={plannerEvents} notice={plannerNotice} onAddEvent={handleAddPlannerEvent} onDeleteEvent={handleDeletePlannerEvent} />;
      case 'ai':
        return (
          <AISuggestionsPage
            analysis={analysisData}
            initialEmail={user?.email}
            onAnalyzeStyle={handleAnalyzeStyle}
            loading={analysisLoading}
            error={analysisError}
          />
        );
      case 'tryon':
        return <TryOnPage items={closetItems} />;
      default:
        return (
          <HomePage
            onExploreClick={() => handleViewChange('tryon')}
            onViewAllCloset={() => handleViewChange('closet')}
            onTryonClick={() => handleViewChange('tryon')}
            onEnterStudio={() => handleViewChange('builder')}
            onLaunchScheduler={() => handleViewChange('calendar')}
            onAnalyzeStyle={handleAnalyzeStyle}
          />
        );
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-full z-40 transition-transform duration-500 ease-premium ${isNavVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <Navigation isScrolled={isScrolled} setView={handleViewChange} view={view} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      </div>

      <main className="min-h-screen" key={view}>
        {renderView()}
      </main>

      <Footer setView={handleViewChange} isAuthenticated={isAuthenticated} />

      {showProfile && isAuthenticated && (
        <ProfilePage
          user={user}
          onUpdateUser={updateUser}
          onBack={() => setShowProfile(false)}
        />
      )}

      {showSignIn && (
        <SignInPage
          onSignIn={(name, email) => {
            login(name, email);
            setShowSignIn(false);
            if (pendingView) {
              setView(pendingView);
              setPendingView(null);
              window.scrollTo(0, 0);
            }
          }}
          onBack={() => {
            setShowSignIn(false);
            setPendingView(null);
          }}
        />
      )}
    </>
  );
}
