import { NextRequest } from 'next/server';
import { getPublishedPosts } from '@/lib/blog';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const locale = params.locale as 'en' | 'es';
  const posts = await getPublishedPosts(locale, 50); // Last 50 posts

  const baseUrl = 'https://idir.ai';
  const feedUrl = `${baseUrl}/${locale}/blog/rss.xml`;
  const blogUrl = `${baseUrl}/${locale}/blog`;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Idir Ouhab Meskine - Blog</title>
    <link>${blogUrl}</link>
    <description>Thoughts on AI, automation, and the future of work</description>
    <language>${locale}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/${locale}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${locale}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      <author>hello@idir.ai (Idir Ouhab Meskine)</author>
      ${post.tags?.map((tag) => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
