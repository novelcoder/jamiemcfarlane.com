# Blog publishing

Blog visibility is controlled by two fields on the Appwrite `posts` row:

- `status` must be `published`.
- `published_at` must be less than or equal to the current server time.

Use `draft` while an entry is still being prepared. To schedule an approved entry,
set `status` to `published` and set `published_at` to a future absolute ISO 8601
timestamp. The unchanged row becomes visible automatically on the first request at
or after that instant. No cron job, Appwrite Function, or later status change is
required.

Enter the intended timezone explicitly. For example, 9:00 a.m. Chicago time on
October 10, 2026 can be stored as either `2026-10-10T09:00:00-05:00` or the
equivalent UTC value, `2026-10-10T14:00:00Z`. Appwrite may normalize the stored
value to UTC without changing the publication instant.

The website reads posts without a persistent data cache, so the homepage, news
archive, article route, and sitemap use the current visibility rule on each request.
The RSS response retains its existing five-minute public cache plus a one-hour
stale-while-revalidate window. Feed readers should not be expected to show a
scheduled post immediately; a stale response can be served while the feed refreshes.

The displayed article date is formatted using the UTC calendar date to preserve
the dates of migrated historical posts. When scheduling near midnight, confirm the
UTC calendar date is also the intended reader-facing date.
