import Link from "next/link";
import { scopes, scopeMatrix, buildings } from "../../lib/mock/data";
import { ragFill, ragInk } from "../../lib/rag";

export default function HeatMap() {
  return (
    <div className="card">
      <div className="heat">
        <div className="hh" />
        {buildings.map((b) => (
          <div key={b.id} className="hh">
            {b.name}
          </div>
        ))}
        {scopes.map((s) => (
          <Cells key={s.slug} scope={s} />
        ))}
      </div>
      <div className="legend">
        <span><span className="sw" style={{ background: ragFill.g }} /> On track</span>
        <span><span className="sw" style={{ background: ragFill.a }} /> Watch</span>
        <span><span className="sw" style={{ background: ragFill.r }} /> Behind</span>
        <span><span className="sw" style={{ background: ragFill.n }} /> Not started</span>
        <span style={{ marginLeft: "auto", color: "var(--faint)" }}>
          Click any cell to drill down
        </span>
      </div>
    </div>
  );
}

function Cells({ scope }) {
  const row = scopeMatrix[scope.slug];
  return (
    <>
      <Link className="rl" href={`/scope/${scope.slug}`}>
        {scope.name}
      </Link>
      {buildings.map((b) => {
        const [pct, st] = row[b.id];
        return (
          <Link
            key={b.id}
            href={`/scope/${scope.slug}/${b.id}`}
            className="cell"
            style={{ background: ragFill[st], color: ragInk[st] }}
          >
            {st === "n" ? "—" : `${pct}%`}
          </Link>
        );
      })}
    </>
  );
}
