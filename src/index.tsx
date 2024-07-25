import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { format } from "timeago.js";
import Parser from "rss-parser";

const parser = new Parser();

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  icon: string;
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
    fetchFeed('https://meduza.io/rss/all');
  });

  async function fetchFeed(url: string) {
    setLoading(true);
    try {
      const feed = await parser.parseURL(url);
      setItems(feed.items.map((item) => ({
        icon: item.icon || "icon.png",
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
      })));
    } catch (error) {
      console.error(error);
      showToast(Toast.Style.Failure, "Failed to fetch feed");
    } finally {
      setLoading(false);
    }
  }


  return (
    <List isLoading={loading}>
      {items.map((item) => (
        <List.Item
          key={item.link}
          icon={item.icon}
          title={item.title}
          // subtitle={шit
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