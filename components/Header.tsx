import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, HStack, Icon, IconButton, Link, Stack, useDisclosure } from '@chakra-ui/react';
import { ReactNode, useMemo } from 'react';
import { GiStonePath } from 'react-icons/gi';


const NavLink = ({ children, link }: { children: ReactNode, link: {
  href: string,
  title: string,
} }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.700',
    }}
    href={link.href}
    color="white"
    >
    {children}
  </Link>
);

export default function HeaderV2() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const Links = useMemo(() => {
    const links = [{
      title: 'Jornadas',
      href: '/jornadas'
    }]
    return links;
  }, []);

  return (
    <>
      <Box px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Flex  alignItems="center" gap={4}>
              <Icon as={GiStonePath} color='yellow.brand' h={8} w={8} />
              <Heading fontSize={"2xl"} color="yellow.brand">minhaEntrada EY</Heading>
            </Flex>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link.href} link={link}>{link.title}</NavLink>
              ))}
            </HStack>
          </HStack>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.href} link={link}>{link.title}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}