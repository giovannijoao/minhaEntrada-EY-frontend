import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons"
import { Avatar, Box, Center, Flex, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Text } from "@chakra-ui/react"
import { User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useReducer, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { mediaUrl } from "../../../config"
import { withAuthSsr } from "../../../lib/withAuth"
import cmsClient from "../../../services/cmsClient"
import { IJornadasAll } from "../../../types/CMS/Jornada"

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const [responseJornadas] = await Promise.all([
    cmsClient.get<IJornadasAll>('jornadas', {
      params: {
        populate: 'image'
      }
    })
  ])
  return {
    props: {
      jornadas: responseJornadas.data,
      role: context.req.session.role
    }
  }
}, 'admin')

type IProps = {
  jornadas: IJornadasAll,
}

export default function AdminPage({
  jornadas
}: IProps) {
  const router = useRouter();

  return <>
    <Flex
      h={36}
      p={8}
      alignItems="center"
      backgroundColor="yellow.brand"
      direction="row"
      gap={6}
      color={"gray.brand"}
    >
      <Heading fontSize="3xl" fontWeight={"bold"}>
        Jornadas
      </Heading>
    </Flex>
    {jornadas.data.length > 0 && <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <Flex
        gap={4}
        wrap={"wrap"}
        direction={{
          base: 'column',
          md: 'row'
        }}
      >
        {
          jornadas.data.map(jornada => {
            return <Link
              style={{ textDecoration: 'none' }}
              variant={'card-hover'} 
              w="2xs"
              key={jornada.id.toString().concat('-jornada')}
              borderRadius="md"
              bgColor="whiteAlpha.300"
              boxShadow={"md"}
              color="white"
              p={4} 
              href={`/admin/jornadas/${jornada.id}`}>
                {jornada.attributes.image?.data?.attributes.formats.small.url  && <Image
                  w={"100%"}
                  h={36}
                  src={mediaUrl?.concat(jornada.attributes.image.data.attributes.formats.small.url)}
                  fit={"cover"}
                  borderRadius="md"
                  aria-label={jornada.attributes.image?.data?.attributes.caption} />}
              <Flex direction={"column"} gap={2}>
                <Heading mt={2} fontSize="xl">{jornada.attributes.name}</Heading>
              </Flex>
            </Link>
          })
        }
      </Flex>
    </Flex>}
  </>
}