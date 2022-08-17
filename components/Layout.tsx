// components/layout.js

import HeaderV2 from "./Header";

export default function Layout({ children }: any) {
  return (
    <>
      <HeaderV2 />
      <main>{children}</main>
    </>
  )
}