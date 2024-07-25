import { ActionPanel, Action, List, showToast, Toast, Cache, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { format } from "timeago.js";
import Parser from "rss-parser";

const parser = new Parser();
const cache = new Cache();

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  icon: string;
}

interface Preferences {
  feedUrl: string;
}

// Функция для форматирования времени
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'ru'); // 'ru' для русского языка
}

export default function Command() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);


  async function fetchFeed() {
    setLoading(true);

    const feedUrl = "https://meduza.io/rss/all"

    try {
      // Пытаемся получить данные из кэша
      const cachedData = cache.get("feedItems");
      if (cachedData) {
        setItems(JSON.parse(cachedData));
        setLoading(false);
      }

      // Загружаем свежие данные
      const feed = await parser.parseURL(feedUrl);
      const newItems = feed.items.map((item) => ({
        icon: item.icon || "icon.png",
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
      }));

      setItems(newItems);

      showToast(Toast.Style.Success, "Updated feed");
      // Кэшируем новые данные
      cache.set("feedItems", JSON.stringify(newItems)); // Кэш на 5 минут
    } catch (error) {
      console.error(error);
      showToast(Toast.Style.Failure, "Failed to fetch feed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder="Search articles..."
      actions={
        <ActionPanel>
          <Action title="Refresh" onAction={fetchFeed} />
        </ActionPanel>
      }
    >
      {items.map((item) => (
        <List.Item
          key={item.link}
          icon={item.icon}
          title={item.title}
          accessories={[{ text: formatTimeAgo(item.pubDate) }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={item.link} />
              <Action.CopyToClipboard content={item.link} title="Copy Link" />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}