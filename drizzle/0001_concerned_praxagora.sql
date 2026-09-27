CREATE TABLE `civilians` (
	`case_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`source` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `officers`(`id`) ON UPDATE no action ON DELETE no action
);
