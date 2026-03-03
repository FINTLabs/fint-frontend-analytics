// import {db, query} from "~/server/db.server";

export type PageViewsRow = {
    app: string;
    path: string;
    views: number;
};

export type HitsPerDayByAppRow = {
    day: string;
    app: string;
    hits: number;
};

export type AnalyticsEvent = {
    id: number;
    ts: string;
    app: string;
    type: string;
    path: string | null;
    element: string | null;
    tenant: string | null;
    meta?: Record<string, unknown>;
};

export type IncomingEvent = {
    ts?: string; // optional; default now
    app: string;
    type: "page_view" | "button_click" | "search";
    path?: string;
    element?: string;
    tenant?: string;
    meta?: Record<string, unknown>;
};

// export async function getPageViewsByAppAndPath(params: {
//     from: Date;
//     to: Date;     // exclusive end
//     app?: string; // optional filter
// }) {
//     const { from, to, app } = params;
//
//     if (app) {
//         return query<PageViewsRow>(
//             `
//       select
//         app,
//         coalesce(path, '/__unknown__') as path,
//         count(*)::int as views
//       from analytics_event
//       where type = 'page_view'
//         and app = $1
//         and ts >= $2::timestamptz
//         and ts <  $3::timestamptz
//       group by app, path
//       order by views desc
//       `,
//             [app, from.toISOString(), to.toISOString()]
//         );
//     }
//
//     return query<PageViewsRow>(
//         `
//     select
//       app,
//       coalesce(path, '/__unknown__') as path,
//       count(*)::int as views
//     from analytics_event
//     where type = 'page_view'
//       and ts >= $1::timestamptz
//       and ts <  $2::timestamptz
//     group by app, path
//     order by views desc
//     `,
//         [from.toISOString(), to.toISOString()]
//     );
// }

export interface EventsByType {
    type: string;
    events: number;
}

export interface TotalEventsPerAppWithTypesRow {
    app: string;
    total_events: number;
    by_type: EventsByType[]; // returned from jsonb
}

// export async function getTotalEventsPerAppWithTypes(params: {
//     from: Date;
//     to: Date; // exclusive
// }) {
//     const { from, to } = params;
//
//     return query<TotalEventsPerAppWithTypesRow>(
//         `
//     with per_type as (
//       select
//         app,
//         type,
//         count(*)::int as events
//       from analytics_event
//       where ts >= $1::timestamptz
//         and ts <  $2::timestamptz
//       group by 1, 2
//     ),
//     totals as (
//       select
//         app,
//         count(*)::int as total_events
//       from analytics_event
//       where ts >= $1::timestamptz
//         and ts <  $2::timestamptz
//       group by 1
//     )
//     select
//       t.app,
//       t.total_events,
//       coalesce(
//         jsonb_agg(
//           jsonb_build_object('type', p.type, 'events', p.events)
//           order by p.events desc, p.type asc
//         ) filter (where p.type is not null),
//         '[]'::jsonb
//       ) as by_type
//     from totals t
//     left join per_type p on p.app = t.app
//     group by t.app, t.total_events
//     order by t.total_events desc, t.app asc
//     `,
//         [from.toISOString(), to.toISOString()]
//     );
// }

// export interface TotalEventsPerAppRow {
//     app: string;
//     events: number;
// }
//
// export async function getTotalEventsPerApp(params: {
//     from: Date;
//     to: Date;     // exclusive end
//     app?: string; // optional filter
// }) {
//     const { from, to, app } = params;
//
//     return query<TotalEventsPerAppRow>(
//         `
//     select
//       app,
//       count(*)::int as events
//     from analytics_event
//     where ($1::text is null or app = $1::text)
//       and ts >= $2::timestamptz
//       and ts <  $3::timestamptz
//     group by 1
//     order by 2 desc, 1 asc
//     `,
//         [app ?? null, from.toISOString(), to.toISOString()]
//     );
// }

export interface TotalEventsPerTenantRow {
    tenant: string;
    events: number;
}

// export async function getTotalEventsPerTenant(params: {
//     from: Date;
//     to: Date;        // exclusive end
//     tenant?: string; // optional filter
//
// }) {
//     const { from, to, tenant } = params;
//
//     return query<TotalEventsPerTenantRow>(
//         `
//     select
//       tenant,
//       count(*)::int as events
//     from analytics_event
//     where ($1::text is null or tenant = $1::text)
//       and ts >= $2::timestamptz
//       and ts <  $3::timestamptz
//     group by 1
//     order by 2 desc, 1 asc
//     `,
//         [tenant ?? null, from.toISOString(), to.toISOString()]
//     );
// }

// export async function getHitsPerDayByApp(params: {
//     from: Date;
//     to: Date;     // exclusive end
//     app?: string; // optional filter
// }) {
//     const { from, to, app } = params;
//
//     if (app) {
//         return query<HitsPerDayByAppRow>(
//             `
//       select
//         date_trunc('day', ts)::date::text as day,
//         app,
//         count(*)::int as hits
//       from analytics_event
//       where app = $1
//         and ts >= $2::timestamptz
//         and ts <  $3::timestamptz
//       group by 1, 2
//       order by 1 asc, 2 asc
//       `,
//             [app, from.toISOString(), to.toISOString()]
//         );
//     }
//
//     return query<HitsPerDayByAppRow>(
//         `
//     select
//       date_trunc('day', ts)::date::text as day,
//       app,
//       count(*)::int as hits
//     from analytics_event
//     where ts >= $1::timestamptz
//       and ts <  $2::timestamptz
//     group by 1, 2
//     order by 1 asc, 2 asc
//     `,
//         [from.toISOString(), to.toISOString()]
//     );
// }

// export type AppRow = { app: string };
//
// export async function listApps() {
//     return query<AppRow>(
//         `
//     select distinct app
//     from analytics_event
//     order by app asc
//     `
//     );
// }



//TODO: POC cache HERE
export async function getLatestEvents(limit = 50) {
    // return query<AnalyticsEvent>(
    //     `
    // select id, ts, app, type, path, element, tenant, meta
    // from analytics_event
    // order by ts desc
    // limit $1
    // `,
    //     [limit]
    // );

    return listOfEvents.slice(0, limit);
}
const listOfEvents: AnalyticsEvent[] = [];
let nextId = 1;
function toAnalyticsEvent(e: IncomingEvent): AnalyticsEvent {
    return {
        id: nextId++,
        ts: e.ts ?? new Date().toISOString(),
        app: e.app,
        type: e.type,
        path: e.path ?? null,
        element: e.element ?? null,
        tenant: e.tenant ?? null,
        meta: e.meta,
    };
}
export async function insertEvents(newEvents: IncomingEvent[]) {
    if (newEvents.length === 0) return;

    // ✅ push *events*, not the array
    listOfEvents.push(...newEvents.map(toAnalyticsEvent));
}
// export async function insertEvents(events: IncomingEvent[]) {
//     if (events.length === 0) return;
//
//     const values: unknown[] = [];
//
//     const rowsSql = events
//         .map((e, i) => {
//             const base = i * 7; // 👈 now 7 columns
//
//             values.push(
//                 e.ts ?? null,
//                 e.app,
//                 e.type,
//                 e.path ?? null,
//                 e.element ?? null,
//                 e.tenant ?? null,
//                 e.meta ? JSON.stringify(e.meta) : null
//             );
//
//             return `(
//         coalesce($${base + 1}::timestamptz, now()),
//         $${base + 2}::text,
//         $${base + 3}::text,
//         $${base + 4}::text,
//         $${base + 5}::text,
//         $${base + 6}::text,
//         $${base + 7}::jsonb
//       )`;
//         })
//         .join(",");
//
//     await db().query(
//         `insert into analytics_event (ts, app, type, path, element, tenant, meta)
//          values ${rowsSql}`,
//         values
//     );
// }