import { ActionPanel, Action, Detail, AI } from "@raycast/api";
import { useAI } from "@raycast/utils";
import { NewsSummaryProps } from "../types";
import { useFeedData } from "../hooks/useFeedData";
import { stripHtml } from "../utils/helpers";

export function NewsSummary({ feedKey = "en" }: NewsSummaryProps): JSX.Element {
    const { data: items = [], isLoading } = useFeedData(feedKey);

    const newsDigest = items
        .map((item) => `${item.title}\n${item.pubDate} ${item.link}\n${stripHtml(item.content)}`)
        .join("\n\n");

    const prompt = `Create a structured summary with "read more" links to meduza.io and date main news based on these articles. 
       Divide by categories (politics, society, economy, etc.). 
       Use emojis for news.
       Wish a good day by summarizing at the start.
       News:\n\n${newsDigest}
       
       Respond in ${feedKey} language`;

    const { data: summary, isLoading: isSummaryLoading } = useAI(prompt, {
        model: AI.Model["Anthropic_Claude_Sonnet"],
        creativity: 0.1,
        stream: true,
    });

    const title = feedKey === "ru" ? "Дайджест новостей" : "News Digest";
    const loadingText = feedKey === "ru" ? "Создаю сводку событий..." : "Generating news summary...";

    const markdown = `
# ${title}
${isSummaryLoading ? loadingText : ""}

${summary || ""}
  `;

    return (
        <Detail
            markdown={markdown}
            isLoading={isLoading || isSummaryLoading}
            actions={
                <ActionPanel>
                    <Action.Open
                        title={feedKey === "ru" ? "Чат" : "Chat"}
                        target={`raycast://extensions/raycast/raycast-ai/ai-chat?fallbackText=${summary}`}
                    />
                    <Action.CopyToClipboard
                        content={summary || ""}
                        title={feedKey === "ru" ? "Скопировать сводку" : "Copy Summary"}
                        shortcut={{ modifiers: ["cmd"], key: "s" }}
                    />
                </ActionPanel>
            }
        />
    );
} 