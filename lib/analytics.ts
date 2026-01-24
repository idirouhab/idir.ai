// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}

export const GA_EVENTS = {
  // Navigation events
  CLICK_CTA: 'click_cta',
  CLICK_NEWSLETTER: 'click_newsletter',
  CLICK_CONTACT: 'click_contact',

  // Engagement events
  NEWSLETTER_SUBMIT: 'newsletter_submit',
  CONTACT_SUBMIT: 'contact_submit',

  // Content events
  BLOG_POST_VIEW: 'blog_post_view',
  BLOG_SHARE: 'blog_share',

  // External link clicks
  EXTERNAL_LINK: 'external_link',
  SOCIAL_LINK: 'social_link',

  // Podcast events
  PODCAST_PLATFORM_CLICK: 'podcast_platform_click',

  // Speaking events
  SPEAKING_CTA_CLICK: 'speaking_cta_click',

  // Certificate events
  CERTIFICATE_VIEW: 'certificate_view',
  CERTIFICATE_VIEW_FIRST: 'certificate_view_first',
  CERTIFICATE_DOWNLOAD_PDF: 'certificate_download_pdf',
  CERTIFICATE_DOWNLOAD_JPG: 'certificate_download_jpg',
  CERTIFICATE_SHARE_LINKEDIN_CLICK: 'certificate_share_linkedin_click',
  CERTIFICATE_SHARE_LINKEDIN_COMPLETED: 'certificate_share_linkedin_completed',
} as const;

type EventName = typeof GA_EVENTS[keyof typeof GA_EVENTS];

interface EventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Track a custom event in Google Analytics
 * @param eventName - The name of the event to track
 * @param params - Additional parameters for the event
 */
export function trackEvent(eventName: EventName, params?: EventParams): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', eventName, params);
  } else {
    console.debug('Analytics not loaded yet:', eventName, params);
  }
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(ctaLabel: string, location: string): void {
  trackEvent(GA_EVENTS.CLICK_CTA, {
    event_category: 'engagement',
    event_label: ctaLabel,
    location,
  });
}

/**
 * Track newsletter subscription attempts
 */
export function trackNewsletterSubmit(
  email: string,
  language: string,
  source: string
): void {
  trackEvent(GA_EVENTS.NEWSLETTER_SUBMIT, {
    event_category: 'conversion',
    language,
    source,
  });
}

/**
 * Track contact form submissions
 */
export function trackContactSubmit(type: string): void {
  trackEvent(GA_EVENTS.CONTACT_SUBMIT, {
    event_category: 'conversion',
    event_label: type,
  });
}

/**
 * Track blog post views
 */
export function trackBlogPostView(
  postTitle: string,
  category: string,
  slug: string
): void {
  trackEvent(GA_EVENTS.BLOG_POST_VIEW, {
    event_category: 'content',
    event_label: postTitle,
    category,
    slug,
  });
}

/**
 * Track blog post shares
 */
export function trackBlogShare(platform: string, postTitle: string): void {
  trackEvent(GA_EVENTS.BLOG_SHARE, {
    event_category: 'engagement',
    event_label: postTitle,
    platform,
  });
}

/**
 * Track external link clicks
 */
export function trackExternalLink(url: string, linkText: string): void {
  trackEvent(GA_EVENTS.EXTERNAL_LINK, {
    event_category: 'engagement',
    event_label: linkText,
    url,
  });
}

/**
 * Track social media link clicks
 */
export function trackSocialLink(platform: string): void {
  trackEvent(GA_EVENTS.SOCIAL_LINK, {
    event_category: 'engagement',
    event_label: platform,
  });
}

/**
 * Track podcast platform clicks
 */
export function trackPodcastClick(platform: string): void {
  trackEvent(GA_EVENTS.PODCAST_PLATFORM_CLICK, {
    event_category: 'engagement',
    event_label: platform,
  });
}

/**
 * Track speaking CTA clicks
 */
export function trackSpeakingCTA(action: string): void {
  trackEvent(GA_EVENTS.SPEAKING_CTA_CLICK, {
    event_category: 'engagement',
    event_label: action,
  });
}

/**
 * Track certificate verification views
 */
export function trackCertificateView(
  certificateId: string,
  courseTitle: string,
  isFirstVisit: boolean
): void {
  trackEvent(
    isFirstVisit ? GA_EVENTS.CERTIFICATE_VIEW_FIRST : GA_EVENTS.CERTIFICATE_VIEW,
    {
      event_category: 'certificate',
      certificate_id: certificateId,
      course_title: courseTitle,
      is_first_visit: isFirstVisit,
    }
  );
}

/**
 * Track certificate downloads
 */
export function trackCertificateDownload(
  certificateId: string,
  courseTitle: string,
  format: 'pdf' | 'jpg'
): void {
  trackEvent(
    format === 'pdf'
      ? GA_EVENTS.CERTIFICATE_DOWNLOAD_PDF
      : GA_EVENTS.CERTIFICATE_DOWNLOAD_JPG,
    {
      event_category: 'certificate',
      certificate_id: certificateId,
      course_title: courseTitle,
      format: format,
    }
  );
}

/**
 * Track LinkedIn share actions for certificates
 */
export function trackCertificateShareLinkedIn(
  certificateId: string,
  courseTitle: string,
  action: 'click' | 'completed'
): void {
  trackEvent(
    action === 'click'
      ? GA_EVENTS.CERTIFICATE_SHARE_LINKEDIN_CLICK
      : GA_EVENTS.CERTIFICATE_SHARE_LINKEDIN_COMPLETED,
    {
      event_category: 'certificate',
      certificate_id: certificateId,
      course_title: courseTitle,
      action: action,
    }
  );
}
