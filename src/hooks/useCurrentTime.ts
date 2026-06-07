import { useEffect, useState } from "react";

function useCurrentTime(intervalMs = 10000) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return currentTime;
}

export default useCurrentTime;