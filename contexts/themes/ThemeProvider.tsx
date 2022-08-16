import React from 'react'
import { ChakraProvider, ColorModeProvider, CSSReset } from "@chakra-ui/react";
import theme from './theme';
const ThemeProvider = ({ children }: any) => {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        {children}
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default ThemeProvider;
