import { getShareExtensionKey } from "expo-share-intent";

export function redirectSystemPath({ path }: { path: string; initial: string }) {
  try {
    if (path.includes(getShareExtensionKey())) {
      return "/review";
    }
    return path;
  } catch {
    return "/";
  }
}
