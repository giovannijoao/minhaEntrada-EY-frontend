import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { format } from "date-fns";
import { useCallback, useState, useEffect } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { IConhecimentosAll } from "../types/CMS/Conhecimento";
import { CUIAutoComplete, Item as CUIAutoCompleteItem } from "chakra-ui-autocomplete";
import cmsClient from "../services/cmsClient";
import { withAuthSsr } from "../lib/withAuth";
import prisma from "../prisma/prisma";
import { GetServerSidePropsContext } from "next";
import { MdSave } from "react-icons/md";
import axios from "axios";
import { useRouter } from "next/router";


const tabs = [
  '1. Dados pessoais',
  '2. Dados escolares e profissionais',
  '3. Meus Conhecimentos',
  '4. Minha Conta'
]

type IEducation = {
  school: string,
  degree: string,
  grade: string,
  startDate: string,
  endDate: string | null,
}

type IUserProfileForm = {
  firstName: string;
  lastName: string;
  bornDate: string | null;
  email: string;
  phoneNumber: string | null;
  education: IEducation[];
  gender: string | null;
  certifications: {
    name: string;
    organization: string;
    expiresAt: string | null;
    issueDate: string;
    credentialId: string | null;
    credentialUrl: string | null;
  }[],
  knowledgeItems: {
    name: string;
  }[]
}

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const { req } = context;
  const [user, conhecimentos] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: req.session.user.id
      },
      include: {
        UserCertification: true,
        UserEducation: true,
        UserExperience: true
      }
    }),
    cmsClient.get<IConhecimentosAll>(`conhecimentos`),
  ])

  if (!user) return {
    redirect: {
      path: '/login',
      statusCode: 302
    }
  }

  const parsedUser: IUserProfileForm = {
    // 1. Dados pessoais
    firstName: user.firstName,
    lastName: user.lastName,
    bornDate: user.bornDate ? format(user.bornDate, `yyyy-MM-dd`) : "",
    email: user.email,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    // 2. Dados escolares e profissionais
    education: user.UserEducation.map(ed => {
      return {
        ...ed,
        endDate: ed.endDate ? format(ed.endDate, `yyyy-MM-dd`) : null,
        startDate: format(ed.startDate, `yyyy-MM-dd`)
      }
    }),
    certifications: user.UserCertification.map(cert => {
      return {
        ...cert,
        issueDate: format(cert.issueDate, `yyyy-MM-dd`),
        expiresAt: cert.expiresAt ? format(cert.expiresAt, `yyyy-MM-dd`) : null,
      }
    }),
    knowledgeItems: user.knowledgeItems.map(name => ({ name }))
  }
  return {
    props: {
      parsedUser,
      conhecimentos: conhecimentos.data,
    }, // will be passed to the page component as props
  }
});

export default function Perfil({
  parsedUser,
  conhecimentos,
}: {
  parsedUser: IUserProfileForm
  conhecimentos: IConhecimentosAll
}) {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0)
  const form = useForm<IUserProfileForm>({
    defaultValues: parsedUser
  });

  useEffect(() => {
    const tab = router.query.tab;
    if (tab) {
      setTabIndex(Number(tab))
    }
  }, [router])

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }


  return <>
    <Flex
      h={36}
      p={8}
      justifyContent="center"
      backgroundColor="yellow.brand"
      direction="column"
    >
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">Perfil</Heading>
    </Flex>
    <Tabs index={tabIndex} onChange={handleTabsChange}>
      <TabList>
        {tabs.map(item => {
          return <Tab key={item} sx={{
            _selected: {
              color: 'yellow.brand'
            }
          }}>{item}</Tab>
        })}
      </TabList>


      <FormProvider {...form}>
        <form>
          <TabPanels>
            <TabPanel>
              <DadosPessoais />
            </TabPanel>
            <TabPanel>
              <Flex direction={{
                base: 'column',
                md: 'row'
              }} gap={6}>
                <EducationForm />
                <CertificationForm />
              </Flex>
            </TabPanel>
            <TabPanel>
              <ConhecimentosForm conhecimentos={conhecimentos} />
            </TabPanel>
          </TabPanels>
        </form>
      </FormProvider>
    </Tabs>
    <VStack
      w="full"
      my={8}
    >

    </VStack>
  </>
}

const DadosPessoais = () => {
  const { register } = useFormContext<IUserProfileForm>();
  return <VStack
    p={8} boxShadow="md" bg="blackAlpha.500" direction="column" gap={4}
  >
    <HStack w="full">
      <FormControl isReadOnly={true}>
        <FormLabel>Primeiro Nome</FormLabel>
        <Input type='text' {...register('firstName') }/>
      </FormControl>
      <FormControl isReadOnly={true}>
        <FormLabel>??ltimo Nome</FormLabel>
        <Input type='text' {...register('lastName') }/>
      </FormControl>
    </HStack>
    <HStack w="full">
      <FormControl isReadOnly={true}>
        <FormLabel>Data Nascimento</FormLabel>
        <Input type='date' {...register('bornDate') }/>
      </FormControl>
      <FormControl isReadOnly={true}>
        <FormLabel>Data Nascimento</FormLabel>
        <Select isReadOnly={true} {...register('gender')}>
          <option value="male">Masculino</option>
          <option value="female">Feminino</option>
          <option value="not-informed">Prefiro n??o informar</option>
        </Select>
      </FormControl>
    </HStack>
    <HStack w="full">
      <FormControl isReadOnly={true}>
        <FormLabel>Email</FormLabel>
        <Input type='email' {...register('email') }/>
      </FormControl>
      <FormControl isReadOnly={true}>
        <FormLabel>Telefone Celular</FormLabel>
        <Input type='tel' {...register('phoneNumber') }/>
      </FormControl>
    </HStack>
  </VStack>
}

const EducationForm = () => {
  const { isOpen: isOpenAddEducationModal, onOpen: onOpenAddEducationModal, onClose: onCloseAddEducationModal } = useDisclosure()
  const form = useFormContext<{
    education: IEducation[]
  }>()
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control: form.control,
    name: "education", // unique name for your Field Array
  });

  const formAdd = useForm({
    defaultValues: {
      school: "",
      degree: "",
      grade: "",
      startDate: "",
      endDate: "",
    }
  })
  const errors = formAdd.formState.errors;

  const handleAdd = useCallback((values: IEducation) => {
    append(values)
    onCloseAddEducationModal()
    formAdd.reset()
  }, [append, formAdd, onCloseAddEducationModal])

  return <>
    <Flex direction="column" w="full" h="full" gap={4}>
      <Flex p={8} boxShadow="md" bg="blackAlpha.500" direction="column" gap={4}>
        <Flex justifyContent={"space-between"} w="full">
          <Heading fontSize="2xl">Forma????o Academica</Heading>
          {/* <Button size="sm" bg="yellow.brand" color="gray.brand" rightIcon={<AddIcon />} onClick={onOpenAddEducationModal}>
            Adicionar
          </Button> */}
        </Flex>
        <Divider />
        <Flex direction="column" gap={2}>
          {
            fields.map(ed => {
              const startDate = format(new Date(ed.startDate), 'MMM yyyy')
              const endDate = ed.endDate ? format(new Date(ed.endDate), 'MMM yyyy') : null
              return <Flex key={ed.id} direction="column">
                <Heading fontSize="lg">{ed.school}</Heading>
                <Text>{ed.degree}, {ed.grade}</Text>
                <Text fontWeight={"light"}>{startDate} - {endDate}</Text>
              </Flex>
            })
          }
        </Flex>
      </Flex>
    </Flex>
    <Modal isOpen={isOpenAddEducationModal} onClose={onCloseAddEducationModal}>
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader>Adicionar Forma????o Academica</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formAdd.handleSubmit(handleAdd)}>
          <ModalBody display="flex" flexDirection={"column"} gap={2}>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.school && !!errors.school}
            >
              <FormLabel>Institui????o</FormLabel>
              <Input type='text' {...formAdd.register('school', { required: "Campo obrigat??rio" })} />
              {errors.school && <FormErrorMessage>
                {errors.school?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.degree && !!errors.degree}
            >
              <FormLabel>Grau</FormLabel>
              <Input type='text' {...formAdd.register('degree', { required: "Campo obrigat??rio" })} />
              {errors.degree && <FormErrorMessage>
                {errors.degree?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.grade && !!errors.grade}
            >
              <FormLabel>Gradua????o</FormLabel>
              <Input type='text' {...formAdd.register('grade', { required: "Campo obrigat??rio" })} />
              {errors.grade && <FormErrorMessage>
                {errors.grade?.message}
              </FormErrorMessage>}
            </FormControl>
            <Flex gap={4}>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.startDate && !!errors.startDate}
              >
                <FormLabel>Data de Inicio</FormLabel>
                <Input type='month' {...formAdd.register('startDate', { required: "Campo obrigat??rio" })} />
                {errors.startDate && <FormErrorMessage>
                  {errors.startDate?.message}
                </FormErrorMessage>}
              </FormControl>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.endDate && !!errors.endDate}
              >
                <FormLabel>Data de Fim</FormLabel>
                <Input type='month' {...formAdd.register('endDate', { required: "Campo obrigat??rio" })} />
                {errors.endDate && <FormErrorMessage>
                  {errors.endDate?.message}
                </FormErrorMessage>}
              </FormControl>

            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button bg="yellow.brand" color="gray.brand" type="submit">Adicionar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  </>
}

type ICertification = {
  name: string;
  organization: string;
  issueDate: string;
  expiresAt?: string;
  credentialId?: string;
  credentialUrl?: string;
}

const CertificationForm = () => {
  const { isOpen: isOpenAddCertificationModal, onOpen: onOpenAddCertificationModal, onClose: onCloseAddCertificationModal } = useDisclosure()
  const form = useFormContext<{
    certifications: ICertification[]
  }>()
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control: form.control,
    name: "certifications", // unique name for your Field Array
  });

  const formAdd = useForm({
    defaultValues: {
      name: "",
      organization: "",
      issueDate: "",
      expiresAt: undefined,
      credentialId: undefined,
      credentialUrl: undefined,
    }
  })
  const errors = formAdd.formState.errors;

  const handleAdd = useCallback((values: ICertification) => {
    append(values)
    onCloseAddCertificationModal()
    formAdd.reset();
  }, [append, formAdd, onCloseAddCertificationModal])

  return <>
    <Flex direction="column" w="full" h="full" alignSelf={"stretch"} gap={4}>
      <Flex p={8} boxShadow="md" bg="blackAlpha.500" direction="column" gap={4}>
        <Flex justifyContent={"space-between"} w="full">
          <Heading fontSize="2xl">Certificados e Licen??as</Heading>
          {/* <Button size="sm" bg="yellow.brand" color="gray.brand" rightIcon={<AddIcon />} onClick={onOpenAddCertificationModal}>
            Adicionar
          </Button> */}
        </Flex>
        <Divider />
        <Flex direction="column" gap={2}>
          {
            fields.map(cert => {
              const issuedAt = format(new Date(cert.issueDate), 'MMM yyyy')
              const expiresAt = cert.expiresAt && format(new Date(cert.expiresAt), 'MMM yyyy')
              return <Flex key={cert.id} direction="column">
                <Heading fontSize="lg">{cert.name}</Heading>
                <Text fontWeight={"light"}>Expedido {issuedAt} {expiresAt && ` - Expira????o ${expiresAt}`}</Text>
              </Flex>
            })
          }
        </Flex>
      </Flex>
    </Flex>
    <Modal isOpen={isOpenAddCertificationModal} onClose={onCloseAddCertificationModal}>
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader>Adicionar Certificado ou Licen??a</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formAdd.handleSubmit(handleAdd)}>
          <ModalBody display="flex" flexDirection={"column"} gap={2}>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.name && !!errors.name}
            >
              <FormLabel>Nome*</FormLabel>
              <Input type='text' {...formAdd.register('name', { required: "Campo obrigat??rio" })} />
              {errors.name && <FormErrorMessage>
                {errors.name?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.organization && !!errors.organization}
            >
              <FormLabel>Organiza????o*</FormLabel>
              <Input type='text' {...formAdd.register('organization', { required: "Campo obrigat??rio" })} />
              {errors.organization && <FormErrorMessage>
                {errors.organization?.message}
              </FormErrorMessage>}
            </FormControl>
            <Flex gap={4}>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.issueDate && !!errors.issueDate}
              >
                <FormLabel>Data de Expedi????o*</FormLabel>
                <Input type='month' {...formAdd.register('issueDate', { required: "Campo obrigat??rio" })} />
                {errors.issueDate && <FormErrorMessage>
                  {errors.issueDate?.message}
                </FormErrorMessage>}
              </FormControl>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.expiresAt && !!errors.expiresAt}
              >
                <FormLabel>Data de Expira????o</FormLabel>
                <Input type='month' {...formAdd.register('expiresAt')} />
                {errors.expiresAt && <FormErrorMessage>
                  {errors.expiresAt?.message}
                </FormErrorMessage>}
              </FormControl>
            </Flex>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.credentialId && !!errors.credentialId}
            >
              <FormLabel>ID credencial</FormLabel>
              <Input type='text' {...formAdd.register('credentialId', { required: "Campo obrigat??rio" })} />
              {errors.credentialId && <FormErrorMessage>
                {errors.credentialId?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.credentialUrl && !!errors.credentialUrl}
            >
              <FormLabel>URL Credencial</FormLabel>
              <Input type='text' {...formAdd.register('credentialUrl', { required: "Campo obrigat??rio" })} />
              {errors.credentialUrl && <FormErrorMessage>
                {errors.credentialUrl?.message}
              </FormErrorMessage>}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button bg="yellow.brand" color="gray.brand" type="submit">Adicionar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  </>
}

const ConhecimentosForm = ({
  conhecimentos
}: {
  conhecimentos: IConhecimentosAll
}) => {
  const form = useFormContext<IUserProfileForm>()
  const handleSelectedItemsChange = useCallback((selectedItems?: CUIAutoCompleteItem[]) => {
    form.setValue('knowledgeItems', selectedItems?.map(item => ({
      name: item.value,
    })) || [])
  }, [form])

  const selectedItems = form.watch('knowledgeItems').map(item => ({
    value: item.name,
    label: item.name,
  }))

  const toast = useToast();

  const handleSave = useCallback(async () => {
    const knowledgeItems = form.getValues().knowledgeItems;
    const result = await axios.post('/api/user/update-knowledge', {
      knowledgeItems: knowledgeItems.map(x => x.name)
    })
    // TODO: Add progress and error treatment
    if (result.data.success) {
      toast({
        status: `success`,
        title: `Conhecimentos atualizados!`
      })
    }
  }, [form, toast])

  return <>
    <Flex p={8} direction="column" w="full" h="full" alignSelf={"stretch"} gap={4} boxShadow="md" bg="blackAlpha.500">
      <Flex direction="column" gap={4}>
        <Flex justifyContent={"space-between"} w="full" direction="column">
          <Heading fontSize="2xl">Meus Conhecimentos</Heading>
        </Flex>
        <Divider />
        <Text>Selecione seus conhecimentos para mapear suas habilidades e compet??ncias</Text>
        <Box
          color="gray.brand"
        >
          <CUIAutoComplete
            label=""
            placeholder="Digite um conhecimento"
            disableCreateItem={true}
            items={conhecimentos.data.map(item => ({
              label: item.attributes.name,
              value: item.attributes.name
            }))}
            selectedItems={selectedItems}
            onSelectedItemsChange={(changes) =>
              handleSelectedItemsChange(changes.selectedItems)
            }
          />
        </Box>
      </Flex>
      <Button bg="yellow.brand" color="gray.brand" mx="auto" rightIcon={<MdSave />} onClick={handleSave}>
        Salvar
      </Button>
    </Flex>
  </>
}