import '../styles/globals.css'
import type { AppProps } from 'next/app'
import ThemeProvider from '../contexts/themes/ThemeProvider'
import Layout from '../components/Layout'
import { NextPage } from 'next'
import { ReactElement, ReactNode } from 'react'
import { motion } from 'framer-motion'

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout role={pageProps.role || 'user'}>{page}</Layout>)

  return <ThemeProvider>
    <motion.div
      key={router.route}
      initial="initial"
      animate="animate"
      variants={{
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
        },
      }}>
      {getLayout(<Component {...pageProps} />)}
    </motion.div>
  </ThemeProvider>
}

export default MyApp
