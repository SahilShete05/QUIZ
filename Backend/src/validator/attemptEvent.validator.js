const { z } = require("zod");

const EVENT_TYPES = [
  "TAB_SWITCH",
  "COPY_ATTEMPT",
  "PASTE_ATTEMPT",
  "RIGHT_CLICK_ATTEMPT",
];

const createAttemptEventSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  metadata: z.record(z.any()).optional(),
});

module.exports = {
  createAttemptEventSchema,
  EVENT_TYPES,
};