import { Prisma } from '@prisma/client'
import prisma from './prisma'

// READ
export const getAllUsers = async ({
  filters,
}: {
  filters?: Prisma.UserWhereInput,
}) => {
  const users = await prisma.user.findMany({
    where: filters
  })

  return users.map(user => {
    const { password: _, ...restUser } = user;
    return restUser
  })
}

export const getUsersStats = async ({
  filters,
}: {
  filters?: Prisma.UserWhereInput;
}) => {
  const trilhasStats = await prisma.trilhaSubscription.groupBy({
    by: ['userId'],
    _count: {
      hasEmblema: true,
    }
  });
  const jornadasStats = await prisma.jornadaSubscription.groupBy({
    by: ["userId"],
    _count: {
      _all: true,
    },
  });

  return {
    trilhasStats,
    jornadasStats,
  };
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id }
  })
  return user
}

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

// CREATE
export const createUser = async (userData: Prisma.UserCreateInput) => {
  const user = await prisma.user.create({
    data: userData,
  });
  return user;
};

// UPDATE
export const updateUser = async (id: string, updateData: any) => {
  const user = await prisma.user.update({
    where: {
      id
    },
    data: {
      ...updateData
    }
  })
  return user
}

// DELETE
export const deleteUser = async (id: string) => {
  const user = await prisma.user.delete({
    where: {
      id
    }
  })
  return user
}