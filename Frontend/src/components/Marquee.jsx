export default function Marquee() {
  const items = ['Only a few pieces remaining', 'Selling fast', 'Exclusive online drop', 'Complimentary express shipping'];
  return (
    <div className="border-y border-white/10 py-3 overflow-hidden bg-black relative flex">
      <div className="animate-marquee flex gap-12 text-[0.65rem] tracking-widest uppercase font-medium text-neutral-400 items-center min-w-full">
        {[...items, ...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-12 flex-shrink-0">
            <span>{item}</span>
            <span className="text-amber-500/80 text-xl">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
