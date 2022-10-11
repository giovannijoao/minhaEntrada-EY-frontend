import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};
const themeCustomColors = {
  yellow: {
    brand: "#FFE600",
  },
  gray: {
    brand: "#2E2E38",
  },
};
const hoverVariants = {
  variants: {
    'default': {
      transition: "0.3s",
      _hover: {
        filter: "opacity(75%)",
      }
    },
    'card-hover': {
      transition: "0.3s",
      _hover: {
        filter: "opacity(95%)",
        boxShadow: "1px 3px 5px 2px black"
      }
    }
  }
}
const theme = extendTheme({
  components: {
    Link: hoverVariants,
    Button: hoverVariants
  },
  styles: {
    global: {
      "html, body": {
        backgroundColor: "gray.brand",
        lineHeight: "tall",
        color: "white",
      },
      option: {
        color: "white",
      },
    },
  },
  
  config,
  colors: themeCustomColors,
});

// as default export
export default theme

// as named export
export { theme, themeCustomColors };