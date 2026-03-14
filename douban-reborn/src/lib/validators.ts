import { z } from "zod";

export const createReviewSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, "昵称至少 2 个字符")
    .max(24, "昵称最多 24 个字符"),
  rating: z
    .number()
    .int("评分必须是整数")
    .min(1, "评分最低为 1")
    .max(10, "评分最高为 10"),
  content: z
    .string()
    .trim()
    .min(10, "评论至少 10 个字符")
    .max(280, "评论最多 280 个字符"),
});
