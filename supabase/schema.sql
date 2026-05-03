-- Musicholic Database Schema
-- Run this in your Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Artists table
create table if not exists artists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image text,
  bio text,
  created_at timestamptz default now()
);

-- Albums table
create table if not exists albums (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  cover text,
  artist_id uuid not null references artists(id) on delete cascade,
  created_at timestamptz default now()
);

-- Songs table
create table if not exists songs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  cover text,
  youtube_embed_url text,
  artist_ids uuid[] default '{}',
  album_id uuid references albums(id) on delete set null,
  lyrics text,
  created_at timestamptz default now()
);

-- Links table (streaming platform links for songs)
create table if not exists links (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid not null references songs(id) on delete cascade,
  platform text not null check (platform in ('spotify', 'youtube_music', 'apple_music', 'jiosaavn', 'gaana', 'amazon_music')),
  url text not null,
  created_at timestamptz default now()
);

-- Artist links table (streaming platform links for artists)
create table if not exists artist_links (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid not null references artists(id) on delete cascade,
  platform text not null check (platform in ('spotify', 'youtube_music', 'apple_music', 'jiosaavn', 'gaana', 'amazon_music', 'youtube')),
  url text not null,
  created_at timestamptz default now()
);

-- Playlists table
create table if not exists playlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  cover text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Playlist songs (junction table)
create table if not exists playlist_songs (
  id uuid primary key default uuid_generate_v4(),
  playlist_id uuid not null references playlists(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  position int not null default 0,
  added_at timestamptz default now(),
  unique(playlist_id, song_id)
);

-- Indexes for performance
create index if not exists idx_songs_artist_ids on songs using gin(artist_ids);
create index if not exists idx_songs_album_id on songs(album_id);
create index if not exists idx_links_song_id on links(song_id);
create index if not exists idx_albums_artist_id on albums(artist_id);
create index if not exists idx_playlists_user_id on playlists(user_id);
create index if not exists idx_playlist_songs_playlist_id on playlist_songs(playlist_id);
create index if not exists idx_songs_created_at on songs(created_at desc);
create index if not exists idx_artists_name on artists(name);
create index if not exists idx_albums_title on albums(title);
create index if not exists idx_song_artists_song_id on song_artists(song_id);
create index if not exists idx_song_artists_artist_id on song_artists(artist_id);

-- Row Level Security (RLS) policies

-- Artists: public read, admin write (adjust as needed)
alter table artists enable row level security;
create policy "Anyone can view artists" on artists for select using (true);
create policy "Authenticated users can manage artists" on artists for all using (auth.role() = 'authenticated');

-- Albums: public read, admin write
alter table albums enable row level security;
create policy "Anyone can view albums" on albums for select using (true);
create policy "Authenticated users can manage albums" on albums for all using (auth.role() = 'authenticated');

-- Songs: public read, admin write
alter table songs enable row level security;
create policy "Anyone can view songs" on songs for select using (true);
create policy "Authenticated users can manage songs" on songs for all using (auth.role() = 'authenticated');

-- Links: public read, admin write
alter table links enable row level security;
create policy "Anyone can view links" on links for select using (true);
create policy "Authenticated users can manage links" on links for all using (auth.role() = 'authenticated');

-- Playlists: users can only see/manage their own
alter table playlists enable row level security;
create policy "Users can view own playlists" on playlists for select using (auth.uid() = user_id);
create policy "Users can create playlists" on playlists for insert with check (auth.uid() = user_id);
create policy "Users can update own playlists" on playlists for update using (auth.uid() = user_id);
create policy "Users can delete own playlists" on playlists for delete using (auth.uid() = user_id);

-- Playlist songs: users can only manage their own playlist songs
alter table playlist_songs enable row level security;
create policy "Users can view own playlist songs" on playlist_songs for select using (
  exists (select 1 from playlists where playlists.id = playlist_songs.playlist_id and playlists.user_id = auth.uid())
);
create policy "Users can manage own playlist songs" on playlist_songs for all using (
  exists (select 1 from playlists where playlists.id = playlist_songs.playlist_id and playlists.user_id = auth.uid())
);

-- Artist links RLS
alter table artist_links enable row level security;
create policy "Anyone can view artist links" on artist_links for select using (true);
create policy "Authenticated users can manage artist links" on artist_links for all using (auth.role() = 'authenticated');

-- Song artists junction table (for multiple artists with roles)
create table if not exists song_artists (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid not null references songs(id) on delete cascade,
  artist_id uuid not null references artists(id) on delete cascade,
  role text not null default 'featured',
  position int not null default 0,
  created_at timestamptz default now(),
  unique(song_id, artist_id)
);

-- Song artists RLS
alter table song_artists enable row level security;
create policy "Anyone can view song artists" on song_artists for select using (true);
create policy "Authenticated users can manage song artists" on song_artists for all using (auth.role() = 'authenticated');

-- Index for performance
create index if not exists idx_song_artists_song_id on song_artists(song_id);
create index if not exists idx_song_artists_artist_id on song_artists(artist_id);

-- Storage bucket for artist images
insert into storage.buckets (id, name, public) values ('artist-images', 'artist-images', true)
on conflict (id) do nothing;

create policy "Anyone can view artist images" on storage.objects for select using (bucket_id = 'artist-images');
create policy "Authenticated users can upload artist images" on storage.objects for insert with check (bucket_id = 'artist-images' and auth.role() = 'authenticated');
create policy "Authenticated users can update artist images" on storage.objects for update using (bucket_id = 'artist-images' and auth.role() = 'authenticated');
create policy "Authenticated users can delete artist images" on storage.objects for delete using (bucket_id = 'artist-images' and auth.role() = 'authenticated');

-- Function to update playlist updated_at timestamp
create or replace function update_playlist_updated_at()
returns trigger as $$
begin
  update playlists set updated_at = now() where id = new.playlist_id;
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_playlist_updated_at
after insert or update or delete on playlist_songs
for each row execute function update_playlist_updated_at();
