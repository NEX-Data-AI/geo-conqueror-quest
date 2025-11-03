import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`rounded-2xl bg-slate-900/80 border border-slate-700 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
