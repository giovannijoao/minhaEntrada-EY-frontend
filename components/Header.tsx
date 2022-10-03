import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, Flex, Heading, HStack, Icon, IconButton, Link, Menu, MenuButton, MenuItem, MenuList, Stack, useDisclosure } from '@chakra-ui/react';
import { ReactNode, useMemo } from 'react';
import { GiStonePath } from 'react-icons/gi';
import useUser from '../lib/useUser';


const NavLink = ({ children, link }: {
  children: ReactNode, link: {
    href: string,
    title: string,
  }
}) => (
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

export default function HeaderV2({
  role,
}: {
  role: string
}) {
  const { user, logout } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const Links = useMemo(() => {
    const links = [{
      title: 'Entrar',
      href: '/login',
      role: 'unauthenticated'
    }, {
      title: 'Jornadas',
      href: '/jornadas',
      role: 'user'
    }, {
      title: 'Pessoas',
      href: '/admin/pessoas',
      role: 'admin'
    }, {
      title: 'Jornadas',
      href: '/admin/jornadas',
      role: 'admin'
    }]
    return links.filter(x => {
      if (x.role === "unauthenticated" && !user?.isLoggedIn) return true;
      let result = x.role === role
      if (result && x.role === "user") result = result && !!user?.isLoggedIn;
      return result;
    });
  }, [role, user?.isLoggedIn]);

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
            <Flex alignItems="center" gap={4}>
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
          {user?.isLoggedIn && <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    name={`${user.firstName} ${user.lastName}`}
                  />
                </MenuButton>
                <MenuList bgColor="gray.brand">
                  {/* <Link href="/user"><MenuItem>Perfil</MenuItem></Link> */}
                  <MenuItem onClick={logout} _hover={{
                    bg: 'whiteAlpha.300'
                  }}>Sair</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>}
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