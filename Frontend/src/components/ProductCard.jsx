export default function ProductCard({ product }) {
  return (
    <div className="group reveal-on-scroll" style={{ transitionDelay: product.delay }}>
      <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden mb-6">
        <img src={product.image} alt="Product" className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-premium group-hover:scale-105 ${product.imageClass || ''}`} />
        <img src={product.hoverImage} alt="Product Alternate" className={`absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-premium group-hover:opacity-100 ${product.hoverClass || ''}`} />
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold tracking-tight uppercase mb-1">{product.name}</h3>
          <p className="text-xs text-neutral-500 font-light tracking-wide">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
