export const ParserTestData = {
  MasterManifest: {
    Basic: `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"
video_720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2560000,RESOLUTION=1920x1080,CODECS="avc1.4d401f,mp4a.40.2"
video_1080p.m3u8`,
    SingleVariant: `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"
video_720p.m3u8`,
  },
  MediaManifest: {
    VodTs: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:9.009,
segment1.ts
#EXTINF:8.008,
segment2.ts
#EXT-X-ENDLIST`,
    VodFmp4: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-TARGETDURATION:10
#EXT-X-MAP:URI="init.mp4"
#EXTINF:9.009,
segment1.m4s
#EXT-X-ENDLIST`,
    Live: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:123
#EXTINF:5.005,
segment123.ts
#EXTINF:6.006,
segment124.ts`,
  },
} as const;
