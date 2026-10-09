/** The backend's maximum page for members, bans and join requests (its default is 50); a full page may hide more rows. */
export const LIST_LIMIT = 200;

export const mayBeTruncated = (count: number): boolean => count >= LIST_LIMIT;
