import { motion, useTransform } from 'motion/react';
import ScrollStage from '../components/ScrollStage';
import StageLayer from '../components/StageLayer';

/**
 * A breath between scenes: one photograph filling the screen with a line of
 * type sitting in it. The image pushes in as you arrive and keeps pushing as
 * you leave, so the whole screen behaves the way the layers do — the page has
 * no static backdrop anywhere.
 */
function Scene({ progress, image, alt, statement, kicker, align }) {
  const imageScale = useTransform(progress, [0, 0.5, 1], [1.18, 1.04, 1.3]);
  const imageY = useTransform(progress, [0, 1], ['-3%', '3%']);
  const veil = useTransform(progress, [0, 0.18, 0.8, 1], [0.12, 0.44, 0.44, 0.12]);

  return (
    <>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ scale: imageScale, y: imageY, willChange: 'transform' }}
      >
        <img src={image} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      </motion.div>
      <motion.div aria-hidden="true" className="absolute inset-0 bg-plz-ink" style={{ opacity: veil }} />

      <StageLayer
        progress={progress}
        vec={[0, 70]}
        depth={0.6}
        hold={[0.16, 0.86]}
        className={
          'absolute inset-0 z-[3] flex flex-col px-5 pb-24 pt-24 md:px-10 ' +
          (align === 'end' ? 'items-start justify-end' : 'items-center justify-center text-center')
        }
      >
        {kicker && (
          <span className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/70">
            {kicker}
          </span>
        )}
        <p className="max-w-[20ch] text-h1 text-white md:max-w-[24ch]" style={{ textWrap: 'balance' }}>
          {statement}
        </p>
      </StageLayer>
    </>
  );
}

export default function FullBleedStage(props) {
  const { id, ...scene } = props;
  return (
    <ScrollStage id={id} length={2.6} mobileLength={2.2}>
      {(progress) => <Scene progress={progress} align={scene.align || 'end'} {...scene} />}
    </ScrollStage>
  );
}
