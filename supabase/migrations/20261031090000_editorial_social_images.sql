-- Each picture also keeps a 1200 × 630 JPEG for social networks, which do not all read WebP.
update storage.buckets
  set allowed_mime_types = array['image/webp','image/jpeg','video/mp4','video/webm']
  where id in ('editorial-drafts','editorial-public');
