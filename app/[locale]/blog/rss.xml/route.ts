import { NextRequest } from 'next/server';
import { getPublishedPosts } from '@/lib/blog';
import { getSiteUrl } from '@/lib/site-config';

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const locale = params.locale as 'en' | 'es';
  const posts = await getPublishedPosts(locale, 50); // Last 50 posts

  const baseUrl = getSiteUrl();
  const feedUrl = `${baseUrl}/${locale}/blog/rss.xml`;
  const blogUrl = `${baseUrl}/${locale}/blog`;

  const feedTitle = locale === 'es'
    ? 'Blog de Idir Ouhab Meskine - IA, Automatización y Tecnología'
    : 'Idir Ouhab Meskine\'s Blog - AI, Automation & Tech';

  const feedDescription = locale === 'es'
    ? 'Pensamientos sobre IA, automatización y el futuro del trabajo'
    : 'Thoughts on AI, automation, and the future of work';

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>${locale}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>${escapeXml(feedTitle)}</title>
      <link>${blogUrl}</link>
    </image>
    <managingEditor>hello@idir.ai (Idir Ouhab Meskine)</managingEditor>
    <webMaster>hello@idir.ai (Idir Ouhab Meskine)</webMaster>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/${locale}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${baseUrl}/${locale}/blog/${escapeXml(post.slug)}</guid>
      <description><![CDATA[${post.excerpt || post.meta_description || ''}]]></description>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author_name || 'Idir Ouhab Meskine'}]]></dc:creator>
      <author>hello@idir.ai (Idir Ouhab Meskine)</author>
      ${post.category ? `<category><![CDATA[${post.category}]]></category>` : ''}
      ${post.tags?.map((tag) => `<category><![CDATA[${tag}]]></category>`).join('\n      ') || ''}
      ${post.cover_image ? `<enclosure url="${escapeXml(post.cover_image)}" type="image/jpeg"/>` : ''}
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
