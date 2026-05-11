-- Migration: Add show_in_discovery column to songs table
-- Run this in Supabase SQL Editor

alter table songs add column if not exists show_in_discovery boolean not null default false;

create index if not exists idx_songs_show_in_discovery
  on songs(show_in_discovery)
  where show_in_discovery = true;
