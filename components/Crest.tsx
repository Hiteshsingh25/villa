// The white crest (sun, "VILLA AURELIA", building). It is tinted dark in the
// scrolled header with a CSS filter on `.au-header-logo-scrolled img`.
export function Crest({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/crest.svg"
      alt="Villa Aurelia"
      width={size}
      height={size}
      data-reveal-skip
      className={`block object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
