import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import { prisma } from "@/lib/prisma";
import { BCRYPT_COST, MIN_PASSWORD_LENGTH } from "@/lib/config";
import { requireUserId, type GraphQLContext } from "./context";

// Permission model (all enforced here, server-side):
// - every admin can see the account list and edit their own name/email and
//   password (own password change requires the current password);
// - only the owner can add/remove accounts and edit other accounts;
// - the owner account can't be removed.


type UserInput = { name: string; email: string };
type CreateUserInput = UserInput & { password: string };

function forbidden(message: string) {
  return new GraphQLError(message, { extensions: { code: "FORBIDDEN" } });
}

function badInput(message: string) {
  return new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

/** The logged-in account, re-read from the DB so a removed account is rejected. */
async function requireCurrentUser(context: GraphQLContext) {
  const userId = requireUserId(context);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new GraphQLError("A sua conta já não existe.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return user;
}

async function requireOwner(context: GraphQLContext) {
  const user = await requireCurrentUser(context);
  if (!user.isOwner) throw forbidden("Só o proprietário pode fazer esta alteração.");
  return user;
}

async function findUserOrThrow(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw badInput("Conta não encontrada.");
  return user;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function validateUserInput(input: UserInput, excludeId?: string) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (!name) throw badInput("O nome é obrigatório.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw badInput("Email inválido.");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== excludeId) {
    throw badInput("Já existe uma conta com este email.");
  }
  return { name, email };
}

function hashPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw badInput(`A palavra-passe deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }
  return bcrypt.hash(password, BCRYPT_COST);
}

export const accountQueries = {
  users: async (_: unknown, __: unknown, context: GraphQLContext) => {
    await requireCurrentUser(context);
    return prisma.user.findMany({ orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }] });
  },
  user: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
    await requireCurrentUser(context);
    return prisma.user.findUnique({ where: { id: args.id } });
  },
  me: (_: unknown, __: unknown, context: GraphQLContext) => requireCurrentUser(context),
};

export const accountMutations = {
  createUser: async (
    _: unknown,
    args: { input: CreateUserInput },
    context: GraphQLContext,
  ) => {
    await requireOwner(context);
    const { name, email } = await validateUserInput(args.input);
    const passwordHash = await hashPassword(args.input.password);
    return prisma.user.create({ data: { name, email, passwordHash } });
  },

  updateUser: async (
    _: unknown,
    args: { id: string; input: UserInput },
    context: GraphQLContext,
  ) => {
    const me = await requireCurrentUser(context);
    if (args.id !== me.id && !me.isOwner) {
      throw forbidden("Só pode alterar os dados da sua própria conta.");
    }
    await findUserOrThrow(args.id);
    const data = await validateUserInput(args.input, args.id);
    return prisma.user.update({ where: { id: args.id }, data });
  },

  changePassword: async (
    _: unknown,
    args: { id: string; currentPassword?: string | null; newPassword: string },
    context: GraphQLContext,
  ) => {
    const me = await requireCurrentUser(context);
    const target = await findUserOrThrow(args.id);
    if (target.id === me.id) {
      // Own password: prove it's really you, even with an open session.
      const isValid =
        !!args.currentPassword && (await bcrypt.compare(args.currentPassword, me.passwordHash));
      if (!isValid) throw badInput("A palavra-passe atual está incorreta.");
    } else if (!me.isOwner) {
      throw forbidden("Só o proprietário pode alterar a palavra-passe de outras contas.");
    }
    const passwordHash = await hashPassword(args.newPassword);
    await prisma.user.update({ where: { id: target.id }, data: { passwordHash } });
    return true;
  },

  deleteUser: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
    const owner = await requireOwner(context);
    const target = await findUserOrThrow(args.id);
    if (target.isOwner) throw forbidden("A conta do proprietário não pode ser eliminada.");
    // Events/gallery items require an author, so hand them to the owner
    // instead of deleting the content along with the account.
    await prisma.$transaction([
      prisma.event.updateMany({
        where: { createdById: target.id },
        data: { createdById: owner.id },
      }),
      prisma.galleryItem.updateMany({
        where: { uploadedById: target.id },
        data: { uploadedById: owner.id },
      }),
      prisma.user.delete({ where: { id: target.id } }),
    ]);
    return true;
  },
};

export const userFieldResolvers = {
  // `User` is reachable from public queries (e.g. event.createdBy), so the
  // email is only returned to logged-in admins.
  email: (parent: { email: string }, _: unknown, context: GraphQLContext) => {
    requireUserId(context);
    return parent.email;
  },
  createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
};
