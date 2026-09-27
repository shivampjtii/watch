import crypto from "crypto";
import axios from "axios";

const ADMOB_KEY_URL =
  "https://www.gstatic.com/admob/reward/verifier-keys.json";

interface AdMobPublicKey {
  keyId: number;
  pem: string;
  base64?: string;
}

interface AdMobPublicKeyResponse {
  keys: AdMobPublicKey[];
}

interface CachedKeys {
  keys: Map<number, string>;
  expiresAt: number;
}

let cachedKeys: CachedKeys | null = null;

const CACHE_DURATION_MS =
  23 * 60 * 60 * 1000;

const getAdMobPublicKeys = async (): Promise<
  Map<number, string>
> => {
  const now = Date.now();

  if (
    cachedKeys &&
    cachedKeys.expiresAt > now
  ) {
    return cachedKeys.keys;
  }

  const response =
    await axios.get<AdMobPublicKeyResponse>(
      ADMOB_KEY_URL,
      {
        timeout: 10000,
      }
    );

  const keys = new Map<number, string>();

  for (const key of response.data.keys) {
    keys.set(key.keyId, key.pem);
  }

  if (keys.size === 0) {
    throw new Error(
      "No AdMob public keys were returned"
    );
  }

  cachedKeys = {
    keys,
    expiresAt:
      now + CACHE_DURATION_MS,
  };

  return keys;
};

export interface AdMobSsvPayload {
  ad_network?: string;
  ad_unit?: string;
  reward_amount: string;
  reward_item: string;
  transaction_id: string;
  timestamp: string;
  signature: string;
  key_id: string;
  user_id?: string;
  custom_data?: string;
}

export const verifyAdMobSsvSignature =
  async (
    rawQueryString: string,
    payload: AdMobSsvPayload
  ): Promise<boolean> => {
    if (!payload.signature) {
      throw new Error(
        "Missing AdMob signature"
      );
    }

    if (!payload.key_id) {
      throw new Error(
        "Missing AdMob key ID"
      );
    }

    const keyId = Number(payload.key_id);

    if (!Number.isInteger(keyId)) {
      throw new Error(
        "Invalid AdMob key ID"
      );
    }

    const publicKeys =
      await getAdMobPublicKeys();

    const publicKey = publicKeys.get(keyId);

    if (!publicKey) {
      throw new Error(
        `AdMob public key not found for key ID: ${keyId}`
      );
    }

    const signatureBuffer =
      Buffer.from(
        payload.signature,
        "base64url"
      );

    const signedData =
      rawQueryString;

    const verifier = crypto.createVerify(
      "SHA256"
    );

    verifier.update(signedData, "utf8");

    verifier.end();

    return verifier.verify(
      {
        key: publicKey,
        dsaEncoding: "der",
      },
      signatureBuffer
    );
  };