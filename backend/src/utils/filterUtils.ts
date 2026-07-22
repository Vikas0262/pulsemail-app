export function buildFilterWhere(accountId: number, filterRule: Record<string, unknown> | null | undefined) {
  const baseWhere: Record<string, unknown> = { accountId };

  if (!filterRule || !filterRule.field || filterRule.value === undefined) {
    return baseWhere;
  }

  const { field, value } = filterRule;

  if (field === 'tags') {
    return { ...baseWhere, tags: { has: value } };
  }

  if (['city', 'name', 'email', 'phone'].includes(String(field))) {
    return { ...baseWhere, [String(field)]: value };
  }

  return {
    ...baseWhere,
    customFields: {
      path: [String(field)],
      equals: value,
    },
  };
}
