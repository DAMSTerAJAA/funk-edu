// ============================================================
// FUNK EDU — App Root Router (state-driven, no react-router)
// ============================================================
import { useStore } from "./store";
import AppShell from "./components/AppShell";
import AuthScreen from "./screens/AuthScreen";
import ExamScreen from "./screens/ExamScreen";
import DashboardScreen from "./screens/DashboardScreen";
import WorkbenchScreen from "./screens/WorkbenchScreen";
import ClinicalRoomScreen from "./screens/ClinicalRoomScreen";
import CertificateScreen from "./screens/CertificateScreen";
import Mission1 from "./screens/missions/Mission1";
import Mission2 from "./screens/missions/Mission2";
import Mission3 from "./screens/missions/Mission3";
import Mission5 from "./screens/missions/Mission5";
import Mission6 from "./screens/missions/Mission6";

export default function App() {
  const { route, activeMission } = useStore();

  if (route === "auth") return <AuthScreen />;

  let content: React.ReactNode;
  switch (route) {
    case "pretest":
    case "posttest":
    case "final-challenge":
      content = <ExamScreen />;
      break;
    case "dashboard":
      content = <DashboardScreen />;
      break;
    case "mission": {
      const missionMap: Record<number, React.ReactNode> = {
        1: <Mission1 />,
        2: <Mission2 />,
        3: <Mission3 />,
        5: <Mission5 />,
        6: <Mission6 />,
      };
      content = missionMap[activeMission] ?? <MissionNavigator />;
      break;
    }
    case "workbench":
      content = <WorkbenchScreen />;
      break;
    case "clinical-room":
      content = <ClinicalRoomScreen />;
      break;
    case "certificate":
      content = <CertificateScreen />;
      break;
    default:
      content = <DashboardScreen />;
  }

  return <AppShell>{content}</AppShell>;
}

function MissionNavigator() {
  const { setMission, navigate } = useStore();
  return (
    <div className="card" style={{ textAlign: "center", padding: 48 }}>
      <h2>Pilih Misi dari Dashboard</h2>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setMission(1); navigate("dashboard"); }}>
        ← Dashboard
      </button>
    </div>
  );
}
