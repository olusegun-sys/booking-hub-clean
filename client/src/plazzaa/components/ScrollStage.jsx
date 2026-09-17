import { useRef } from 'react';
import useStageProgress from '../lib/useStageProgress';
import useMediaQuery from '../lib/useMediaQuery';

/**
 * Every section on the landing page is a stage: a tall block of scroll with one
 * screen pinned inside it. The page therefore never slides content past you in
 * the ordinary way — you travel through a sequence of held scenes, each one
 * assembling from outside the frame and then flying back out past the camera.
 *
 * Stages are deliberately long (about three screens each, the pacing
 * telescope.fyi uses) so a scene has time to arrive, be read, and leave.
 * Phones get the same choreography on a slightly shorter runway.
 *
 * A stage's own background cross-fades with its contents, so the moment where
 * one stage hands over to the next has nothing in it to see — no colour edge
 * sliding up the screen, no half-empty section.
 */
export default function ScrollStage({
  children,
  id,
  length = 3.2,          // screens of scroll
  mobileLength = 2.6,
  backdrop,              // colour that fades in with the scene
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
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-page">
          {typeof children === 'function' ? children(progress) : children}
        </div>
      </div>
    </section>
  );
}
