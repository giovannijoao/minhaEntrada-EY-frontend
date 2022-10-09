import { AddIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, StackDivider, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, TagLabel, TagLeftIcon, TagRightIcon, Text, useDisclosure, VStack } from "@chakra-ui/react";
import axios from "axios";
import { CUIAutoComplete, Item as CUIAutoCompleteItem } from "chakra-ui-autocomplete";
import format from "date-fns/format";
import { useRouter } from "next/router";
import { useCallback, useState, useEffect } from "react";
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";
import cmsClient from "../../services/cmsClient";
import { IConhecimentosAll } from "../../types/CMS/Conhecimento";
import { IQuestionarioPerfilFindOne } from "../../types/CMS/QuestionarioPerfil";

const tabs = [
  '1. Dados pessoais',
  '2. Dados escolares e profissionais',
  '3. Meus Conhecimentos',
  '4. Questionário de perfil',
]

export type IOnBoardingForm = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  education: IEducation[];
  certifications: {
    name: string;
    organization: string;
    expiresAt: string;
    issueDate: string;
    credentialId: string;
    credentialUrl: string;
  }[],
  perfil: {
    answers: {
      questionId: number | string
      answerId?: string
    }[]
  },
  knowledgeItems: {
    name: string;
  }[]
}

export async function getServerSideProps() {
  const [questionarioPerfil, conhecimentos] = await Promise.all([
    cmsClient.get<IQuestionarioPerfilFindOne>(`questionario-perfil`, {
      params: {
        populate: ['questions.answers']
      }
    }),
    cmsClient.get<IConhecimentosAll>(`conhecimentos`),
  ])
  return {
    props: {
      questionarioPerfil: questionarioPerfil.data,
      conhecimentos: conhecimentos.data,
    }, // will be passed to the page component as props
  }
}

export default function OnBoarding({
  questionarioPerfil,
  conhecimentos,
}: {
  questionarioPerfil: IQuestionarioPerfilFindOne
  conhecimentos: IConhecimentosAll
}) {
  const router = useRouter();
  const form = useForm<IOnBoardingForm>({
    defaultValues: {
      // 1. Dados pessoais
      firstName: "Agatha Carla",
      lastName: "Nina Farias",
      birthDate: "2000-07-04",
      email: `agatha-${(Math.random() * 1000).toFixed(0)}@gmail.com`,
      phoneNumber: "11912345678",
      password: "teste",
      passwordConfirm: "teste",
      // 2. Dados escolares e profissionais
      education: [{
        school: "FIAP",
        degree: "Bacharelado",
        grade: "Sistemas de Informação",
        startDate: "2019-03",
        endDate: "2022-12",
      }],
      certifications: [{
        name: "Cloud Fundamentals, Administration and Solution Architect",
        organization: "FIAP",
        issueDate: "2022-10",
        credentialId: "f3161ba6deb4dfa3980ff93922918b2f",
        credentialUrl: "https://on.fiap.com.br/pluginfile.php/1/local_nanocourses/certificado_nanocourse/25257/f3161ba6deb4dfa3980ff93922918b2f/certificado.png"
      }],
      perfil: {
        answers: questionarioPerfil.data.attributes.questions.map(question => ({
          questionId: question.id,
        }))
      },
      knowledgeItems: []
    }
  });
  const [tabIndex, setTabIndex] = useState(0)
  const handleNext = useCallback(async () => {
    const selectedTab = tabs[tabIndex];
    let result = true;
    if (selectedTab === "1. Dados pessoais") {
      result = await form.trigger([
        "firstName",
        "lastName",
        "birthDate",
        "email",
        "phoneNumber",
        "password",
        "passwordConfirm",
      ], {
        shouldFocus: true
      })
    }
    if (result) setTabIndex(state => state + 1)
  }, [form, tabIndex]);

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }

  const handleSubmit = useCallback(async (values: IOnBoardingForm) => {
    const result = await axios.post('/api/onboarding', values)
    // TODO: Add progress and error treatment
    if (result.data.success) {
      await axios.post('/api/users/sign-in', {
        email: values.email,
        password: values.password
      })
      router.push('/onboarding/welcome')
    }
  }, [router]);

  const errors = form.formState.errors;

  return <>
    <Flex
      direction="column"
      h="100vh"
    >
      <Flex
        h={36}
        p={8}
        justifyContent="center"
        backgroundColor="yellow.brand"
        direction="column"
      >
        <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Bem vindo!</Heading>
        <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">Vamos começar preenchendo alguns dados</Heading>
      </Flex>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Tabs
            m={4}
            index={tabIndex} onChange={handleTabsChange}
          >
            <TabList>
              {tabs.map(item => {
                return <Tab key={item} sx={{
                  _selected: {
                    color: 'yellow.brand'
                  }
                }}>{item}</Tab>
              })}
            </TabList>

            <TabPanels>
              <TabPanel display={"flex"} flexDirection="column" alignItems={"center"} gap={8}>
                <Flex direction="column" w={{
                  base: 'full',
                  md: "4xl"
                }} mx={'auto'} gap={4}>
                  <Flex gap={8} direction={{
                    base: 'column',
                    md: 'row'
                  }}>
                    <FormControl isInvalid={!form.formState.dirtyFields["firstName"] && !!errors["firstName"]}>
                      <FormLabel>Primeiro Nome</FormLabel>
                      <Input type='text' id="firstName" {...form.register('firstName', { required: "Campo obrigatório" })} />
                      {errors["firstName"] && <FormErrorMessage>
                        {errors["firstName"].message}
                      </FormErrorMessage>}
                    </FormControl>
                    <FormControl isInvalid={!form.formState.dirtyFields["lastName"] && !!errors["lastName"]}>
                      <FormLabel>Último Nome</FormLabel>
                      <Input type='text' id="lastName" {...form.register('lastName', { required: "Campo obrigatório" })} />
                      {errors["lastName"] && <FormErrorMessage>
                        {errors["lastName"].message}
                      </FormErrorMessage>}
                    </FormControl>
                    <FormControl isInvalid={!form.formState.dirtyFields["birthDate"] && !!errors["birthDate"]}>
                      <FormLabel>Data Nascimento</FormLabel>
                      <Input type='date' id="birthDate" {...form.register('birthDate', { required: "Campo obrigatório" })} />
                      {errors["birthDate"] && <FormErrorMessage>
                        {errors["birthDate"].message}
                      </FormErrorMessage>}
                    </FormControl>
                  </Flex>
                  <Flex gap={8} direction={{
                    base: 'column',
                    md: 'row'
                  }}>
                    <FormControl isInvalid={!form.formState.dirtyFields["email"] && !!errors["email"]}>
                      <FormLabel>Email</FormLabel>
                      <Input type='email' id="email" {...form.register('email', { required: "Campo obrigatório" })} />
                      {errors["email"] && <FormErrorMessage>
                        {errors["email"].message}
                      </FormErrorMessage>}
                    </FormControl>
                    <FormControl isInvalid={!form.formState.dirtyFields["phoneNumber"] && !!errors["phoneNumber"]}>
                      <FormLabel>Telefone Celular</FormLabel>
                      <Input type='number' id="phoneNumber" {...form.register('phoneNumber', { required: "Campo obrigatório" })} />
                      {errors["phoneNumber"] && <FormErrorMessage>
                        {errors["phoneNumber"].message}
                      </FormErrorMessage>}
                    </FormControl>
                  </Flex>
                  <Flex gap={8} direction={{
                    base: 'column',
                    md: 'row'
                  }}>
                    <FormControl isInvalid={!form.formState.dirtyFields["password"] && !!errors["password"]}>
                      <FormLabel>Senha</FormLabel>
                      <Input type='password' id="password" {...form.register('password', { required: "Campo obrigatório" })} />
                      {errors["password"] && <FormErrorMessage>
                        {errors["password"].message}
                      </FormErrorMessage>}
                    </FormControl>
                    <FormControl isInvalid={!!errors["passwordConfirm"]}>
                      <FormLabel>Confirme a senha</FormLabel>
                      <Input type='password' id="passwordConfirm" {...form.register('passwordConfirm', {
                        validate: (val) => {
                          console.log(148, val)
                          const password = form.watch('password');
                          if (password !== val) {
                            console.log(150, password, val)
                            return "As senhas não conferem"
                          }
                        }
                      })} />
                      {errors["passwordConfirm"] && <FormErrorMessage>
                        {errors["passwordConfirm"].message}
                      </FormErrorMessage>}
                    </FormControl>
                  </Flex>
                </Flex>
                <Button bg="yellow.brand" color="gray.brand" mx="auto" rightIcon={<ChevronRightIcon />} onClick={handleNext}>
                  Próxima Etapa
                </Button>
              </TabPanel>
              <TabPanel display={"flex"} flexDirection="column" alignItems={"center"} gap={8}>
                <Flex direction={{
                  base: 'column',
                  md: 'row'
                }} gap={6}>
                  <EducationForm />
                  <CertificationForm />
                </Flex>
                <Button bg="yellow.brand" color="gray.brand" mx="auto" rightIcon={<ChevronRightIcon />} onClick={handleNext}>
                  Próxima Etapa
                </Button>
              </TabPanel>
              <TabPanel display={"flex"} flexDirection="column" alignItems={"center"} gap={8}>
                <ConhecimentosForm conhecimentos={conhecimentos} />
                <Button bg="yellow.brand" color="gray.brand" mx="auto" rightIcon={<ChevronRightIcon />} onClick={handleNext}>
                  Próxima Etapa
                </Button>
              </TabPanel>
              <TabPanel>
                <PerfilQuestions questionarioPerfil={questionarioPerfil} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </form>
      </FormProvider>
    </Flex>
  </>
}

type IEducation = {
  school: string,
  degree: string,
  grade: string,
  startDate: string,
  endDate: string,
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
          <Heading fontSize="2xl">Formação Academica</Heading>
          <Button size="sm" bg="yellow.brand" color="gray.brand" rightIcon={<AddIcon />} onClick={onOpenAddEducationModal}>
            Adicionar
          </Button>
        </Flex>
        <Divider />
        <Flex direction="column" gap={2}>
          {
            fields.map(ed => {
              const startDate = format(new Date(ed.startDate), 'MMM yyyy')
              const endDate = format(new Date(ed.endDate), 'MMM yyyy')
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
        <ModalHeader>Adicionar Formação Academica</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formAdd.handleSubmit(handleAdd)}>
          <ModalBody display="flex" flexDirection={"column"} gap={2}>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.school && !!errors.school}
            >
              <FormLabel>Instituição</FormLabel>
              <Input type='text' {...formAdd.register('school', { required: "Campo obrigatório" })} />
              {errors.school && <FormErrorMessage>
                {errors.school?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.degree && !!errors.degree}
            >
              <FormLabel>Grau</FormLabel>
              <Input type='text' {...formAdd.register('degree', { required: "Campo obrigatório" })} />
              {errors.degree && <FormErrorMessage>
                {errors.degree?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.grade && !!errors.grade}
            >
              <FormLabel>Graduação</FormLabel>
              <Input type='text' {...formAdd.register('grade', { required: "Campo obrigatório" })} />
              {errors.grade && <FormErrorMessage>
                {errors.grade?.message}
              </FormErrorMessage>}
            </FormControl>
            <Flex gap={4}>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.startDate && !!errors.startDate}
              >
                <FormLabel>Data de Inicio</FormLabel>
                <Input type='month' {...formAdd.register('startDate', { required: "Campo obrigatório" })} />
                {errors.startDate && <FormErrorMessage>
                  {errors.startDate?.message}
                </FormErrorMessage>}
              </FormControl>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.endDate && !!errors.endDate}
              >
                <FormLabel>Data de Fim</FormLabel>
                <Input type='month' {...formAdd.register('endDate', { required: "Campo obrigatório" })} />
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
          <Heading fontSize="2xl">Certificados e Licenças</Heading>
          <Button size="sm" bg="yellow.brand" color="gray.brand" rightIcon={<AddIcon />} onClick={onOpenAddCertificationModal}>
            Adicionar
          </Button>
        </Flex>
        <Divider />
        <Flex direction="column" gap={2}>
          {
            fields.map(cert => {
              const issuedAt = format(new Date(cert.issueDate), 'MMM yyyy')
              const expiresAt = cert.expiresAt && format(new Date(cert.expiresAt), 'MMM yyyy')
              return <Flex key={cert.id} direction="column">
                <Heading fontSize="lg">{cert.name}</Heading>
                <Text fontWeight={"light"}>Expedido {issuedAt} {expiresAt && ` - Expiração ${expiresAt}`}</Text>
              </Flex>
            })
          }
        </Flex>
      </Flex>
    </Flex>
    <Modal isOpen={isOpenAddCertificationModal} onClose={onCloseAddCertificationModal}>
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader>Adicionar Certificado ou Licença</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formAdd.handleSubmit(handleAdd)}>
          <ModalBody display="flex" flexDirection={"column"} gap={2}>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.name && !!errors.name}
            >
              <FormLabel>Nome*</FormLabel>
              <Input type='text' {...formAdd.register('name', { required: "Campo obrigatório" })} />
              {errors.name && <FormErrorMessage>
                {errors.name?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.organization && !!errors.organization}
            >
              <FormLabel>Organização*</FormLabel>
              <Input type='text' {...formAdd.register('organization', { required: "Campo obrigatório" })} />
              {errors.organization && <FormErrorMessage>
                {errors.organization?.message}
              </FormErrorMessage>}
            </FormControl>
            <Flex gap={4}>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.issueDate && !!errors.issueDate}
              >
                <FormLabel>Data de Expedição*</FormLabel>
                <Input type='month' {...formAdd.register('issueDate', { required: "Campo obrigatório" })} />
                {errors.issueDate && <FormErrorMessage>
                  {errors.issueDate?.message}
                </FormErrorMessage>}
              </FormControl>
              <FormControl
                isInvalid={!formAdd.formState.dirtyFields.expiresAt && !!errors.expiresAt}
              >
                <FormLabel>Data de Expiração</FormLabel>
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
              <Input type='text' {...formAdd.register('credentialId', { required: "Campo obrigatório" })} />
              {errors.credentialId && <FormErrorMessage>
                {errors.credentialId?.message}
              </FormErrorMessage>}
            </FormControl>
            <FormControl
              isInvalid={!formAdd.formState.dirtyFields.credentialUrl && !!errors.credentialUrl}
            >
              <FormLabel>URL Credencial</FormLabel>
              <Input type='text' {...formAdd.register('credentialUrl', { required: "Campo obrigatório" })} />
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

const PerfilQuestions = ({
  questionarioPerfil
}: {
  questionarioPerfil: IQuestionarioPerfilFindOne
}) => {
  return <>
    <Flex direction="column" w="full" h="full" alignSelf={"stretch"} gap={4}>
      <Flex p={8} boxShadow="md" bg="blackAlpha.500" direction="column" gap={4}>
        <Flex justifyContent={"space-between"} w="full">
          <Heading fontSize="2xl">Responda as perguntas para definir um perfil</Heading>
        </Flex>
        <Divider />
        <Stack direction="column" gap={2} divider={<StackDivider borderColor='gray.50' />}>
          {questionarioPerfil.data.attributes.questions.map((question, i) => {
            return <Flex key={question.id} p={4} m={2} alignItems="center" justifyContent={"space-evenly"} direction={{
              base: 'column',
              md: 'row'
            }} gap={4}>
              <Text flex={1}>{question.text}</Text>
              <Controller
                name={`perfil.answers.${i}.answerId`}
                render={({ field }) => {
                  return <RadioGroup flex={1} {...field}>
                    <VStack m="auto" direction="row" alignItems={"start"}>
                      {question.answers.map(answer => {
                        return <Radio key={`${question.id}-${answer.id}`} value={answer.id.toString()}>{answer.text}</Radio>
                      })}
                    </VStack>
                  </RadioGroup>
                }}
              />
            </Flex>
          })}
        </Stack>
      </Flex>
      <Button bg="yellow.brand" color="gray.brand" mx="auto" rightIcon={<ChevronRightIcon />} type="submit">
        Finalizar
      </Button>
    </Flex>
  </>
}

const ConhecimentosForm = ({
  conhecimentos
}: {
  conhecimentos: IConhecimentosAll
}) => {
  const form = useFormContext<IOnBoardingForm>()
  const handleSelectedItemsChange = useCallback((selectedItems?: CUIAutoCompleteItem[]) => {
    form.setValue('knowledgeItems', selectedItems?.map(item => ({
      name: item.value,
    })) || [])
  }, [form])

  const selectedItems = form.watch('knowledgeItems').map(item => ({
    value: item.name,
    label: item.name,
  }))
  return <>
    <Flex direction="column" w="full" h="full" alignSelf={"stretch"} gap={4}>
      <Flex p={8} boxShadow="md" bg="blackAlpha.500" direction="column" gap={4}>
        <Flex justifyContent={"space-between"} w="full" direction="column">
          <Heading fontSize="2xl">Meus Conhecimentos</Heading>
        </Flex>
        <Divider />
        <Text>Selecione seus conhecimentos para mapear suas habilidades e competências</Text>
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
    </Flex>
  </>
}