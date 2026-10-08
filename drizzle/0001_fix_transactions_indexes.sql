DROP INDEX `transactions_created_at_idx`;--> statement-breakpoint
DROP INDEX `transactions_analytics_idx`;--> statement-breakpoint
CREATE INDEX `transactions_analytics_idx` ON `transactions` (`created_at`,`status`,`amount_cents`,`user_id`);