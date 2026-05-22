export default function FeatureHeader({ title, description }) {
  return (
    <div className="pt-32 pb-16 px-6 md:px-12 max-w-[100rem] mx-auto reveal-on-scroll">
      <h1 className="text-4xl md:text-7xl font-semibold tracking-tighter uppercase mb-6 leading-none">{title}</h1>
      <p className="text-sm md:text-base font-light text-neutral-400 max-w-xl tracking-wide">{description}</p>
    </div>
  );
}
