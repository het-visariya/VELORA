import ProductCard from './ProductCard';

const products = [
  {
    badge: 'Bestseller',
    badgeClass: 'bg-black text-white border border-white/20 backdrop-blur-md font-medium',
    name: 'Obsidian Trench',
    description: 'Heavyweight Italian Wool',
    price: '$1,250',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp',
    hoverImage: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/30104e3c-5eea-4b93-93e9-5313698a7156_1600w.webp',
    hoverClass: 'filter grayscale',
    footer: 'stock',
  },
  {
    badge: 'New',
    badgeClass: 'bg-white text-black font-semibold',
    name: 'Silk Blend Trousers',
    description: 'Relaxed Fit',
    price: '$680',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg',
    hoverImage: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    delay: '100ms',
  },
  {
    name: 'Structural Blazer',
    description: 'Cashmere Blend',
    price: '$1,450',
    image: 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=800&auto=format&fit=crop',
    imageClass: 'filter grayscale',
    hoverClass: 'filter grayscale',
    delay: '200ms',
  },
  {
    badge: 'Limited Edition',
    badgeClass: 'bg-amber-600/20 text-amber-500 border border-amber-500/20 backdrop-blur-md font-medium',
    name: 'Monolith Boots',
    description: 'Calf Leather',
    price: '$950',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=800&auto=format&fit=crop',
    footer: 'offer',
    delay: '300ms',
  },
];

export default function FeaturedCollection({ onViewAll }) {
  return (
    <section id="collection" className="py-24 md:py-32 px-6 md:px-12 max-w-[100rem] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 reveal-on-scroll">
        <div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase mb-4">MY CLOSET</h2>
          <p className="text-sm font-light text-neutral-400 tracking-wide max-w-md">A curated sanctuary of your personal aesthetic. Organize, explore, and evolve your signature style with your most-loved pieces.</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold tracking-widest uppercase border-b border-white pb-1 hover:text-neutral-400 hover:border-neutral-400 transition-colors"
        >
          View My Closet
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
        {products.map((product) => <ProductCard key={product.name} product={product} />)}
      </div>
    </section>
  );
}
