import '../styles/globals.css'
import type { AppProps } from 'next/app'
import ThemeProvider from '../contexts/themes/ThemeProvider'
import Layout from '../components/Layout'
import { NextPage } from 'next'
import { ReactElement, ReactNode } from 'react'

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout role={pageProps.role || 'user'}>{page}</Layout>)

  return <ThemeProvider>
    {getLayout(<Component {...pageProps} />)}
  </ThemeProvider>
}

export default MyApp
