export function buildFilterWhere(accountId, filterRule) {
    const baseWhere = { accountId };
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
//# sourceMappingURL=filterUtils.js.map