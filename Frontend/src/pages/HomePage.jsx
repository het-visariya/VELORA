import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import FeaturedCollection from '../components/FeaturedCollection';
import Editorial from '../components/Editorial';
import OutfitBuilderSection from '../components/OutfitBuilderSection';
import EventPlannerSection from '../components/EventPlannerSection';
import AISuggestionsSection from '../components/AISuggestionsSection';

export default function HomePage({ onExploreClick, onViewAllCloset, onTryonClick, onEnterStudio, onLaunchScheduler, onAnalyzeStyle }) {
  return (
    <>
      <Hero onExploreClick={onExploreClick} />
      <Marquee />
      <FeaturedCollection onViewAll={onViewAllCloset} />
      <Editorial onTryonClick={onTryonClick} />
      <OutfitBuilderSection onEnterStudio={onEnterStudio} />
      <EventPlannerSection onLaunchScheduler={onLaunchScheduler} />
      <AISuggestionsSection onAnalyzeStyle={onAnalyzeStyle} />
    </>
  );
}
