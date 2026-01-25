import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const sortedPosts = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'jonasb',
    description: 'Jonas Bengtsson\'s blog',
    site: context.site || 'https://jonasb.github.io',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/${post.slug}`,
    })),
  });
}
