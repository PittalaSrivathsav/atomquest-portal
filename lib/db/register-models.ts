/**
 * Import models once so Mongoose registers schemas before queries.
 * All models must be listed here so their schemas are registered at
 * connectDB() time — omitting any model causes silent save failures.
 */
import "@/models/goal.model";
import "@/models/user.model";
import "@/models/notification.model";
import "@/models/audit-log.model";
import "@/models/check-in.model";
