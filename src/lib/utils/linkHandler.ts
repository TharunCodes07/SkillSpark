import { Alert, Linking, Platform } from "react-native";

// Type definition for IntentLauncher
interface IntentLauncherType {
  startActivityAsync: (action: string, params?: any) => Promise<any>;
}

// Function to safely get IntentLauncher
const getIntentLauncher = (): IntentLauncherType | null => {
  try {
    // Use require in a way that won't break the build
    const IntentLauncher = eval('require')("expo-intent-launcher");
    return IntentLauncher;
  } catch (e) {
    console.log("expo-intent-launcher not available:", e);
    return null;
  }
};

export const openYouTubeLink = async (url: string): Promise<void> => {
  const debugMessages: string[] = [];

  try {
    const getVideoId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const videoId = getVideoId(url);
    if (!videoId) {
      throw new Error("Could not extract video ID from URL");
    }

    debugMessages.push(`Video ID extracted: ${videoId}`);
    debugMessages.push(`Platform: ${Platform.OS}`);
    
    const intentLauncher = getIntentLauncher();
    debugMessages.push(`IntentLauncher available: ${!!intentLauncher}`);

    if (Platform.OS === "android") {
      // Try YouTube app URLs in order of preference
      const androidApproaches = [
        `vnd.youtube:${videoId}`,
        `youtube://www.youtube.com/watch?v=${videoId}`,
        `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end`,
      ];

      // First, try to open with native YouTube app URLs
      for (const androidUrl of androidApproaches) {
        try {
          debugMessages.push(`Trying Android URL: ${androidUrl}`);
          const canOpen = await Linking.canOpenURL(androidUrl);
          debugMessages.push(`canOpenURL result: ${canOpen}`);
          if (canOpen) {
            await Linking.openURL(androidUrl);
            debugMessages.push(`✅ SUCCESS: Opened with ${androidUrl}`);
            return;
          }
        } catch (e) {
          const errorMsg = `❌ Failed: ${e instanceof Error ? e.message : String(e)}`;
          debugMessages.push(errorMsg);
          continue;
        }
      }

      // If URL schemes don't work, try to open YouTube app directly using IntentLauncher
      if (intentLauncher) {
        try {
          debugMessages.push("Trying IntentLauncher with startActivityAsync");
          await intentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: `https://www.youtube.com/watch?v=${videoId}`,
              flags: 1,
            }
          );
          debugMessages.push("✅ SUCCESS: Opened with IntentLauncher");
          return;
        } catch (e) {
          const errorMsg = `❌ IntentLauncher failed: ${e instanceof Error ? e.message : String(e)}`;
          debugMessages.push(errorMsg);
        }
      } else {
        debugMessages.push("IntentLauncher not available");
      }

      // Fallback to opening in browser
      const fallbackUrls = [
        `https://m.youtube.com/watch?v=${videoId}`,
        `https://www.youtube.com/watch?v=${videoId}`,
        url,
      ];

      for (const fallbackUrl of fallbackUrls) {
        try {
          debugMessages.push(`Trying fallback URL: ${fallbackUrl}`);
          const canOpen = await Linking.canOpenURL(fallbackUrl);
          debugMessages.push(`canOpenURL result: ${canOpen}`);
          if (canOpen) {
            await Linking.openURL(fallbackUrl);
            debugMessages.push(`✅ SUCCESS: Opened fallback URL`);
            return;
          }
        } catch (e) {
          const errorMsg = `❌ Fallback failed: ${e instanceof Error ? e.message : String(e)}`;
          debugMessages.push(errorMsg);
          continue;
        }
      }
    } else if (Platform.OS === "ios") {
      // Try iOS YouTube app URLs
      const iosApproaches = [
        `youtube://www.youtube.com/watch?v=${videoId}`,
        `youtube://${videoId}`,
      ];

      for (const iosUrl of iosApproaches) {
        try {
          debugMessages.push(`Trying iOS URL: ${iosUrl}`);
          const canOpen = await Linking.canOpenURL(iosUrl);
          debugMessages.push(`canOpenURL result: ${canOpen}`);
          if (canOpen) {
            await Linking.openURL(iosUrl);
            debugMessages.push(`✅ SUCCESS: Opened with ${iosUrl}`);
            return;
          }
        } catch (e) {
          const errorMsg = `❌ Failed: ${e instanceof Error ? e.message : String(e)}`;
          debugMessages.push(errorMsg);
          continue;
        }
      }

      // iOS fallback to browser
      const fallbackUrls = [`https://www.youtube.com/watch?v=${videoId}`, url];

      for (const fallbackUrl of fallbackUrls) {
        try {
          debugMessages.push(`Trying iOS fallback URL: ${fallbackUrl}`);
          const canOpen = await Linking.canOpenURL(fallbackUrl);
          debugMessages.push(`canOpenURL result: ${canOpen}`);
          if (canOpen) {
            await Linking.openURL(fallbackUrl);
            debugMessages.push(`✅ SUCCESS: Opened iOS fallback URL`);
            return;
          }
        } catch (e) {
          const errorMsg = `❌ iOS fallback failed: ${e instanceof Error ? e.message : String(e)}`;
          debugMessages.push(errorMsg);
          continue;
        }
      }
    } else {
      // Web platform - just open the URL
      try {
        await Linking.openURL(url);
        debugMessages.push("✅ SUCCESS: Opened on web platform");
        return;
      } catch (e) {
        debugMessages.push(
          `❌ Web platform failed: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }

    // Final fallback - show alert with debug info
    Alert.alert(
      "YouTube Link Debug - All Methods Failed",
      `Debug Log:\n${debugMessages.join("\n")}\n\nWould you like to try opening in browser anyway?`,
      [
        {
          text: "Try Browser Anyway",
          onPress: async () => {
            try {
              await Linking.openURL(
                `https://www.youtube.com/watch?v=${videoId}`
              );
            } catch (e) {
              Alert.alert(
                "Browser Error",
                `Failed to open in browser: ${e instanceof Error ? e.message : String(e)}`
              );
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  } catch (error) {
    console.error("Error in openYouTubeLink:", error);
    Alert.alert(
      "YouTube Error Debug",
      `Failed to open YouTube video.\n\nDebug Log:\n${debugMessages.join("\n")}\n\nError: ${error instanceof Error ? error.message : String(error)}`,
      [{ text: "OK", style: "default" }]
    );
  }
};

export const openExternalLink = async (url: string): Promise<void> => {
  const debugMessages: string[] = [];

  try {
    // Ensure URL has proper protocol
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
      debugMessages.push(`Added protocol to URL: ${url}`);
    }

    debugMessages.push(`Platform: ${Platform.OS}`);
    debugMessages.push(`Processing URL: ${url}`);

    // Handle YouTube URLs specially
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      debugMessages.push(
        "Detected YouTube URL, redirecting to YouTube handler"
      );
      await openYouTubeLink(url);
      return;
    }

    // Try to open the URL directly
    try {
      debugMessages.push("Checking if URL can be opened...");
      const supported = await Linking.canOpenURL(url);
      debugMessages.push(`canOpenURL result: ${supported}`);
      if (supported) {
        await Linking.openURL(url);
        debugMessages.push("✅ SUCCESS: Opened URL directly");
        return;
      }
    } catch (e) {
      const errorMsg = `❌ canOpenURL check failed: ${e instanceof Error ? e.message : String(e)}`;
      debugMessages.push(errorMsg);
    }

    // If canOpenURL fails, try opening anyway (sometimes it works even when canOpenURL returns false)
    try {
      debugMessages.push("Attempting direct URL opening anyway...");
      await Linking.openURL(url);
      debugMessages.push("✅ SUCCESS: Direct URL opening worked");
      return;
    } catch (e) {
      const errorMsg = `❌ Direct URL opening failed: ${e instanceof Error ? e.message : String(e)}`;
      debugMessages.push(errorMsg);
    }

    // Final fallback with debug info
    Alert.alert(
      "Link Error Debug - All Methods Failed",
      `Debug Log:\n${debugMessages.join("\n")}\n\nWould you like to try opening it anyway?`,
      [
        {
          text: "Try Anyway",
          onPress: async () => {
            try {
              await Linking.openURL(url);
            } catch (e) {
              Alert.alert(
                "Final Error Debug",
                `Cannot open link.\nURL: ${url}\nError: ${e instanceof Error ? e.message : String(e)}`
              );
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  } catch (error) {
    console.error("Error opening external link:", error);
    Alert.alert(
      "External Link Error Debug",
      `Failed to open link.\n\nDebug Log:\n${debugMessages.join("\n")}\n\nError: ${error instanceof Error ? error.message : String(error)}`,
      [{ text: "OK", style: "default" }]
    );
  }
};
