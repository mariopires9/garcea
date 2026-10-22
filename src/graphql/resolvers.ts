import { prisma } from "@/lib/prisma";
import { deletePhoto } from "@/lib/supabase-storage";
import { requireUserId, type GraphQLContext } from "./context";
import { accountMutations, accountQueries, userFieldResolvers } from "./accounts";

type EventInput = {
  title: string;
  description: string;
  date: string;
  location: string;
  posterUrl?: string | null;
  type: "FOLCLORE" | "OUTROS";
};

type GalleryItemInput = {
  type: "PHOTO" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  eventId?: string | null;
};

type GalleryItemUpdateInput = {
  url?: string | null;
  thumbnailUrl?: string | null;
  eventId?: string | null;
};

type OfficialContactInput = {
  type: "EMAIL" | "PHONE" | "FACEBOOK";
  label?: string | null;
  value: string;
};

type SocialLinkInput = {
  platform: "FACEBOOK" | "INSTAGRAM" | "YOUTUBE" | "TWITTER" | "WHATSAPP" | "SPOTIFY" | "OTHER";
  url: string;
};

type HomeSectionInput = {
  title: string;
  description: string;
};

const HISTORIAL_SECTION_ID = "historial";

function toISOString(value: Date): string {
  return value.toISOString();
}

type GalleryItemsFilter = { eventId?: string | null; year?: number | null };

function galleryItemsWhere(args: GalleryItemsFilter) {
  return {
    ...(args.eventId ? { eventId: args.eventId } : {}),
    ...(args.year
      ? {
          event: {
            date: {
              gte: new Date(`${args.year}-01-01T00:00:00.000Z`),
              lt: new Date(`${args.year + 1}-01-01T00:00:00.000Z`),
            },
          },
        }
      : {}),
  };
}

export const resolvers = {
  Query: {
    events: () => prisma.event.findMany({ orderBy: { date: "desc" } }),
    event: (_: unknown, args: { id: string }) =>
      prisma.event.findUnique({ where: { id: args.id } }),
    galleryItems: (
      _: unknown,
      args: GalleryItemsFilter & { limit?: number | null },
    ) =>
      prisma.galleryItem.findMany({
        where: galleryItemsWhere(args),
        orderBy: { createdAt: "desc" },
        ...(args.limit ? { take: Math.max(1, args.limit) } : {}),
      }),
    galleryItemsCount: (_: unknown, args: GalleryItemsFilter) =>
      prisma.galleryItem.count({ where: galleryItemsWhere(args) }),
    galleryItem: (_: unknown, args: { id: string }) =>
      prisma.galleryItem.findUnique({ where: { id: args.id } }),
    homeSections: () => prisma.homeSection.findMany({ orderBy: { order: "asc" } }),
    homeSection: (_: unknown, args: { id: string }) =>
      prisma.homeSection.findUnique({ where: { id: args.id } }),
    historialSection: () =>
      prisma.historialSection.findUnique({ where: { id: HISTORIAL_SECTION_ID } }),
    officialContacts: () =>
      prisma.officialContact.findMany({ orderBy: { createdAt: "asc" } }),
    socialLinks: () => prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    ...accountQueries,
  },

  Mutation: {
    ...accountMutations,
    createEvent: (
      _: unknown,
      args: { input: EventInput },
      context: GraphQLContext,
    ) => {
      const userId = requireUserId(context);
      return prisma.event.create({
        data: {
          ...args.input,
          date: new Date(args.input.date),
          createdById: userId,
        },
      });
    },
    updateEvent: async (
      _: unknown,
      args: { id: string; input: EventInput },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const previous = await prisma.event.findUnique({ where: { id: args.id } });
      const updated = await prisma.event.update({
        where: { id: args.id },
        data: { ...args.input, date: new Date(args.input.date) },
      });
      // "posterUrl" in args.input distinguishes "left unchanged" (key omitted)
      // from "cleared" (explicit null) or "replaced" (a new URL).
      if (
        previous?.posterUrl &&
        "posterUrl" in args.input &&
        args.input.posterUrl !== previous.posterUrl
      ) {
        await deletePhoto(previous.posterUrl).catch((error) => {
          console.error("Failed to delete old event poster from storage:", error);
        });
      }
      return updated;
    },
    deleteEvent: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const event = await prisma.event.delete({ where: { id: args.id } });
      if (event.posterUrl) {
        await deletePhoto(event.posterUrl).catch((error) => {
          console.error("Failed to delete event poster from storage:", error);
        });
      }
      return true;
    },

    createGalleryItem: (
      _: unknown,
      args: { input: GalleryItemInput },
      context: GraphQLContext,
    ) => {
      const userId = requireUserId(context);
      return prisma.galleryItem.create({
        data: { ...args.input, uploadedById: userId },
      });
    },
    updateGalleryItem: async (
      _: unknown,
      args: { id: string; input: GalleryItemUpdateInput },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const { url, thumbnailUrl, eventId } = args.input;
      const previous = await prisma.galleryItem.findUniqueOrThrow({ where: { id: args.id } });
      const updated = await prisma.galleryItem.update({
        where: { id: args.id },
        data: {
          ...(url ? { url } : {}),
          ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
          // `eventId: null` means "no event"; leaving it out keeps the current one.
          ...(eventId !== undefined ? { eventId } : {}),
        },
      });
      // A replaced photo leaves its old file behind in Storage - remove it,
      // like updateEvent does for posters.
      if (previous.type === "PHOTO" && url && url !== previous.url) {
        await deletePhoto(previous.url).catch((error) => {
          console.error("Failed to delete replaced photo from storage:", error);
        });
      }
      return updated;
    },
    deleteGalleryItem: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const item = await prisma.galleryItem.delete({ where: { id: args.id } });
      if (item.type === "PHOTO") {
        await deletePhoto(item.url).catch((error) => {
          console.error("Failed to delete photo from storage:", error);
        });
      }
      return true;
    },

    deleteGalleryItems: async (
      _: unknown,
      args: { ids: string[] },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      // One transaction for the rows (all or nothing); Storage cleanup after,
      // logged rather than failing the request, like deleteGalleryItem.
      const items = await prisma.$transaction(async (tx) => {
        const found = await tx.galleryItem.findMany({ where: { id: { in: args.ids } } });
        await tx.galleryItem.deleteMany({ where: { id: { in: found.map((item) => item.id) } } });
        return found;
      });
      for (const item of items) {
        if (item.type === "PHOTO") {
          await deletePhoto(item.url).catch((error) => {
            console.error("Failed to delete photo from storage:", error);
          });
        }
      }
      return items.length;
    },

    createHomeSection: async (
      _: unknown,
      args: { input: HomeSectionInput },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const highest = await prisma.homeSection.aggregate({ _max: { order: true } });
      return prisma.homeSection.create({
        data: { ...args.input, order: (highest._max.order ?? -1) + 1 },
      });
    },
    updateHomeSection: (
      _: unknown,
      args: { id: string; input: HomeSectionInput },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      return prisma.homeSection.update({ where: { id: args.id }, data: args.input });
    },
    deleteHomeSection: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      await prisma.homeSection.delete({ where: { id: args.id } });
      return true;
    },
    moveHomeSection: async (
      _: unknown,
      args: { id: string; direction: "UP" | "DOWN" },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const sections = await prisma.homeSection.findMany({ orderBy: { order: "asc" } });
      const index = sections.findIndex((section) => section.id === args.id);
      const swapIndex = args.direction === "UP" ? index - 1 : index + 1;
      if (index === -1 || swapIndex < 0 || swapIndex >= sections.length) {
        return false;
      }
      const current = sections[index];
      const swap = sections[swapIndex];
      await prisma.$transaction([
        prisma.homeSection.update({ where: { id: current.id }, data: { order: swap.order } }),
        prisma.homeSection.update({ where: { id: swap.id }, data: { order: current.order } }),
      ]);
      return true;
    },
    featureHomeSectionPhoto: (
      _: unknown,
      args: { homeSectionId: string; galleryItemId: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      return prisma.homeSectionFeaturedPhoto
        .create({
          data: { homeSectionId: args.homeSectionId, galleryItemId: args.galleryItemId },
          include: { galleryItem: true },
        })
        .then((f) => f.galleryItem);
    },
    unfeatureHomeSectionPhoto: async (
      _: unknown,
      args: { homeSectionId: string; galleryItemId: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      await prisma.homeSectionFeaturedPhoto.delete({
        where: {
          homeSectionId_galleryItemId: {
            homeSectionId: args.homeSectionId,
            galleryItemId: args.galleryItemId,
          },
        },
      });
      return true;
    },

    updateHistorialSection: (
      _: unknown,
      args: { description: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      return prisma.historialSection.upsert({
        where: { id: HISTORIAL_SECTION_ID },
        update: { description: args.description },
        create: { id: HISTORIAL_SECTION_ID, description: args.description },
      });
    },

    createOfficialContact: (
      _: unknown,
      args: { input: OfficialContactInput },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      return prisma.officialContact.create({ data: args.input });
    },
    deleteOfficialContact: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      await prisma.officialContact.delete({ where: { id: args.id } });
      return true;
    },

    createSocialLink: async (
      _: unknown,
      args: { input: SocialLinkInput },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const highest = await prisma.socialLink.aggregate({ _max: { order: true } });
      return prisma.socialLink.create({
        data: { ...args.input, order: (highest._max.order ?? -1) + 1 },
      });
    },
    deleteSocialLink: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      await prisma.socialLink.delete({ where: { id: args.id } });
      return true;
    },
    moveSocialLink: async (
      _: unknown,
      args: { id: string; direction: "UP" | "DOWN" },
      context: GraphQLContext,
    ) => {
      requireUserId(context);
      const links = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
      const index = links.findIndex((link) => link.id === args.id);
      const swapIndex = args.direction === "UP" ? index - 1 : index + 1;
      if (index === -1 || swapIndex < 0 || swapIndex >= links.length) {
        return false;
      }
      const current = links[index];
      const swap = links[swapIndex];
      await prisma.$transaction([
        prisma.socialLink.update({ where: { id: current.id }, data: { order: swap.order } }),
        prisma.socialLink.update({ where: { id: swap.id }, data: { order: current.order } }),
      ]);
      return true;
    },
  },

  Event: {
    date: (parent: { date: Date }) => toISOString(parent.date),
    createdAt: (parent: { createdAt: Date }) => toISOString(parent.createdAt),
    createdBy: (parent: { createdById: string }) =>
      prisma.user.findUniqueOrThrow({ where: { id: parent.createdById } }),
    galleryItems: (parent: { id: string }) =>
      prisma.galleryItem.findMany({
        where: { eventId: parent.id },
        orderBy: { createdAt: "desc" },
      }),
  },

  GalleryItem: {
    createdAt: (parent: { createdAt: Date }) => toISOString(parent.createdAt),
    event: (parent: { eventId: string | null }) =>
      parent.eventId ? prisma.event.findUnique({ where: { id: parent.eventId } }) : null,
    uploadedBy: (parent: { uploadedById: string }) =>
      prisma.user.findUniqueOrThrow({ where: { id: parent.uploadedById } }),
  },

  HomeSection: {
    createdAt: (parent: { createdAt: Date }) => toISOString(parent.createdAt),
    updatedAt: (parent: { updatedAt: Date }) => toISOString(parent.updatedAt),
    featuredPhotos: async (parent: { id: string }) => {
      const featured = await prisma.homeSectionFeaturedPhoto.findMany({
        where: { homeSectionId: parent.id },
        orderBy: { createdAt: "asc" },
        include: { galleryItem: true },
      });
      return featured.map((f) => f.galleryItem);
    },
  },

  HistorialSection: {
    updatedAt: (parent: { updatedAt: Date }) => toISOString(parent.updatedAt),
  },

  OfficialContact: {
    createdAt: (parent: { createdAt: Date }) => toISOString(parent.createdAt),
  },

  SocialLink: {
    createdAt: (parent: { createdAt: Date }) => toISOString(parent.createdAt),
  },

  User: userFieldResolvers,
};
