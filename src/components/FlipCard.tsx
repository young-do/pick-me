import { ReactNode, useEffect, useState } from "react";
import "./FlipCard.css";

export type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
};

export const FlipCard = ({ front, back }: FlipCardProps) => {
  const [isFlipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!isFlipped) return;

    const id = setTimeout(() => setFlipped(false), 3000);
    return () => clearTimeout(id);
  }, [isFlipped]);

  return (
    <div
      className={`flip-card ${isFlipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!isFlipped)}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">{front}</div>
        <div className="flip-card-back">{back}</div>
      </div>
    </div>
  );
};
