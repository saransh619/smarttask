import type { Request } from "express";

const defaultPage = 1;
const defaultLimit = 10;
const maxLimit = 50;

export function getPagination(req: Request) {
  const page = Math.max(Number(req.query.page) || defaultPage, 1);
  const requestedLimit = Math.max(Number(req.query.limit) || defaultLimit, 1);
  const limit = Math.min(requestedLimit, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function createPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
