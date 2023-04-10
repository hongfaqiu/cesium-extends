import { useState, useEffect } from 'react';

function NowDate() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {date.toLocaleString()}
    </div>
  );
}

export default NowDate;
