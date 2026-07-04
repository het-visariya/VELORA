import Icon from './Icon';

import eventPlannerImg from '../assets/event_planner.png';

export default function EventPlannerSection({ onLaunchScheduler }) {
  return (
    <section id="planner-section" className="py-24 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-[100rem] mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 reveal-on-scroll">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-500 mb-6 block">The Schedule</span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter uppercase mb-8 leading-tight">Seamless<br />Event<br />Planning</h2>
          <p className="text-sm font-light text-neutral-400 leading-relaxed mb-8 max-w-md">
            Schedule your aesthetic. Our integrated planner allows you to coordinate your wardrobe with your upcoming calendar events, ensuring your style is as organized as your life.
          </p>
          <button
            onClick={onLaunchScheduler}
            className="mt-12 border border-[#C5A880]/30 text-[#C5A880] px-16 py-5 text-[0.65rem] font-bold tracking-[0.4em] uppercase hover:bg-[#C5A880] hover:text-black hover:border-[#C5A880] hover:shadow-[0_0_35px_rgba(197,168,128,0.25)] hover:scale-105 transition-all duration-700 ease-premium flex items-center gap-4 group w-max"
          >
            Launch Scheduler
            <Icon icon="solar:arrow-right-linear" className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
        </div>
        <div
          className="lg:w-1/2 w-full aspect-video relative overflow-hidden rounded-sm group reveal-on-scroll"
          style={{ transitionDelay: '300ms' }}
        >
          <img
            src={eventPlannerImg}
            alt="Luxury Closet Planning"
            className="w-full h-full object-cover filter grayscale opacity-80 transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 right-6 border border-white/20 backdrop-blur-md bg-black/40 p-4 reveal-on-scroll" style={{ transitionDelay: '500ms' }}>
             <span className="text-[0.6rem] tracking-[0.3em] uppercase text-white font-bold block mb-1">Schedule Outlook</span>
             <span className="text-xs text-neutral-300">Paris Fashion Week • Sep 25</span>
          </div>
        </div>
      </div>
    </section>
  );
}
