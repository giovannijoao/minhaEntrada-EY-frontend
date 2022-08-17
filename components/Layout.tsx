// components/layout.js

import HeaderV2 from "./Header";

export default function Layout({ children, role }: any) {
  return (
    <>
      <HeaderV2 role={role} />
      <main>{children}</main>
    </>
  )
}