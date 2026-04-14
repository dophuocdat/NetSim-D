import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Spark particle component
function SparkBurst({ active }: { active: boolean }) {
  const [sparks, setSparks] = useState<Array<{ id: number; angle: number; distance: number; size: number }>>([]);

  useEffect(() => {
    if (!active) return;
    const newSparks = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      angle: (360 / 10) * i + Math.random() * 20,
      distance: 40 + Math.random() * 30,
      size: 3 + Math.random() * 4,
    }));
    setSparks(newSparks);
    const timer = setTimeout(() => setSparks([]), 800);
    return () => clearTimeout(timer);
  }, [active]);

  if (sparks.length === 0) return null;

  return (
    <div className="spark-container">
      {sparks.map(s => {
        const rad = (s.angle * Math.PI) / 180;
        return (
          <motion.div
            key={s.id}
            className="spark"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * s.distance,
              y: Math.sin(rad) * s.distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              width: s.size,
              height: s.size,
              position: 'absolute',
              borderRadius: '50%',
              background: '#fbbf24',
              boxShadow: '0 0 8px #fbbf24',
              top: '50%',
              left: '50%',
              zIndex: 100,
            }}
          />
        );
      })}
    </div>
  );
}

// Layer wrapping animation variants
const layerVariants = {
  hidden: { 
    x: -180, 
    opacity: 0, 
    scale: 1.15,
    rotateY: -15,
  },
  visible: { 
    x: 0, 
    opacity: 1, 
    scale: 1,
    rotateY: 0,
    transition: { 
      type: 'spring' as const, 
      damping: 14, 
      stiffness: 120,
      mass: 0.8,
    }
  },
  exit: {
    x: 120,
    opacity: 0,
    scale: 1.3,
    rotateY: 15,
    transition: {
      duration: 0.4,
      ease: 'easeIn' as const,
    }
  }
};

// Glow pulse keyframes for CSS
const glowVariants = {
  idle: { 
    boxShadow: '0 8px 16px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)' 
  },
  glow: {
    boxShadow: [
      '0 8px 16px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
      '0 0 30px rgba(255, 255, 255, 0.6), 0 0 60px currentColor, inset 0 1px 1px rgba(255,255,255,0.4)',
      '0 8px 16px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
    ],
    transition: {
      duration: 0.8,
      times: [0, 0.4, 1],
    }
  }
};

interface PacketMatryoshkaProps {
  currentState: string;
  topo?: {
    source: { port: string; ip: string; mac: string };
    destination: { port: string; ip: string; mac: string };
    payload: string;
  };
}

export default function PacketMatryoshka({ currentState, topo }: PacketMatryoshkaProps) {
  const isEncapsulating = ['l4_packing', 'l3_packing', 'l2_packing', 'on_wire'].includes(currentState);
  const isDecapsulating = currentState === 'decapsulating';
  const isDelivered = currentState === 'delivered';

  const showL4 = ['l4_packing', 'l3_packing', 'l2_packing', 'on_wire'].includes(currentState);
  const showL3 = ['l3_packing', 'l2_packing', 'on_wire'].includes(currentState);
  const showL2 = ['l2_packing', 'on_wire'].includes(currentState);

  // For decapsulation, reverse strip
  const stripL2 = isDecapsulating || isDelivered;
  const stripL3 = isDelivered;

  // Spark triggers on layer completion
  const [sparkKey, setSparkKey] = useState(0);
  const [prevState, setPrevState] = useState(currentState);

  useEffect(() => {
    if (currentState !== prevState) {
      if (['l4_packing', 'l3_packing', 'l2_packing'].includes(currentState)) {
        setSparkKey(k => k + 1);
      }
      setPrevState(currentState);
    }
  }, [currentState, prevState]);

  const payloadText = topo?.payload || 'HTTP DATA';
  const portLabel = topo ? `Port: ${topo.destination.port}` : 'Port: 80';
  const ipLabel = topo ? `IP: ${topo.source.ip}` : 'IP: 10.0.0.1';
  const macLabel = topo ? `MAC: ${topo.source.mac}` : 'MAC: AABB';

  const payload = (
    <motion.div 
      className="payload-core"
      animate={isDelivered ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0px #10b981', '0 0 30px #10b981', '0 0 0px #10b981'] } : {}}
      transition={{ duration: 0.8 }}
    >
      {isDelivered ? '✅ ' : ''}{payloadText}
    </motion.div>
  );

  // Build layered nesting
  let content = payload;

  // L4 Layer
  if (isEncapsulating && showL4 && !stripL2) {
    content = (
      <AnimatePresence mode="wait">
        <motion.div
          key="l4"
          className="layer-box layer-l4"
          variants={layerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="layer-seal"
            variants={glowVariants}
            animate={currentState === 'l4_packing' ? 'glow' : 'idle'}
          />
          <div className="layer-title">{portLabel}</div>
          {content}
        </motion.div>
      </AnimatePresence>
    );
  } else if (isDecapsulating && !stripL3) {
    // During decapsulation, L4 is still visible
    content = (
      <motion.div className="layer-box layer-l4" layout>
        <div className="layer-title">{portLabel}</div>
        {content}
      </motion.div>
    );
  }

  // L3 Layer
  if (isEncapsulating && showL3 && !stripL2) {
    content = (
      <AnimatePresence mode="wait">
        <motion.div
          key="l3"
          className="layer-box layer-l3"
          variants={layerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="layer-seal"
            variants={glowVariants}
            animate={currentState === 'l3_packing' ? 'glow' : 'idle'}
          />
          <div className="layer-title">{ipLabel}</div>
          {content}
        </motion.div>
      </AnimatePresence>
    );
  } else if (isDecapsulating && !stripL2) {
    content = (
      <motion.div className="layer-box layer-l3" layout>
        <div className="layer-title">{ipLabel}</div>
        {content}
      </motion.div>
    );
  }

  // L2 Layer
  if (isEncapsulating && showL2) {
    content = (
      <AnimatePresence mode="wait">
        <motion.div
          key="l2"
          className="layer-box layer-l2"
          variants={layerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="layer-seal"
            variants={glowVariants}
            animate={currentState === 'l2_packing' ? 'glow' : 'idle'}
          />
          <div className="layer-title">{macLabel}</div>
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="matryoshka-anim-container" style={{ position: 'relative' }}>
      <SparkBurst active={sparkKey > 0} key={sparkKey} />
      <AnimatePresence mode="wait">
        {content}
      </AnimatePresence>
    </div>
  );
}
