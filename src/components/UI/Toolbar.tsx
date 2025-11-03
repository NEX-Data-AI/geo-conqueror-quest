import { ReactNode } from "react";
import Card from "./Card";

type ToolbarProps = {
  children: ReactNode;
  className?: string;
};

const Toolbar = ({ children, className = "" }: ToolbarProps) => {
  return (
    <Card className={`px-3 py-2 flex items-center gap-2 ${className}`}>
      {children}
    </Card>
  );
};

export default Toolbar;
