import { MouseEventHandler, useMemo, useState } from "react";

export default function Icon() {
  const [size, setSize] = useState(512);
  const saveSVG: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.currentTarget) {
      const svg = e.currentTarget as SVGSVGElement;
      console.log(svg.outerHTML)
      const f = new File([svg.outerHTML], `ordle.svg`, {
        type: "image/svg+xml",
      })
      // Download the file
      const a = document.createElement("a");
      a.href = URL.createObjectURL(f);
      a.download = f.name;
      a.click();
    }
  }

  const green = useMemo(() => {
    if (typeof document === undefined) return "green"
    return global.getComputedStyle(document.documentElement).getPropertyValue('--lightGreen')
  }, []);

  return (
    <div>
      <input type="number" value={size} onChange={(e) => setSize(Number(e.target.value))} />
      <h1>Icon</h1>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} width={size} height={size}
        onClick={saveSVG}
      >
        <rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          style={{ fill: green }}>

        </rect>
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 1.2}
          fontFamily="sans-serif"
          fontWeight="bold"
          style={{ fill: "white" }}>o</text>
      </svg>
    </div>
  );
}
