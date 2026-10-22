import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { PageContainer } from "@/components/PageContainer";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HomeHero } from "@/components/HomeHero";
import { executeGraphQL } from "@/lib/graphql-server";
import { HOME_SECTIONS_QUERY } from "@/lib/queries/homeSections";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

type HomeSectionsData = {
  homeSections: {
    id: string;
    title: string;
    description: string;
    featuredPhotos: {
      id: string;
      type: "PHOTO" | "VIDEO";
      url: string;
      thumbnailUrl: string | null;
    }[];
  }[];
};

export const metadata: Metadata = pageMetadata({ path: "/" });

export default async function Home() {
  const { homeSections } = await executeGraphQL<HomeSectionsData>(HOME_SECTIONS_QUERY);

  return (
    <>
      <HomeHero />

      <PageContainer maxWidth="md">
        {homeSections.map((section) => (
          <ScrollReveal key={section.id}>
            <Paper
              component="section"
              variant="outlined"
              sx={{ p: { xs: 3, sm: 5 }, display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Typography variant="h4" component="h2">
                {section.title}
              </Typography>

              <Typography sx={{ whiteSpace: "pre-wrap" }}>{section.description}</Typography>

              {section.featuredPhotos.length > 0 && (
                <GalleryCarousel
                  items={section.featuredPhotos.map((photo) => ({
                    id: photo.id,
                    type: photo.type,
                    url: photo.url,
                    thumbnailUrl: photo.thumbnailUrl,
                  }))}
                />
              )}
            </Paper>
          </ScrollReveal>
        ))}
      </PageContainer>
    </>
  );
}
