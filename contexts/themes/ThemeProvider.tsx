import React from 'react'
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import theme from './theme';
const ThemeProvider = ({ children }) => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      {children}
    </ChakraProvider>
  );
}

export default ThemeProvider;
