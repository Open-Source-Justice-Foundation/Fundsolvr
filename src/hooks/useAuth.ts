import { useEffect, useState } from "react";

import { type UserWithKeys } from "~/types";
import { useSession } from "next-auth/react";

const useAuth = () => {
  const [pubkey, setPubkey] = useState<string | undefined>(undefined);
  const [seckey, setSeckey] = useState<Uint8Array | undefined>(undefined);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const user = session?.user as UserWithKeys;
      setPubkey(user.publicKey);
      if (!user.secretKey) {
        return;
      }
      try {
        const parsedArray = JSON.parse(user.secretKey) as number[];
        const uint8Array = new Uint8Array(parsedArray);
        setSeckey(uint8Array);
      } catch (e) {
        console.error(e);
      }
    }
  }, [session]);

  return { pubkey, seckey };
};

export default useAuth;
