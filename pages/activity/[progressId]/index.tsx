import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Checkbox, CheckboxGroup, Flex, Heading, IconButton, Radio, RadioGroup, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { withAuthSsr } from "../../../lib/withAuth";
import { getAulaProgress } from "../../../prisma/aulaProgress";
import cmsClient from "../../../services/cmsClient";
import { Question } from "../../../types/CMS/Atividade";
import { IAulaFindOne } from "../../../types/CMS/Aula";
import { ErrorMessagesToast } from "../../../utils/constants/ErrorMessagesToast";

type IProps = {
  aula: IAulaFindOne
  progressId: string
}

export const getServerSideProps = withAuthSsr(async ({
  req,
  res,
  params
}: GetServerSidePropsContext) => {

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
})

export default function Page({
  aula,
  progressId
}: IProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const [selectedQuestionIndex, setSelectionQuestionIndex] = useState(0);
  const form = useForm({
    defaultValues: {
      answers: {
      }
    }
  });

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

  const handleSubmit = useCallback(async (values: {
    answers: {
      [key: number]: {
        question: string
        answers: string | string[];
      }
    }
  }) => {
    setIsLoading(true);
    const answers = Object.values(values.answers);
    await axios.post(`/api/activity/answer/${progressId}`, {
      progressId,
      answers,
    }).then(resp => {
      router.replace(`/activity/${progressId}/result`)
    }).catch(error => {
      toast({
        position: "top-right",
        description: ErrorMessagesToast.atividades,
        status: "error"
      })

      setIsLoading(false)
    })
  }, [progressId, router, toast]);

  return <Flex
    direction="column"
    h="100vh"
  >

    <Flex
      h={36}
      p={8}
      alignItems="center"
      backgroundColor="yellow.brand"
      direction="row"
      gap={6}
      color={"gray.brand"}
    >
      {/* <IconButton onClick={router.back} icon={<ChevronLeftIcon />} aria-label="Voltar" /> */}
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
              <input type={"hidden"} value={selectedQuestion.id} {...form.register(`answers.${selectedQuestion.id}.question` as any, {
                setValueAs: v => v ? Number(v) : v
              })} />
              <input type={"hidden"} value={progressId} {...form.register(`answers.${selectedQuestion.id}.aulaProgressId` as any)} />
              <input type={"hidden"} value={aula.data.id} {...form.register(`answers.${selectedQuestion.id}.aulaId` as any, {
                setValueAs: v => v ? Number(v) : v
              })} />
              {
                selectedQuestion.correctAnswers === 1 && <Controller
                  name={`answers.${selectedQuestion.id}.answers`}
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
                          onChange={v => onChange([Number(v)])}
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
                  name={`answers.${selectedQuestion.id}.answers`}
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
                            onChange={v => onChange(v.map(x => Number(x)))}
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
              {selectedQuestionIndex < questions.length - 1  && <Button onClick={handleNext} colorScheme="yellow">Pr??xima</Button>}
              {selectedQuestionIndex === questions.length - 1 && <Button type="submit" colorScheme="yellow" isLoading={isLoading}>Enviar</Button>}
            </Flex>
          }
        </form>
      </FormProvider>
    </Flex>
  </Flex>
}