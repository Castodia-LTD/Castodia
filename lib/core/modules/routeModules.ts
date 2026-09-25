import type { ModuleKey } from "./availableModules";

type RouteModule = {
  prefix: string;
  moduleKey: ModuleKey;
};

const routeModules: RouteModule[] = [
  { prefix: "/care/manager/insights", moduleKey: "insights" },
  { prefix: "/care/manager/calendar", moduleKey: "calendar" },
  { prefix: "/care/manager/rota", moduleKey: "rota" },
  { prefix: "/care/manager/staff", moduleKey: "staff" },
  { prefix: "/care/manager/emar", moduleKey: "medication" },
  { prefix: "/care/manager/safeguarding", moduleKey: "safeguarding" },
  { prefix: "/care/manager/compliance", moduleKey: "compliance" },
  { prefix: "/care/manager/incidents", moduleKey: "incidents" },
  { prefix: "/care/manager/reports", moduleKey: "reports" },
  { prefix: "/care/manager/service-users", moduleKey: "people" },
  { prefix: "/care/support/rota", moduleKey: "rota" },
  { prefix: "/care/support/timelines", moduleKey: "timelines" },
  { prefix: "/care/support/handovers", moduleKey: "handovers" },
  { prefix: "/care/support/reporting/safeguarding", moduleKey: "safeguarding" },
  { prefix: "/care/support/service-users", moduleKey: "people" },
  { prefix: "/family/growth", moduleKey: "family_growth" },
];

const personSubRouteModules: Array<{ segment: string; moduleKey: ModuleKey }> = [
  { segment: "/growth", moduleKey: "growth" },
  { segment: "/medication", moduleKey: "medication" },
  { segment: "/care-plans", moduleKey: "care_plans" },
  { segment: "/risk-assessments", moduleKey: "risk_assessments" },
  { segment: "/body-maps", moduleKey: "body_maps" },
  { segment: "/memories", moduleKey: "memories" },
  { segment: "/mental-capacity", moduleKey: "mental_capacity" },
  { segment: "/reviews", moduleKey: "reviews" },
  { segment: "/wellbeing-indicators", moduleKey: "wellbeing_indicators" },
];

export function moduleKeyForPath(pathname: string): ModuleKey | null {
  const personRoute = pathname.match(/^\/care\/(manager|support)\/service-users\/[^/]+(\/.*)?$/);

  if (personRoute?.[2]) {
    const suffix = personRoute[2];
    const match = personSubRouteModules.find(
      ({ segment }) => suffix === segment || suffix.startsWith(`${segment}/`),
    );
    if (match) return match.moduleKey;
  }

  const match = routeModules.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match?.moduleKey ?? null;
}
