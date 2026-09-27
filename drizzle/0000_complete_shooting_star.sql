CREATE TABLE `captures` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`kind` text NOT NULL,
	`document_type` text NOT NULL,
	`source` text NOT NULL,
	`filename` text NOT NULL,
	`mime` text NOT NULL,
	`object_key` text NOT NULL,
	`size` integer NOT NULL,
	`superseded` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `captures_case_idx` ON `captures` (`case_id`);--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`traveller_name` text DEFAULT '' NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`stage` text DEFAULT 'documents' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `officers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cases_owner_updated_idx` ON `cases` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`officer_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`officer_id`) REFERENCES `officers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `decisions_case_idx` ON `decisions` (`case_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`officer_id` text NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`officer_id`) REFERENCES `officers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_case_created_idx` ON `events` (`case_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `fields` (
	`case_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`source` text DEFAULT 'officer_entered' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `officers` (
	`id` text PRIMARY KEY NOT NULL,
	`platform_id` text NOT NULL,
	`officer_code` text NOT NULL,
	`name` text NOT NULL,
	`checkpoint` text NOT NULL,
	`role` text DEFAULT 'officer' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `officers_platform_idx` ON `officers` (`platform_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `officers_code_idx` ON `officers` (`officer_code`);--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`results` text NOT NULL,
	`status` text NOT NULL,
	`input_revision` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `runs_case_created_idx` ON `runs` (`case_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`officer_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`officer_id`) REFERENCES `officers`(`id`) ON UPDATE no action ON DELETE no action
);
