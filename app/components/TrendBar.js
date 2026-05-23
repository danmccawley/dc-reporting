// Amber pivots to green when trending toward goal, to red when trending away.
// Stays blank ("none") during the 4-week warm-up.
const SEG = {
  up: ["#EF9F27", "#97C459", "#639922", "#3B6D11"],
  down: ["#EF9F27", "#F09595", "#E24B4A", "#A32D2D"],
  flat: ["#EF9F27", "#EF9F27", "#EF9F27", "#EF9F27"],
  none: ["#ECEAE2", "#ECEAE2", "#ECEAE2", "#ECEAE2"],
};
const WORD = {
  up: ["Improving", "#5a8a1f", "\u2197"],
  down: ["Declining", "#b23030", "\u2198"],
  flat: ["Holding", "#b9810f", "\u2192"],
  none: ["Building baseline", "#9a988d", "\u00b7"],
};

export default function TrendBar({ dir }) {
  const segs = SEG[dir] || SEG.none;
  const [word, color, arrow] = WORD[dir] || WORD.none;
  return (
    <div>
      <div className="trendbar">
        {segs.map((c, i) => (
          <span key={i} style={{ background: c }} />
        ))}
      </div>
      <div className="trendword" style={{ color }}>
        <span className="arrow">{arrow}</span>
        {word}
      </div>
    </div>
  );
}
