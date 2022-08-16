import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Checkbox, CheckboxGroup, Flex, Heading, IconButton, Radio, RadioGroup, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { sessionOptions } from "../../../lib/session";
import { getAulaProgress } from "../../../prisma/aulaProgress";
import cmsClient from "../../../services/cmsClient";
import { Question } from "../../../types/Atividade";
import { IAulaFindOne } from "../../../types/Aula";

type IProps = {
  aula: IAulaFindOne
  progressId: string
}

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res,
  params
}) => {

  if (!req.session.user || !req.session.user.isLoggedIn) {
    return {
      redirect: {
        statusCode: 302,
        destination: '/login'
      }
    }
  }

  const {
    progressId,
  } = params as any;

  const progress = await getAulaProgress({
    userId: req.session.user.id,
    progressId
  });

  if (!progress) {
    return {
      redirect: {
        destination: '/jornadas',
        statusCode: 302
      }
    }
  }

  const [responseAula] = await Promise.all([
    cmsClient.get<IAulaFindOne>(`aulas/${progress?.aulaId}`, {
      params: {
        populate: 'atividade.questions.answers'
      }
    }).then(res => res.data),
  ])
  responseAula.data.attributes.atividade?.data.attributes.questions?.forEach((question: Question) => {
    question.correctAnswers = question.answers?.filter(x => x.isCorrect).length;
    question.answers?.forEach(answer => {
      answer.isCorrect = null;
    })
  })
  return {
    props: {
      aula: responseAula,
      progressId
    },
  };
}, sessionOptions)

export default function Page({
  aula,
  progressId
}: IProps) {
  const router = useRouter();
  const toast = useToast();
  const [selectedQuestionIndex, setSelectionQuestionIndex] = useState(0);
  const form = useForm({
    defaultValues: {
      answers: {

      }
    }
  });

  // const onFinished = useCallback(async () => {
  //   const response = await axios.post('/api/progress/update', {
  //     isFinished: true,
  //     progressId,
  //   })
  //   toast({
  //     title: 'Aula finalizada',
  //     description: 'Hora de fazer as atividades'
  //   })
  // }, [progressId, toast])

  const questions = useMemo(() => {
    return aula.data.attributes.atividade?.data.attributes.questions as Question[]
  },[aula.data.attributes.atividade?.data.attributes.questions])


  const selectedQuestion = useMemo(() => {
    const question = questions && questions[selectedQuestionIndex];
    return question;
  }, [questions, selectedQuestionIndex])

  const handleNext = useCallback(async () => {
    const result = await form.trigger(`answers.${selectedQuestion.id}.answer` as any)
    if (result) setSelectionQuestionIndex(state => state + 1)
  }, [form, selectedQuestion.id]);

  const handleSubmit = useCallback((values: {
    answers: {
      [key: number]: {
        answer: string;
      }
    }
  }) => {
    const answers = Object.entries(values.answers);

  }, []);

  return <Flex
    direction="column"
    h="100vh"
  >
    <Flex
      h={24}
      p={8}
      alignItems='center'
    >
      <Heading color="white">minhaEntrada EY</Heading>
    </Flex>
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
          {aula.data.attributes.name}
        </Heading>
        <Heading fontSize={"xl"}>
          Atividades
        </Heading>
      </Flex>
    </Flex>
    <Flex
      gap={4}
      direction="column"
    >
      <Flex wrap="wrap"
        flex={1}
        bgColor="gray.700"
        p={4}
        gap={2}
      >
        {
          aula.data.attributes.atividade?.data.attributes.questions?.map((question, i) => {
            return <Center
              key={question.id.toString().concat('-question-number')}
              w={10}
              h={10}
              bgColor={selectedQuestionIndex === i ? "yellow.brand" : 'gray.300'}
              color="gray.brand"
              rounded="full"
              fontWeight="bold"
              cursor={selectedQuestionIndex === i ? undefined : 'pointer'}
              onClick={() => setSelectionQuestionIndex(i)}

            >
              {(i + 1).toString().padStart(2, '0')}
            </Center>
          })
        }
      </Flex>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {selectedQuestion &&
            <Flex
              p={8}
              mr={36}
              gap={2}
              direction="column"
            >
              <Heading fontSize="lg">
                {selectedQuestion?.text}
              </Heading>
              <Text>Respostas {selectedQuestion.correctAnswers && selectedQuestion.correctAnswers > 1 ? `(Selecione ${selectedQuestion.correctAnswers})` : ''}</Text>
              {
                selectedQuestion.correctAnswers === 1 && <Controller
                  name={`answers.${selectedQuestion.id}.answer`}
                  rules={{
                    required: 'Selecione uma resposta'
                  }}
                  render={
                    ({
                      field: { value, onChange },
                      fieldState: { error }
                    }) => {
                      return <>
                        <RadioGroup
                          defaultValue={value}
                          onChange={onChange}
                          border={error ? '1px' : undefined}
                          borderColor={error ? 'yellow.brand' : undefined}
                          p={4}
                        >
                          <Stack>
                            {
                              selectedQuestion.answers?.map(answer => {
                                return <Radio key={answer.id} value={answer.id.toString()}>
                                  {answer.text}
                                </Radio>
                              })
                            }
                          </Stack>
                        </RadioGroup>
                        {error && <Text color="yellow.brand">{error.message}</Text>}
                      </>
                    }
                  }
                />
              }
              {
                selectedQuestion.correctAnswers === 2 && <Controller
                  name={`answers.${selectedQuestion.id}.answer`}
                  rules={{
                    required: 'Selecione uma resposta'
                  }}
                  render={
                    ({
                      field: { value, onChange },
                      fieldState: { error }
                    }) => {
                      return <>
                        <Box
                          border={error ? '1px' : undefined}
                          borderColor={error ? 'yellow.brand' : undefined}
                          p={4}
                        >
                          <CheckboxGroup
                            defaultValue={value}
                            onChange={onChange}
                          >
                            <Stack>
                              {
                                selectedQuestion.answers?.map(answer => {
                                  return <Checkbox key={answer.id} value={answer.id.toString()}>
                                    {answer.text}
                                  </Checkbox>
                                })
                              }
                            </Stack>
                          </CheckboxGroup>
                        </Box>
                        {error && <Text color="yellow.brand">{error.message}</Text>}
                      </>
                    }
                  }
                />
              }
              {selectedQuestionIndex < questions.length - 1  && <Button onClick={handleNext} colorScheme="yellow">Próxima</Button>}
              {selectedQuestionIndex === questions.length - 1 && <Button type="submit" colorScheme="yellow">Enviar</Button>}
            </Flex>
          }
        </form>
      </FormProvider>
    </Flex>
  </Flex>
}