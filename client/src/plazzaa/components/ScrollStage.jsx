import { useRef } from 'react';
import useStageProgress from '../lib/useStageProgress';
import useMediaQuery from '../lib/useMediaQuery';

/**
 * A stage: a tall block of scroll with one screen pinned inside it.
 *
 * The pinned screen is edge-to-edge — nothing here constrains its children to a
 * content column. Scenes that need reading width apply `plz-edge` themselves,
 * which is what lets a focal image grow past the text grid and fill the
 * viewport instead of staying trapped in a card.
 *
 * Stage length is measured in screens of scroll. Roughly 3–4.5 screens is the
 * pacing telescope.fyi uses for a cinematic sequence; phones get a shorter
 * runway for the same choreography.
 */
export default function ScrollStage({
  children,
  id,
  length = 3.2,
  mobileLength = 2.6,
  backdrop,
  className = ''
}) {
  const ref = useRef(null);
  const progress = useStageProgress(ref);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const screens = isDesktop ? length : mobileLength;

  return (
    <section
      ref={ref}
      id={id}
      className={'relative ' + className}
      style={{ height: `${screens * 100}vh`, background: backdrop }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {typeof children === 'function' ? children(progress) : children}
      </div>
    </section>
  );
}
