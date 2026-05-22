const iconStyle = { fontSize: '1.25rem' };

export default function Icon({ icon, className = '', style = iconStyle, strokeWidth = '1.5' }) {
  return <iconify-icon icon={icon} class={className} style={style} stroke-width={strokeWidth}></iconify-icon>;
}
