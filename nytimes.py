import requests
import feedparser
import feedgenerator
from datetime import datetime

# 纽约时报官方 RSS 源
URL = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"

def main():
    print("开始抓取纽约时报...")

    # 抓取
    response = requests.get(URL, timeout=20)
    response.raise_for_status()
    feed = feedparser.parse(response.content)

    # 新建 RSS
    new_feed = feedgenerator.Rss201rev2Feed(
        title="NYT World News",
        link="https://www.nytimes.com/",
        description="New York Times World News",
        language="en",
    )

    # 加入文章
    for entry in feed.entries[:15]:
        new_feed.add_item(
            title=entry.title,
            link=entry.link,
            description=entry.get("summary", "No description"),
            pubdate=entry.get("published_parsed", None),
        )

    # 保存文件
    with open("nytimes.xml", "w", encoding="utf-8") as f:
        new_feed.write(f, "utf-8")

    print("✅ 成功生成 nytimes.xml")

if __name__ == "__main__":
    main()
