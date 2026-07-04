export default function FooterColumn({ title, links, onLinkClick }) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest uppercase text-white mb-6">{title}</h4>
      <ul className="flex flex-col gap-4 text-sm font-light">
        {links.map((link) => (
          <li key={link}>
            <button
              onClick={() => onLinkClick ? onLinkClick(link) : null}
              className="hover:text-white transition-colors text-left"
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
