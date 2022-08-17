import { Prisma } from '@prisma/client'
import prisma from './prisma'

// READ
export const getAllUsers = async ({
  filters,
}: {
  filters?: Prisma.UserWhereInput
}) => {
  const users = await prisma.user.findMany({
    where: filters
  })

  return users.map(user => {
    const { password: _, ...restUser } = user;
    return restUser
  })
}

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
export const createUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
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