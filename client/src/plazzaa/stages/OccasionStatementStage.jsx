import { motion, useTransform } from 'motion/react';
import ScrollStage from '../components/ScrollStage';
import StageLayer from '../components/StageLayer';

const LINE_ONE = ['Sometimes', 'you', 'know', 'the', 'occasion.'];
const LINE_TWO = ['You', 'just', 'don’t', 'know', 'the', 'place.'];

/**
 * A statement on its own screen, centred and given room. The two lines arrive
 * word by word from opposite directions and settle into place — so the sentence
 * assembles in front of you rather than fading in as a block.
 */
function Word({ progress, word, index, total, direction }) {
  const step = 0.16 / Math.max(1, total);
  const start = 0.14 + index * step;
  const x = useTransform(progress, [start, start + 0.2, 0.88, 1], [direction * 150, 0, 0, direction * 210]);
  const y = useTransform(progress, [start, start + 0.2, 0.88, 1], [direction * 26, 0, 0, direction * 40]);
  const opacity = useTransform(progress, [start, start + 0.16, 0.9, 0.99], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, start + 0.2, 0.88, 1], [1.14, 1, 1, 1.2]);

  return (
    <motion.span
      className="inline-block"
      style={{ x, y, opacity, scale, willChange: 'transform, opacity' }}
    >
      {word}
    </motion.span>
  );
}

function Scene({ progress }) {
  return (
    <div className="flex h-full items-center justify-center px-5">
      <div className="mx-auto max-w-[1100px] text-center">
        <h2 className="text-h1 text-plz-ink">
          <span className="flex flex-wrap justify-center gap-x-[0.28em] gap-y-1">
            {LINE_ONE.map((word, i) => (
              <Word
                key={word + i}
                progress={progress}
                word={word}
                index={i}
                total={LINE_ONE.length}
                direction={-1}
              />
            ))}
          </span>
          <span className="mt-2 flex flex-wrap justify-center gap-x-[0.28em] gap-y-1 md:mt-4">
            {LINE_TWO.map((word, i) => (
              <Word
                key={word + i}
                progress={progress}
                word={word}
                index={i}
                total={LINE_TWO.length}
                direction={1}
              />
            ))}
          </span>
        </h2>

        <StageLayer
          progress={progress}
          vec={[0, 80]}
          depth={0.5}
          hold={[0.36, 0.88]}
          className="mt-10 md:mt-14"
        >
          <p className="mx-auto max-w-[44ch] text-lead text-plz-body">
            Tell Plazzaa what the night is for. It will show you where that actually
            happens, and what it costs.
          </p>
        </StageLayer>
      </div>
    </div>
  );
}

export default function OccasionStatementStage() {
  return (
    <ScrollStage id="occasions" length={2.8} mobileLength={2.4} backdrop="#FFFBEB">
      {(progress) => <Scene progress={progress} />}
    </ScrollStage>
  );
}
