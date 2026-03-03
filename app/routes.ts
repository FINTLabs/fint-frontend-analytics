import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/events", "routes/api.events.ts"),
    route("views", "routes/page.views.tsx"),
] satisfies RouteConfig;
