import { ReactNode } from "react";
import Card from "./Card";

type PanelProps = {
  title: string;
  children: ReactNode;
};

const Panel = ({ title, children }: PanelProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
        {title}
      </h2>
      {children}
    </Card>
  );
};

export default Panel;
