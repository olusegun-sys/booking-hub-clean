import { useState, useEffect } from 'react';

function useCountUp(end, duration = 1000, startCounting = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting || end === 0) {
      setCount(end);
      return;
    }

    let startTime = null;
    const startValue = 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out
      setCount(Math.round(eased * (end - startValue) + startValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, startCounting]);

  return count;
}

export default useCountUp;