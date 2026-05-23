import TrendBar from "./TrendBar";
import {
  current,
  trailingAvg,
  trendDir,
  statusRag,
  pctDelta,
  round,
  ragLabel,
} from "../../lib/rag";

export default function KpiTile({ kpi, buildingId }) {
  const series = kpi.series[buildingId] || [];
  const cur = current(series);
  const avg = trailingAvg(series, 4);
  const dir = trendDir(cur, avg, kpi.higherIsBetter);
  const status = cur == null ? "n" : statusRag(cur, kpi.target, kpi.higherIsBetter);
  const delta = pctDelta(cur, avg);
  const dec = kpi.unit === "index" ? 2 : kpi.unit === "days" ? 1 : 0;

  return (
    <div className="tile">
      <div className="name">{kpi.name}</div>
      <div className="big">
        <span className="num mono">{cur == null ? "—" : round(cur, dec)}</span>
        <span className="unit">{kpi.unit}</span>
        <span style={{ flex: 1 }} />
        <span className={`pill s-${status}`}>
          <span className={`dot d-${status}`} />
          {ragLabel[status]}
        </span>
      </div>
      <div className="avg">
        {avg == null
          ? "4-wk baseline forming"
          : `4-wk avg ${round(avg, dec)} · ${delta >= 0 ? "+" : ""}${round(delta, 0)}%`}
        {!kpi.higherIsBetter ? " · lower is better" : ""}
      </div>
      <TrendBar dir={dir} />
    </div>
  );
}
