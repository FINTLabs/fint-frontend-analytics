export function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

export function addDays(d: Date, days: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}

export function addMonths(d: Date, months: number) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + months);
    return x;
}

export function parseRange(url: URL) {
    const range = url.searchParams.get("range") ?? "6m";
    const now = new Date();

    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    if (fromParam && toParam) {
        const from = new Date(fromParam + "T00:00:00.000Z");
        const toInclusive = new Date(toParam + "T00:00:00.000Z");
        return {
            from,
            to: addDays(toInclusive, 1), // exclusive
            label: `${fromParam} → ${toParam}`,
        };
    }

    if (range === "today") {
        const from = startOfDay(now);
        return { from, to: addDays(from, 1), label: "Today" };
    }

    if (range === "30d") {
        return { from: addDays(now, -30), to: now, label: "Last 30 days" };
    }

    // default
    return { from: addMonths(now, -6), to: now, label: "Last 6 months" };
}