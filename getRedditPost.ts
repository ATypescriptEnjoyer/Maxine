import axios from "axios";

interface Post {
  data: {
    domain: string;
    id: string;
    thumbnail_height: number;
    score: number;
    url: string;
    author: string;
    title: string;
    permalink: string;
  }
}

const template = `https://www.reddit.com/r/{0}/hot/.json`;

export const getRedditPost = async (
  subreddit: string,
  posted: string[]
): Promise<{
  id: string;
  url: string;
  author: string;
  authorUrl: string;
  title: string;
  permalink: string;
  domain: string;
}> => {
  const url = template.replace("{0}", subreddit);
  const { data } = await axios.get(url);
  const items = (data.data.children as Post[]).filter(
    (post: Post) =>
      post.data.domain !== "reddit.com" &&
      !posted?.includes(post.data.id) &&
      post.data.thumbnail_height !== null
  );
  if (items.length === 0) {
    return null;
  }
  const post = items.toSorted((a, b) => b.data.score - a.data.score)[0].data;
  return {
    id: post.id,
    url: post.url,
    author: post.author,
    authorUrl: `https://reddit.com/u/${post.author}`,
    title: post.title,
    permalink: `https://reddit.com${post.permalink}`,
    domain: post.domain
  };
};
