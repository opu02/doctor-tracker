export type Filter = Record<string, any>;

export function dateRangeCondition(field: string, from?: Date, to?: Date): Filter | undefined {
  if (!from && !to) return undefined;
  const range: Record<string, Date> = {};
  if (from) range.$gte = from;
  if (to) {
    const end = new Date(to);
    // A date-only value (midnight UTC) means "up to the end of that day"
    if (
      end.getUTCHours() === 0 &&
      end.getUTCMinutes() === 0 &&
      end.getUTCSeconds() === 0 &&
      end.getUTCMilliseconds() === 0
    ) {
      end.setUTCHours(23, 59, 59, 999);
    }
    range.$lte = end;
  }
  return { [field]: range };
}

export function combine(conditions: Array<Filter | undefined>): Filter {
  const list = conditions.filter((c): c is Filter => Boolean(c));
  return list.length ? { $and: list } : {};
}

export function pageMeta(total: number, page: number, limit: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
