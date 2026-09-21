const { z } = require("zod");

const createBadgeSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  iconUrl: z.string().optional(),
});

module.exports = {
  createBadgeSchema,
};