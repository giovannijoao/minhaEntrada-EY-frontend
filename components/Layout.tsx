// components/layout.js

import { Box, Flex } from "@chakra-ui/react";
import HeaderV2 from "./Header";

export default function Layout({ children, role }: any) {
  return (
    <Flex direction="column" h="100vh">
      <HeaderV2 role={role} />
      <Box as="main" flex={1}>{children}</Box>
    </Flex>
  )
}