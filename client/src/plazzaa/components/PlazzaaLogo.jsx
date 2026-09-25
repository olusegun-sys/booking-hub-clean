/**
 * The Plazzaa mark and wordmark, drawn as SVG.
 *
 * Vector rather than a pasted image: no background to strip, crisp at every
 * size and on every screen, recolourable for dark sections, and it costs one
 * request instead of a file download.
 *
 *   <PlazzaaLogo />              mark + wordmark
 *   <PlazzaaLogo variant="mark" />   just the bubble
 *   <PlazzaaLogo tone="light" />     for dark backgrounds
 */
export default function PlazzaaLogo({
  variant = 'full',
  tone = 'brand',
  size = 28,
  className = ''
}) {
  const brand = tone === 'light' ? '#FFFFFF' : '#2D60EA';
  const counter = tone === 'light' ? '#18181B' : '#FFFFFF';

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* the bubble: a rounded slab with a soft tail dropping from the lower left */}
      <path
        d="M20 2h16c12.15 0 22 9.85 22 22v9c0 12.15-9.85 22-22 22h-2.6c-3.4 0-6.2 2.2-7.9 5.1C23.3 63.4 20.4 64 17.8 62.6 14 60.6 12 56.6 12 52.3V10a8 8 0 0 1 8-8Z"
        fill={brand}
      />
      {/* the counter 'p' */}
      <path
        d="M24 16h2.6c1.4 0 2.6.9 3 2.2 2-1.7 4.6-2.7 7.4-2.7 6.9 0 12.4 5.7 12.4 12.9S44 41.3 37 41.3c-2.4 0-4.6-.7-6.4-2v8.5c0 1.8-1.4 3.2-3.2 3.2H24c-1.8 0-3.2-1.4-3.2-3.2V19.2c0-1.8 1.4-3.2 3.2-3.2Z"
        fill={counter}
      />
      {/* the dot inside the bowl */}
      <circle cx="37" cy="28.4" r="5" fill={brand} />
    </svg>
  );

  if (variant === 'mark') {
    return <span className={className}>{mark}</span>;
  }

  return (
    <span className={'inline-flex items-center gap-2 ' + className}>
      {mark}
      <span
        className="font-bold tracking-[-0.035em]"
        style={{ color: brand, fontSize: Math.round(size * 0.78) }}
      >
        Plazzaa
      </span>
    </span>
  );
}
