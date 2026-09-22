import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  animate?: boolean;
}

export function ScoreRing({ score, label, size = 200, animate = true }: ScoreRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 70
      ? 'rgb(var(--color-warning))'
      : score >= 40
        ? 'rgb(var(--color-info))'
        : 'rgb(var(--color-success))';

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--color-border))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorClass}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: animate ? 1.2 : 0, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold tabular-nums"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {animate ? (
            <CountUp end={score} />
          ) : (
            score
          )}
          %
        </motion.span>
        <span className="mt-1 text-sm text-muted text-center px-4 leading-tight">{label}</span>
      </div>
    </div>
  );
}

function CountUp({ end }: { end: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {end}
      </motion.span>
    </motion.span>
  );
}
