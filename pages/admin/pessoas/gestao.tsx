import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons"
import { Avatar, Box, Button, Center, Flex, FormControl, FormLabel, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Select, Stack, Text } from "@chakra-ui/react"
import { User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useReducer, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { withAuthSsr } from "../../../lib/withAuth"
import cmsClient from "../../../services/cmsClient"
import { IVagaFindOne, IVagasAll } from "../../../types/CMS/Vaga"
import { themeCustomColors } from "../../../contexts/themes/theme";

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const [responseVaga] = await Promise.all([
    cmsClient.get<IVagasAll>(`vagas`, {
      params: {}
    })
  ])
  return {
    props: {
      vagas: responseVaga.data,
      role: context.req.session.role
    }
  }
}, 'admin')

type Props = {
  vagas: IVagasAll
}

export default function AdminPage({
  vagas,
}: Props) {
  const router = useRouter();
  const searchFormMethods = useForm({
    defaultValues: {
      vaga: '',
    }
  });

  const handleSubmit = useCallback(
    async (values: any) => {
      const response = await axios.get('/api/admin/pessoas/gestao', {
        params: values,
      })
      // setData(response.data)
    },
    [],
  )

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
      <IconButton onClick={router.back} icon={<ChevronLeftIcon />} aria-label="Voltar" />
      <Flex direction="column">
        <Heading fontSize="3xl" fontWeight={"bold"}>
          Gestão de pessoas
        </Heading>
      </Flex>
    </Flex>
    <FormProvider {...searchFormMethods}>
      <Flex as="form"
        onSubmit={searchFormMethods.handleSubmit(handleSubmit)}
        p={8}
        bg="whiteAlpha.300"
        boxShadow="md"
        alignItems="flex-start"
        >
        <Flex
          w="xs"
          gap={2}
          alignItems='end'
        >
          <FormControl>
            <FormLabel>Selecionar vaga</FormLabel>
            <Select {...searchFormMethods.register('vaga')}>
              {vagas.data.map(vaga => {
                return <option style={{
                  color: themeCustomColors.gray.brand
                }} key={vaga.id.toString().concat('-vaga')} value={vaga.id}>{vaga.attributes.name}</option>
              })}
            </Select>
          </FormControl>
          <IconButton aria-label="Pesquisar" type="submit" icon={<SearchIcon />} bg="yellow.brand" color="gray.brand" />
        </Flex>
      </Flex>
    </FormProvider>
    <Flex
      p={8}
    >

    </Flex>
  </>
}