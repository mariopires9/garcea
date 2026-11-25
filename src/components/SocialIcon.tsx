import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LanguageIcon from "@mui/icons-material/Language";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { SpotifyIcon } from "@/components/SpotifyIcon";
import { DeezerIcon } from "@/components/DeezerIcon";
import { TikTokIcon } from "@/components/TikTokIcon";
import { SoundCloudIcon } from "@/components/SoundCloudIcon";

const ICONS = {
  FACEBOOK: FacebookIcon,
  INSTAGRAM: InstagramIcon,
  YOUTUBE: YouTubeIcon,
  TWITTER: TwitterIcon,
  WHATSAPP: WhatsAppIcon,
  SPOTIFY: SpotifyIcon,
  DEEZER: DeezerIcon,
  TIKTOK: TikTokIcon,
  SOUNDCLOUD: SoundCloudIcon,
  OTHER: LanguageIcon,
} as const;

export const SOCIAL_PLATFORM_LABELS: Record<keyof typeof ICONS, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
  TWITTER: "X (Twitter)",
  WHATSAPP: "WhatsApp",
  SPOTIFY: "Spotify",
  DEEZER: "Deezer",
  TIKTOK: "TikTok",
  SOUNDCLOUD: "SoundCloud",
  OTHER: "Outro",
};

export function SocialIcon({
  platform,
  ...props
}: { platform: string } & SvgIconProps) {
  const Icon = ICONS[platform as keyof typeof ICONS] ?? LanguageIcon;
  return <Icon {...props} />;
}
