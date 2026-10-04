// ============================================================
// FUNK EDU — Shared mission footer: dashboard escape + next step
// ============================================================
import { useStore } from "../store";
import type { Route } from "../routes";

/** Student progression chain: mission N → the screen that follows it. */
const STUDENT_NEXT: Record<number, { route: Route; mission: number | null; label: string }> = {
  1: { route: "mission", mission: 2, label: "Misi 02 · Target Hunter" },
  2: { route: "mission", mission: 3, label: "Misi 03 · Spectrum Strategy" },
  3: { route: "resistance-lab", mission: 4, label: "Misi 04 · Resistance Lab" },
  4: { route: "mission", mission: 5, label: "Misi 05 · Resistance Evolution" },
  5: { route: "mission", mission: 6, label: "Misi 06 · Wise Guardian" },
  6: { route: "clinical-room", mission: null, label: "Clinical Decision Room" },
};

interface MissionFooterProps {
  /** Student mission number shown on screen; omit on professional-only views. */
  mission?: number;
  /** Mission objective met — unlocks the next step. */
  complete: boolean;
  /** Present when the mission can be attempted again after a wrong verdict. */
  onRetry?: () => void;
}

export default function MissionFooter({ mission, complete, onRetry }: MissionFooterProps) {
  const { navigate, setMission, user } = useStore();
  const professional = user.experience === "professional";
  const next = !professional && mission ? STUDENT_NEXT[mission] : null;

  function goNext() {
    if (!next) return;
    if (next.mission !== null) setMission(next.mission);
    navigate(next.route);
  }

  return (
    <div className="card" style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button className="btn btn-ghost" onClick={() => navigate(professional ? "professional-dashboard" : "student-dashboard")}>
        ← Dashboard
      </button>
      {!complete && onRetry && (
        <button className="btn btn-danger" onClick={onRetry}>
          ↻ Coba lagi
        </button>
      )}
      <span style={{ flex: 1 }} />
      {next && (
        <button
          className="btn btn-primary"
          disabled={!complete}
          onClick={goNext}
          title={complete ? undefined : "Selesaikan misi ini terlebih dahulu"}
        >
          {complete ? `Lanjut: ${next.label} →` : `🔒 ${next.label}`}
        </button>
      )}
    </div>
  );
}
