-- Add album links support
-- Make song_id nullable and add album_id
alter table links add column if not exists album_id uuid references albums(id) on delete cascade;
alter table links alter column song_id drop not null;

-- Ensure at least one of song_id or album_id is set
alter table links add constraint links_target_check check (
  (song_id is not null and album_id is null) or
  (song_id is null and album_id is not null)
);

-- Index for album links
create index if not exists idx_links_album_id on links(album_id);
