import { useCallback, useEffect } from "react";
import Router from "next/router";
import useSWR from "swr";
import { User } from "../pages/api/user";
import axios from "axios";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}) {
  const {
    data: user,
    error,
  } = useSWR<User>("/api/user", (url) =>
    axios.get(url).then((res) => res.data)
  );

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo]);

  const logout = useCallback(async () => {
    await axios.post(`/api/logout`);
    Router.push("/login");
  }, []);

  return { user, error, logout };
}
