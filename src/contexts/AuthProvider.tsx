import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { User } from "@/dtos/user";
import { handleAxiosError } from "@/lib/axios";
import axios from "axios";
import { useRouter } from "next/router";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<User>("/api/users/me");
        if (res.status === 200) {
          setUser(res.data);
        } else {
          throw new Error(`unknown status code ${res.status}`);
        }
      } catch (error) {
        handleAxiosError(error, (res) => {
          if (!res || res.status >= 500) {
            console.error(
              new Error("failed to authenticate", { cause: error })
            );
            toast.error("Couldn't authenticate, please try again", {
              richColors: true,
            });
          }
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo((): AuthContextType => {
    return { user, setUser };
  }, [user]);

  if (isLoading) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 grid place-items-center gap-2">
        <LoadingIndicator variant="bars" className="size-16" />
        <p className="animate-pulse text-xl font-semibold tracking-tight">
          Authenticating...
        </p>
      </div>
    );
  }

  if (user === null && router.pathname !== "/sign-in") {
    router.replace("/sign-in");
    return <></>;
  }

  if (user !== null && router.pathname === "/sign-in") {
    router.replace("/");
    return <></>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      `"useAuthContext" must be used within a "AuthContext.Provider"`
    );
  }
  return context;
}

export { AuthProvider, useAuthContext };
