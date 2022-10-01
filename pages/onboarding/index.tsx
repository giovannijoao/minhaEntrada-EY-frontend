import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

const tabs = [
  '1. Dados pessoais',
  '2. Dados escolares e profissionais',
  '3. Questionário de perfil',
]

export default function OnBoarding() {
  const form = useForm({
    defaultValues: {
      // 1. Dados pessoais
      firstName: "",
      lastName: "",
      birthDate: "",
      email: "",
      phoneNumber: "",
      password: "",
      passwordConfirm: "",
    }
  });
  const [tabIndex, setTabIndex] = useState(0)
  const handleNext = useCallback(async () => {
    const selectedTab = tabs[tabIndex];
    let result;
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

  const errors = form.formState.errors;
  console.log(errors)
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
      <form>
        <Tabs
          m={4}
          index={tabIndex} onChange={handleTabsChange}
        >
          <TabList>
            {tabs.map(item  => {
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
            <TabPanel>
              <p>two!</p>
            </TabPanel>
            <TabPanel>
              <p>three!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </form>
    </Flex>
  </>
}