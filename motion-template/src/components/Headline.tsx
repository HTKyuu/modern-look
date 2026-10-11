import type { ElementType } from "react";

type Segments = { text: string; accent?: boolean }[][];

interface Props {
  as?: ElementType;
  lines: Segments;
  className?: string;
  id?: string;
}

/** Renders configured headline lines; accent segments pick up the accent colour. */
export function Headline({ as: Tag = "h2", lines, className, id }: Props) {
  return (
    <Tag className={className} id={id}>
      {lines.map((line, i) => (
        <span className="headline__line" key={i}>
          {line.map((seg, j) => (seg.accent ? <span className="accent" key={j}>{seg.text}</span> : seg.text))}
          {/* keeps words separated for assistive tech when lines are rendered as blocks */}
          {i < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
